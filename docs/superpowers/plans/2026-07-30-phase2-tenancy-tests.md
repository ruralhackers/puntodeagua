# Fase 2 — Tenancy: tests y cierre de agujeros

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar el aislamiento entre comunidades en la capa tRPC, con un test de caso de uso que precede a cada arreglo y queda como red permanente.

**Architecture:** Se construye un nivel de test nuevo — caso de uso — que invoca los procedures tRPC en proceso vía el `createCaller` ya exportado, contra una base Postgres de test separada. Cada tarea sigue el ciclo test rojo → arreglo → verde → commit, sobre un endpoint o un grupo de endpoints del mismo router. El mecanismo de arreglo es un `communityScopedProcedure` que inyecta la comunidad ya verificada, de modo que el acceso cruzado pase a ser imposible de expresar en vez de meramente comprobado.

**Tech Stack:** Bun 1.3.14 (`bun test`), tRPC 11 (`createCallerFactory`), Prisma 6.16 + Postgres 15, Zod, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-07-30-testing-strategy-design.md`

## Global Constraints

- Runtime y package manager: **bun**. Nunca `npm`/`yarn`/`pnpm`.
- `bun run test:unit` debe quedar en **0 fail** al final de cada tarea. Cuenta actual: 281 pass / 32 archivos.
- `bun run test:integration` debe quedar en **0 fail** al final de cada tarea, y con **cero `it.failing` sin comentario `HOLE:`**.
- Formato/lint: `bunx biome check --write <archivos>` antes de cada commit. CI corre `biome ci --diagnostic-level=error`.
- Idioma de comentarios en código: **inglés**. Los nombres de test empiezan por `should`.
- Convenciones de test del proyecto (`.cursor/.test-conventions.mdc`): comentarios AAA explícitos (`// Arrange`, `// Act`, `// Assert`), sin describes anidados por categoría, mocks vía helpers, **errores primero y después casos de éxito**.
- Ningún test toca la base de desarrollo. El harness aborta si `DATABASE_URL` no termina en `_test`.
- Cuando una tarea cambia la firma de un procedure, actualiza sus llamadas en el frontend en la misma tarea y lo verifica con el typecheck del webapp.
- Commits en inglés, convencionales (`test:`, `fix:`, `feat:`, `ci:`, `chore:`), uno por tarea salvo indicación distinta.

## Contexto de ramas

Este plan se ejecuta sobre `fix/backend-phase1-cleanup` (PR #5), que ya contiene el plan de Fase 1 y el spec de esta fase. Si Fase 1 se implementa primero, este plan sigue siendo válido: no hay solape de archivos salvo `.github/workflows/tests.yml`, que ambos tocan.

## Restricciones descubiertas que condicionan la implementación

Cuatro hechos verificados. No los re-descubras:

1. **`createCaller` ya existe**: `apps/webapp/src/server/api/root.ts:39`. Invoca procedures en proceso, sin HTTP ni Next.
2. **No se puede inyectar la base por contexto.** Los factories (`WaterAccountFactory`, `CommunityFactory`, …) importan `client as prisma` de `@pda/database` **en carga de módulo**, y los routers ignoran `ctx.db` (sólo `auth.ts` lo usa). `DATABASE_URL` tiene que apuntar a la base de test **antes de cualquier import**: de ahí `bun --env-file=.env.test test`.
3. **No hay carpeta `migrations`** (el repo usa `db push`). El DDL se genera con `bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`, que funciona **sin conexión a ninguna base**.
4. **`it.failing` en bun 1.3.14**: un `expect` que falla dentro cuenta como *pass*; cuando el bug se arregla, el test se pone **rojo**. CI fija bun 1.2.21 — hay que subirlo a 1.3.14.

## Inventario de endpoints

52 endpoints en 9 routers. Clasificación que guía las tareas:

| Router | Endpoints | Estado de tenancy |
|---|---|---|
| `table.ts` | 1 | **Crítico** — Task 3 |
| `user.ts` | 3 | Roto (valida `uuid` contra ids `cuid`) + sin scope — Task 11 |
| `water-account.ts` | 16 | 6 mutaciones y 2 lecturas sin scope — Tasks 5 y 6 |
| `community.ts` | 12 | 8 sin scope — Task 7 |
| `incident.ts` | 8 | 6 sin scope — Task 8 |
| `analysis.ts` | 5 | 3 sin scope — Task 9 |
| `provider.ts` | 7 | 6 sin scope — Task 10 |
| `fees.ts` | 7 | **Correctos** (patrón de referencia) — Task 12 sólo los migra |
| `auth.ts` | 2 | `publicProcedure` por diseño — fuera de alcance |

## File Structure

**Se crea `packages/testing` (`@pda/testing`)** — paquete privado de desarrollo. Un archivo por responsabilidad, para que crezca sin volverse un monolito:

- `db-harness.ts` — ciclo de vida de la base de test: crear, aplicar DDL, truncar. Incluye la guarda de seguridad.
- `factories.ts` — datos persistidos y encadenados. No sabe nada de tRPC.
- `session.ts` — contextos tRPC falsos por rol. No sabe nada de la base.
- `index.ts` — barrel.
- `package.json`

**Se crean los tests** en `apps/webapp/src/server/api/__tests__/`, un archivo por router: `table.test.ts`, `water-account.test.ts`, `community.test.ts`, `incident.test.ts`, `analysis.test.ts`, `provider.test.ts`, `user.test.ts`, `fees.test.ts`, `roles.test.ts`.

**Se modifican:**
- `apps/webapp/src/server/api/trpc.ts` — añade `communityScopedProcedure`.
- Los 8 routers con endpoints a cerrar.
- `apps/webapp/src/server/repositories/table-proxy.repository.ts` — scope por modelo.
- `.github/workflows/tests.yml` — deja de correr `bun test` a secas.
- `.github/workflows/integration.yml` — nuevo, con service container.
- `package.json` (raíz) y `apps/webapp/package.json`.
- Los componentes del frontend cuyas llamadas cambien de firma.

---

### Task 1: Harness de base de test, sesiones falsas y pipeline verde

Esta tarea no cierra ningún agujero: monta la infraestructura y la prueba de punta a punta con un único test. Si el pipeline no queda verde acá, ninguna tarea posterior es fiable.

**Files:**
- Create: `packages/testing/package.json`, `packages/testing/db-harness.ts`, `packages/testing/session.ts`, `packages/testing/index.ts`
- Create: `.env.test`
- Create: `apps/webapp/src/server/api/__tests__/smoke.test.ts`
- Create: `.github/workflows/integration.yml`
- Modify: `package.json` (raíz, `scripts`), `apps/webapp/package.json` (devDependencies), `.github/workflows/tests.yml`

**Interfaces:**
- Consumes: `createCaller` de `apps/webapp/src/server/api/root.ts`; `client as prisma` de `@pda/database`.
- Produces:
  - `ensureTestDatabase(): Promise<void>`
  - `applySchema(): Promise<void>`
  - `resetDatabase(): Promise<void>`
  - `setupTestDatabase(): Promise<void>` — hace las tres en orden; es la que usan los tests.
  - `asAdmin(): TestContext`
  - `asCommunityAdminOf(communityId: string): TestContext`
  - `asManagerOf(communityId: string): TestContext`
  - `asReaderOf(communityId: string): TestContext`
  - `asAnonymous(): TestContext`
  - `type TestContext = { db: typeof prisma; session: Session | null; headers: Headers }`

- [ ] **Step 1: Crear el manifest del paquete**

`packages/testing/package.json`:

```json
{
  "name": "@pda/testing",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "dependencies": {
    "@pda/common": "workspace:*",
    "@pda/database": "workspace:*",
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/pg": "^8.15.5"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Escribir el harness de base**

`packages/testing/db-harness.ts`:

```typescript
import { execSync } from 'node:child_process'
import { client as prisma } from '@pda/database'

// Refuses to run against anything that is not a test database. The production
// URL lives commented out in .env.local one character away from being active,
// and packages/database has a db:sync:force script that runs --force-reset.
function assertTestDatabase(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Run tests with --env-file=.env.test')
  }
  const databaseName = url.split('/').pop()?.split('?')[0]
  if (!databaseName?.endsWith('_test')) {
    throw new Error(
      `Refusing to run tests against "${databaseName}": the database name must end in _test`
    )
  }
  return databaseName
}

export async function ensureTestDatabase(): Promise<void> {
  const databaseName = assertTestDatabase()
  const adminUrl = (process.env.DATABASE_URL as string).replace(`/${databaseName}`, '/postgres')

  // CREATE DATABASE cannot run inside a transaction, and Prisma cannot connect
  // to a database that does not exist yet, so this goes through psql-less raw pg.
  const { Client } = await import('pg')
  const client = new Client({ connectionString: adminUrl })
  await client.connect()
  try {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      databaseName
    ])
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`)
    }
  } finally {
    await client.end()
  }
}

export async function applySchema(): Promise<void> {
  assertTestDatabase()
  // The repo has no migrations directory (it uses db push), so the DDL is
  // generated from the schema on every run and can never drift.
  const ddl = execSync(
    'bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
    { cwd: `${import.meta.dir}/../database`, encoding: 'utf-8' }
  )
  await prisma.$executeRawUnsafe(ddl)
}

export async function resetDatabase(): Promise<void> {
  assertTestDatabase()
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `
  if (tables.length === 0) return
  const list = tables.map((t) => `"public"."${t.tablename}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`)
}

let schemaApplied = false

export async function setupTestDatabase(): Promise<void> {
  await ensureTestDatabase()
  if (!schemaApplied) {
    await applySchema()
    schemaApplied = true
  }
  await resetDatabase()
}
```

- [ ] **Step 3: Escribir las sesiones falsas**

La forma del usuario está fijada por `apps/webapp/src/server/auth/config.ts:11-18`: `user: { …, community: CommunityDto | null, roles: string[] }`.

`packages/testing/session.ts`:

```typescript
import { client as prisma } from '@pda/database'

interface TestSessionUser {
  id: string
  name: string | null
  email: string | null
  roles: string[]
  community: { id: string; name: string; waterLimitRule: { type: string; value: number } } | null
}

export interface TestContext {
  db: typeof prisma
  session: { user: TestSessionUser; expires: string } | null
  headers: Headers
}

const FAR_FUTURE = '2099-01-01T00:00:00.000Z'

function contextFor(roles: string[], communityId: string | null): TestContext {
  return {
    db: prisma,
    session: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        roles,
        community: communityId
          ? {
              id: communityId,
              name: 'Test Community',
              waterLimitRule: { type: 'PERSON_BASED', value: 100 }
            }
          : null
      },
      expires: FAR_FUTURE
    },
    headers: new Headers()
  }
}

export function asAdmin(communityId: string | null = null): TestContext {
  return contextFor(['ADMIN'], communityId)
}

export function asCommunityAdminOf(communityId: string): TestContext {
  return contextFor(['COMMUNITY_ADMIN'], communityId)
}

export function asManagerOf(communityId: string): TestContext {
  return contextFor(['MANAGER'], communityId)
}

export function asReaderOf(communityId: string): TestContext {
  return contextFor(['WATER_METER_READER'], communityId)
}

export function asAnonymous(): TestContext {
  return { db: prisma, session: null, headers: new Headers() }
}
```

- [ ] **Step 4: Barrel**

`packages/testing/index.ts`:

```typescript
export * from './db-harness'
export * from './session'
```

- [ ] **Step 5: Crear `.env.test`**

Las credenciales son las del `docker-compose.yml`, que ya están en claro en el repo. Sólo cambia el nombre de la base.

`.env.test`:

```
DATABASE_URL=postgresql://puntodeagua2_user:puntodeagua2_password@localhost:5559/puntodeagua2_test
NODE_ENV=test
NEXTAUTH_SECRET=test-secret-not-used
SKIP_ENV_VALIDATION=1
```

- [ ] **Step 6: Declarar la dependencia en el webapp**

En `apps/webapp/package.json`, dentro de `"devDependencies"`, añadir:

```json
    "@pda/testing": "workspace:*",
```

Run: `bun install`
Run: `ls apps/webapp/node_modules/@pda/`
Expected: aparece `testing`.

- [ ] **Step 7: Añadir los scripts**

En `package.json` de la raíz, dentro de `"scripts"`:

```json
    "test:unit": "bun test packages apps/webapp/src/lib",
    "test:integration": "bun --env-file=.env.test test apps/webapp/src/server --concurrency 1",
    "test:all": "bun run test:unit && bun run test:integration",
```

- [ ] **Step 8: Escribir el smoke test**

Este test prueba las cuatro piezas a la vez: que la base se crea, que el DDL se aplica, que `createCaller` funciona con una sesión falsa, y que la guarda de seguridad está activa.

`apps/webapp/src/server/api/__tests__/smoke.test.ts`:

```typescript
import { beforeAll, describe, expect, it } from 'bun:test'
import { client as prisma } from '@pda/database'
import { asAnonymous, asManagerOf, setupTestDatabase } from '@pda/testing'
import { createCaller } from '@/server/api/root'

describe('test harness', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should refuse to run against a database not ending in _test', () => {
    // Arrange
    const url = process.env.DATABASE_URL ?? ''

    // Act
    const databaseName = url.split('/').pop()?.split('?')[0]

    // Assert
    expect(databaseName).toEndWith('_test')
  })

  it('should reject an unauthenticated call', async () => {
    // Arrange
    const caller = createCaller(asAnonymous())

    // Act & Assert
    await expect(caller.community.getWaterPoints({ zoneIds: [] })).rejects.toThrow()
  })

  it('should have applied the schema', async () => {
    // Arrange & Act
    const count = await prisma.community.count()

    // Assert
    expect(count).toBe(0)
  })

  it('should call a procedure with a fake staff session', async () => {
    // Arrange
    const community = await prisma.community.create({
      data: { name: 'Smoke Community', waterLimitRule: { type: 'PERSON_BASED', value: 100 } }
    })
    const caller = createCaller(asManagerOf(community.id))

    // Act
    const zones = await caller.community.getCommunityZones({ id: community.id })

    // Assert
    expect(zones).toEqual([])
  })
})
```

- [ ] **Step 9: Ejecutar el smoke test**

Run: `bun run dbs` (levanta Postgres si no está)
Run: `bun run test:integration`
Expected: `4 pass`, `0 fail`.

Si falla en `applySchema` con un error de sintaxis SQL, el DDL contiene sentencias que `$executeRawUnsafe` no acepta en bloque; en ese caso partí el DDL por `;` y ejecutá sentencia a sentencia, filtrando las vacías.

- [ ] **Step 10: Arreglar el CI existente antes de que se rompa**

`.github/workflows/tests.yml:23` corre `bun test` a secas. Ahora que existen tests bajo `apps/webapp/src/server`, ese job los recogería sin base y fallaría. Reemplazar:

```yaml
      - name: Run tests
        run: bun test
```

por:

```yaml
      - name: Run unit tests
        run: bun run test:unit
```

Y en el mismo archivo, subir la versión de bun:

```yaml
          bun-version: "1.3.14"
```

- [ ] **Step 11: Crear el job de integración**

`.github/workflows/integration.yml`:

```yaml
name: Integration Tests

on:
  push:
  pull_request:

jobs:
  integration:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: puntodeagua2_test
          POSTGRES_USER: puntodeagua2_user
          POSTGRES_PASSWORD: puntodeagua2_password
        ports:
          - 5559:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: "1.3.14"

      - name: Install dependencies
        run: bun install

      - name: Generate Prisma client
        run: bun run -F @pda/database generate

      - name: Run integration tests
        run: bun run test:integration
```

- [ ] **Step 12: Verificar que los unit tests siguen intactos**

Run: `bun run test:unit`
Expected: `281 pass`, `0 fail`.

- [ ] **Step 13: Commit**

```bash
bunx biome check --write packages/testing apps/webapp/src/server/api/__tests__
git add packages/testing .env.test apps/webapp/package.json package.json bun.lock \
        apps/webapp/src/server/api/__tests__ .github/workflows
git commit -m "test: add integration test harness with isolated test database"
```

---

### Task 2: Factories de datos

Sin esto, cada test de tenancy son 40 líneas de `prisma.create` encadenados y nadie los escribe. Con esto son 3.

**Files:**
- Create: `packages/testing/factories.ts`
- Modify: `packages/testing/index.ts`
- Modify: `apps/webapp/src/server/api/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: `client as prisma` de `@pda/database`.
- Produces (cada una persiste y devuelve la fila creada; los overrides son parciales):
  - `aCommunity(overrides?)`, `aCommunityZone({ communityId, ...overrides })`, `aWaterDeposit({ communityId, ...overrides })`
  - `aWaterPoint({ communityZoneId, ...overrides })`, `aWaterAccount(overrides?)`, `aWaterMeter({ waterPointId, waterAccountId, ...overrides })`, `aReading({ waterMeterId, ...overrides })`
  - `anIncident({ communityId, ...overrides })`, `anAnalysis({ communityId, ...overrides })`, `aProvider({ communityId, ...overrides })`
  - `aUser({ communityId, roles, ...overrides })`
  - `aCommunityWithFullSetup()` → `{ community, zone, waterPoint, account, meter, reading }`

- [ ] **Step 1: Escribir las factories**

`packages/testing/factories.ts`. Los ids los genera Prisma (`@default(cuid())`); los campos obligatorios llevan valores por defecto plausibles y únicos por invocación mediante un contador de módulo, para que dos llamadas nunca choquen en campos con `@unique`.

```typescript
import { client as prisma } from '@pda/database'

let seq = 0
const next = () => ++seq

export async function aCommunity(overrides: Record<string, unknown> = {}) {
  return prisma.community.create({
    data: {
      name: `Community ${next()}`,
      waterLimitRule: { type: 'PERSON_BASED', value: 100 },
      ...overrides
    }
  })
}

export async function aCommunityZone(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.communityZone.create({
    data: { name: `Zone ${next()}`, notes: '', communityId, ...overrides }
  })
}

export async function aWaterDeposit(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.waterDeposit.create({
    data: { name: `Deposit ${next()}`, location: '0,0', communityId, ...overrides }
  })
}

export async function aWaterPoint(params: { communityZoneId: string } & Record<string, unknown>) {
  const { communityZoneId, ...overrides } = params
  return prisma.waterPoint.create({
    data: {
      name: `Water Point ${next()}`,
      location: '0,0',
      notes: '',
      fixedPopulation: 2,
      floatingPopulation: 0,
      cadastralReference: `CAD-${next()}`,
      waterDepositIds: [],
      communityZoneId,
      ...overrides
    }
  })
}

export async function aWaterAccount(overrides: Record<string, unknown> = {}) {
  return prisma.waterAccount.create({
    data: { name: `Account ${next()}`, nationalId: `ID-${next()}`, ...overrides }
  })
}

export async function aWaterMeter(
  params: { waterPointId: string; waterAccountId: string } & Record<string, unknown>
) {
  const { waterPointId, waterAccountId, ...overrides } = params
  return prisma.waterMeter.create({
    data: {
      name: `Meter ${next()}`,
      measurementUnit: 'L',
      isActive: true,
      waterPointId,
      waterAccountId,
      ...overrides
    }
  })
}

export async function aReading(params: { waterMeterId: string } & Record<string, unknown>) {
  const { waterMeterId, ...overrides } = params
  return prisma.waterMeterReading.create({
    data: {
      reading: '100',
      normalizedReading: 100,
      readingDate: new Date('2026-01-01'),
      waterMeterId,
      ...overrides
    }
  })
}

export async function anIncident(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.incident.create({
    data: {
      title: `Incident ${next()}`,
      reporterName: 'Reporter',
      status: 'open',
      startAt: new Date('2026-01-01'),
      communityId,
      ...overrides
    }
  })
}

export async function anAnalysis(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.analysis.create({
    data: {
      analysisType: 'chlorine_ph',
      analyst: 'Analyst',
      analyzedAt: new Date('2026-01-01'),
      ph: 7,
      chlorine: 1,
      communityId,
      ...overrides
    }
  })
}

export async function aProvider(params: { communityId: string } & Record<string, unknown>) {
  const { communityId, ...overrides } = params
  return prisma.provider.create({
    data: {
      companyName: `Provider ${next()}`,
      contactPerson: 'Contact',
      contactPhone: '600000000',
      providerType: 'plumbing',
      isActive: true,
      notes: '',
      emergencyAvailable: false,
      communityId,
      ...overrides
    }
  })
}

export async function aUser(
  params: { communityId?: string; roles?: string[] } & Record<string, unknown> = {}
) {
  const { communityId, roles = ['MANAGER'], ...overrides } = params
  return prisma.user.create({
    data: {
      email: `user${next()}@example.com`,
      name: `User ${next()}`,
      passwordHash: '$2a$10$notARealHashJustForTests',
      roles,
      communityId,
      ...overrides
    }
  })
}

// Two of these give you two fully independent communities, which is what every
// cross-tenant test needs.
export async function aCommunityWithFullSetup() {
  const community = await aCommunity()
  const zone = await aCommunityZone({ communityId: community.id })
  const waterPoint = await aWaterPoint({ communityZoneId: zone.id })
  const account = await aWaterAccount()
  const meter = await aWaterMeter({ waterPointId: waterPoint.id, waterAccountId: account.id })
  const reading = await aReading({ waterMeterId: meter.id })
  return { community, zone, waterPoint, account, meter, reading }
}
```

- [ ] **Step 2: Exportar desde el barrel**

En `packages/testing/index.ts`, añadir como primera línea:

```typescript
export * from './factories'
```

- [ ] **Step 3: Verificar los campos obligatorios contra el schema**

Las factories de arriba se escribieron contra `packages/database/prisma/schema.prisma`, pero cualquier campo obligatorio sin default que falte hará fallar el `create` en runtime. Comprobalo con un test temporal antes de seguir:

Añadir al final de `smoke.test.ts`:

```typescript
  it('should create two fully independent communities', async () => {
    // Arrange & Act
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()

    // Assert
    expect(a.community.id).not.toBe(b.community.id)
    expect(a.meter.id).not.toBe(b.meter.id)
    expect(await prisma.community.count()).toBeGreaterThanOrEqual(2)
  })
```

Y el import correspondiente:

```typescript
import { aCommunityWithFullSetup, asAnonymous, asManagerOf, setupTestDatabase } from '@pda/testing'
```

- [ ] **Step 4: Ejecutar**

Run: `bun run test:integration`
Expected: `5 pass`, `0 fail`.

Si algún `create` falla por un campo obligatorio, añadilo a la factory correspondiente con un valor por defecto plausible. No lo hagas opcional en el schema.

- [ ] **Step 5: Commit**

```bash
bunx biome check --write packages/testing apps/webapp/src/server/api/__tests__
git add packages/testing apps/webapp/src/server/api/__tests__
git commit -m "test: add persisted data factories for integration tests"
```

---

### Task 3: `table.domainTable` — el agujero crítico

Tres fallos encadenados en un endpoint (`apps/webapp/src/server/api/routers/table.ts`) permiten que cualquier usuario staff de cualquier comunidad enumere todos los usuarios de todas las comunidades **con sus hashes bcrypt**, filtrando con queries arbitrarias. Es la tarea de mayor severidad del plan.

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/table.test.ts`
- Modify: `apps/webapp/src/server/api/routers/table.ts`
- Modify: `apps/webapp/src/server/repositories/table-proxy.repository.ts`
- Modify: los componentes del frontend que pasen `selector` (se identifican en el Step 4)

**Interfaces:**
- Consumes: factories y sesiones de Tasks 1-2.
- Produces: `TableRepositoryProxy.findForTable(model, params, communityId)` — la firma gana un tercer parámetro obligatorio con la comunidad ya verificada.

- [ ] **Step 1: Escribir los tres tests, que deben fallar**

`apps/webapp/src/server/api/__tests__/table.test.ts`:

```typescript
import { beforeAll, describe, expect, it } from 'bun:test'
import { aCommunityWithFullSetup, asManagerOf, aUser, setupTestDatabase } from '@pda/testing'
import { createCaller } from '@/server/api/root'

const baseQuery = { page: 1, limit: 50, filters: [] }

describe('table.domainTable', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should never expose passwordHash', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    await aUser({ communityId: a.community.id })
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.table.domainTable({ model: 'user', queryParams: baseQuery })

    // Assert
    expect(result.items.length).toBeGreaterThan(0)
    for (const item of result.items) {
      expect(item).not.toHaveProperty('passwordHash')
    }
  })

  it('should not return users from another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    await aUser({ communityId: a.community.id })
    const foreignUser = await aUser({ communityId: b.community.id })
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.table.domainTable({ model: 'user', queryParams: baseQuery })

    // Assert
    const ids = result.items.map((item) => (item as { id: string }).id)
    expect(ids).not.toContain(foreignUser.id)
  })

  it('should reject an arbitrary prisma selector from the client', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expect(
      caller.table.domainTable({
        model: 'user',
        // biome-ignore lint/suspicious/noExplicitAny: asserting the input is rejected
        queryParams: { ...baseQuery, selector: { passwordHash: { not: null } } } as any
      })
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Verlos fallar**

Run: `bun run test:integration`
Expected: los 3 tests de `table.domainTable` **fallan**. El primero porque `passwordHash` viene en la respuesta, el segundo porque el usuario de la otra comunidad aparece, el tercero porque el `selector` se acepta.

Este paso no es ceremonia: si alguno pasa ya, el test no está probando lo que crees.

- [ ] **Step 3: Añadir scope de comunidad al proxy**

Reemplazar **todo** el contenido de `apps/webapp/src/server/repositories/table-proxy.repository.ts` por:

```typescript
import type { TableQueryParams, TableQueryPort, TableQueryResult } from '@pda/common/domain'
import { CommunityFactory } from '@pda/community'
import { RegistersFactory } from '@pda/registers'
import { UserFactory } from '@pda/user'

/**
 * Delegates table queries to the right domain repository, always scoped to one
 * community. Each supported model declares how it is anchored to a community;
 * a model with no declared anchor cannot be queried.
 */
export class TableRepositoryProxy {
  async findForTable(
    model: string,
    params: TableQueryParams,
    communityId: string
  ): Promise<TableQueryResult<unknown>> {
    const repository = this.repositoryFor(model)
    const scoped: TableQueryParams = {
      ...params,
      selector: this.communityScopeFor(model, communityId)
    }
    return repository.findForTable(scoped)
  }

  private repositoryFor(model: string): TableQueryPort<unknown, unknown> {
    if (model === 'user') return UserFactory.userPrismaRepository()
    if (model === 'community') return CommunityFactory.communityPrismaRepository()
    if (model === 'waterPoint') return CommunityFactory.waterPointPrismaRepository()
    if (model === 'analysis') return RegistersFactory.analysisPrismaRepository()
    throw new Error(`TableRepositoryProxy: unsupported model: ${model}`)
  }

  // How each model is reachable from a community. This is the only place that
  // knows it, and adding a model without adding its anchor is a hard error.
  private communityScopeFor(model: string, communityId: string): Record<string, unknown> {
    if (model === 'user') return { communityId }
    if (model === 'community') return { id: communityId }
    if (model === 'waterPoint') return { communityZone: { communityId } }
    if (model === 'analysis') return { communityId }
    throw new Error(`TableRepositoryProxy: no community scope defined for model: ${model}`)
  }
}
```

Nota: el `selector` deja de venir del cliente y pasa a ser el vehículo interno del scope. `PrismaTableQueryBuilder` ya lo mete en el `where` con `AND` (`prisma-table-query-builder.ts:56-57`), así que el filtro de comunidad se combina correctamente con búsqueda y filtros.

- [ ] **Step 4: Quitar `selector` de la entrada pública y no devolver el DTO crudo**

En `apps/webapp/src/server/api/routers/table.ts`:

1. Borrar del schema de entrada la línea `selector: z.any().optional()`.
2. Borrar de `tableParams` la línea `selector: queryParams.selector`.
3. Cambiar `staffProcedure` por `communityScopedProcedure` — **pero ese procedure lo crea la Task 4**. Para no invertir el orden, en esta tarea se resuelve la comunidad en el handler:

```typescript
    .query(async ({ input, ctx }) => {
      const communityId = ctx.session.user.community?.id
      if (!communityId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User has no community assigned' })
      }
```

y se pasa `communityId` al proxy:

```typescript
      const proxy = new TableRepositoryProxy()
      const entitiesResult = await proxy.findForTable(model, tableParams, communityId)
```

La Task 4 lo migrará a `communityScopedProcedure`.

4. Sustituir el mapeo a DTO crudo por una proyección explícita por modelo, para que `passwordHash` no pueda salir ni por accidente:

```typescript
      return {
        items: entitiesResult.items.map((entity) => toTableDto(model, entity)),
        totalItems: entitiesResult.totalItems,
        currentPage: entitiesResult.currentPage,
        totalPages: entitiesResult.totalPages
      }
```

Y añadir la función al final del archivo:

```typescript
// Explicit output projection per model. toDto() exists for persistence and
// includes fields that must never reach a client (User.toDto has passwordHash).
function toTableDto(model: string, entity: unknown): Record<string, unknown> {
  const dto = (entity as { toDto: () => Record<string, unknown> }).toDto()
  if (model === 'user') {
    const { passwordHash: _passwordHash, ...safe } = dto
    return safe
  }
  return dto
}
```

Añadir el import de `TRPCError` si no está: `import { TRPCError } from '@trpc/server'`.

- [ ] **Step 5: Actualizar los callers del frontend que pasen `selector`**

Run: `grep -rn "selector" apps/webapp/src --include=*.tsx --include=*.ts | grep -v "/server/"`

Para cada uso, quitar el `selector` de la llamada. Si alguna pantalla dependía de él para filtrar, sustituilo por una entrada de `filters` (que sí está declarada y validada). Verificar después:

Run: `cd apps/webapp && bunx tsc --noEmit 2>&1 | grep -E "table|selector"`
Expected: sin salida.

- [ ] **Step 6: Ver los tres tests en verde**

Run: `bun run test:integration`
Expected: los 3 tests de `table.domainTable` pasan. Sin `it.failing`.

- [ ] **Step 7: Verificar que no se rompió el panel**

Run: `bun run webapp` y abrir las 4 tablas que el proxy sirve: usuarios, comunidades, puntos de agua y análisis. Cada una debe listar, paginar, ordenar y buscar. Un `ADMIN` sin comunidad asignada verá un error de comunidad: **anotalo y reportalo**, porque implica que el panel de administración global necesita un camino distinto al del scope por comunidad (candidato a tarea aparte, no lo resuelvas acá).

Run: `bun run test:unit`
Expected: `281 pass`, `0 fail`.

- [ ] **Step 8: Commit**

```bash
bunx biome check --write apps/webapp/src/server apps/webapp/src/features
git add apps/webapp/src/server apps/webapp/src/features
git commit -m "fix(security): scope domainTable by community and stop leaking passwordHash

The endpoint accepted an arbitrary Prisma selector from the client, applied
no community scope, and returned User.toDto() raw, which includes
passwordHash. Any staff user of any community could enumerate every user of
every community with their bcrypt hashes."
```

---

### Task 4: `communityScopedProcedure`

El mecanismo con el que se cierran las tareas 5-12. Repetir `assertCommunityAccess` en 18 handlers es el patrón que ya falló; esto resuelve la comunidad una vez y la inyecta verificada.

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/procedures.test.ts`
- Modify: `apps/webapp/src/server/api/trpc.ts`
- Modify: `apps/webapp/src/server/api/routers/table.ts` (migra del handler manual de Task 3)

**Interfaces:**
- Consumes: `staffProcedure` de `trpc.ts`.
- Produces: `communityScopedProcedure` — procedure que garantiza `ctx.communityId: string` verificado. Lo usan todas las tareas siguientes.

- [ ] **Step 1: Escribir el test del procedure**

`apps/webapp/src/server/api/__tests__/procedures.test.ts`:

```typescript
import { beforeAll, describe, expect, it } from 'bun:test'
import { aCommunity, asAdmin, asManagerOf, asReaderOf, setupTestDatabase } from '@pda/testing'
import { createCaller } from '@/server/api/root'

const baseQuery = { page: 1, limit: 50, filters: [] }

describe('communityScopedProcedure', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject a staff user with no community assigned', async () => {
    // Arrange
    const caller = createCaller(asAdmin(null))

    // Act & Assert
    await expect(
      caller.table.domainTable({ model: 'user', queryParams: baseQuery })
    ).rejects.toThrow(/community/i)
  })

  it('should reject a water meter reader', async () => {
    // Arrange
    const community = await aCommunity()
    const caller = createCaller(asReaderOf(community.id))

    // Act & Assert
    await expect(
      caller.table.domainTable({ model: 'user', queryParams: baseQuery })
    ).rejects.toThrow(/FORBIDDEN/)
  })

  it('should allow a manager with a community', async () => {
    // Arrange
    const community = await aCommunity()
    const caller = createCaller(asManagerOf(community.id))

    // Act
    const result = await caller.table.domainTable({ model: 'user', queryParams: baseQuery })

    // Assert
    expect(result.currentPage).toBe(1)
  })
})
```

- [ ] **Step 2: Ejecutar**

Run: `bun run test:integration`
Expected: los 3 pasan ya, porque Task 3 dejó la comprobación en el handler. Son la red que protege el refactor de los pasos siguientes.

- [ ] **Step 3: Añadir el procedure**

Al final de `apps/webapp/src/server/api/trpc.ts`:

```typescript
/**
 * Staff procedure with the caller's community resolved and verified once.
 * Endpoints that use it must take the community from ctx.communityId and never
 * from their input, which makes cross-community access impossible to express.
 */
export const communityScopedProcedure = staffProcedure.use(({ ctx, next }) => {
  const communityId = ctx.session.user.community?.id
  if (!communityId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'User has no community assigned' })
  }
  return next({ ctx: { ...ctx, communityId } })
})
```

- [ ] **Step 4: Migrar `table.ts` al procedure**

En `apps/webapp/src/server/api/routers/table.ts`, cambiar `staffProcedure` por `communityScopedProcedure` en el import y en `domainTable`, y borrar del handler las 4 líneas que resolvían la comunidad a mano, usando `ctx.communityId` en su lugar.

- [ ] **Step 5: Verificar que nada cambió de comportamiento**

Run: `bun run test:integration`
Expected: los 6 tests (3 de `table` + 3 de `procedures`) pasan.

Run: `bun run test:unit`
Expected: `281 pass`, `0 fail`.

- [ ] **Step 6: Commit**

```bash
bunx biome check --write apps/webapp/src/server
git add apps/webapp/src/server
git commit -m "feat(api): add communityScopedProcedure with verified community in context"
```

---

### Tasks 5-12: cierre por router

Las ocho tareas siguientes comparten forma exacta, así que el patrón se define una vez acá y cada tarea lo instancia. **Esto no es un "igual que la tarea N"**: cada tarea de abajo trae la lista literal de endpoints, el id que recibe cada uno, cómo se ancla a una comunidad y el arreglo concreto. Lo único compartido es la plantilla de test, que se repite tal cual.

**Plantilla de test** — dos tests por endpoint, errores primero según las convenciones del proyecto:

```typescript
import { beforeAll, describe, expect, it } from 'bun:test'
import { aCommunityWithFullSetup, asManagerOf, setupTestDatabase } from '@pda/testing'
import { createCaller } from '@/server/api/root'

describe('<router>.<endpoint>', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject a resource from another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expect(caller.<router>.<endpoint>({ /* id de b */ })).rejects.toThrow(/FORBIDDEN/)
  })

  it('should allow a resource from the caller community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.<router>.<endpoint>({ /* id de a */ })

    // Assert
    expect(result).toBeDefined()
  })
})
```

**Ciclo obligatorio de cada tarea**, sin excepción:

1. Escribir los tests de los endpoints de la tarea.
2. `bun run test:integration` → **ver fallar** los de acceso cruzado. Si alguno pasa antes del arreglo, el test está mal.
3. Aplicar el arreglo endpoint por endpoint.
4. `bun run test:integration` → todos verdes, cero `it.failing`.
5. `bun run test:unit` → `281 pass`.
6. Si cambió alguna firma: actualizar callers del frontend y `cd apps/webapp && bunx tsc --noEmit` sin errores nuevos en los archivos tocados.
7. `bunx biome check --write` de lo tocado y commit.

**Dos formas de arreglo, según de dónde venga el id:**

- **El endpoint recibe un `communityId`**: pasa a `communityScopedProcedure`, se le **quita el parámetro del input** y usa `ctx.communityId`. Cambia la firma → hay que tocar el frontend.
- **El endpoint recibe el id de un recurso** (contador, lectura, punto de agua, incidencia…): pasa a `communityScopedProcedure` y se añade un guard que resuelve el recurso y compara su comunidad con `ctx.communityId`. No cambia la firma.

Los guards nuevos van en `apps/webapp/src/server/api/guards/`, uno por tipo de recurso, siguiendo el estilo de `water-meter-community-guard.ts` (que ya tiene `assertWaterMeterBelongsToUserCommunity` y `assertZoneIdsBelongToUserCommunity`, reutilizables).

---

### Task 5: `water-account.ts` — mutaciones

Las seis mutaciones que hoy permiten **modificar** datos de otra comunidad. Máxima prioridad del bloque: un borrado cruzado es irreversible.

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/water-account.test.ts`
- Modify: `apps/webapp/src/server/api/routers/water-account.ts`
- Modify: `apps/webapp/src/server/api/guards/water-meter-community-guard.ts` (añadir guard de lectura)

| Endpoint | Línea | Id que recibe | Ancla a comunidad | Arreglo |
|---|---|---|---|---|
| `updateWaterMeterReading` | 135 | id de lectura | `reading → waterMeter → waterPoint → communityZone → communityId` | guard nuevo `assertReadingBelongsToUserCommunity` |
| `deleteWaterMeterReading` | 183 | id de lectura | ídem | ídem |
| `recalculateWaterMeterExcess` | 195 | `waterMeterId` | `waterMeter → waterPoint → communityZone` | `assertWaterMeterBelongsToUserCommunity` (ya existe) |
| `updateWaterMeterImage` | 207 | `waterMeterId` | ídem | ídem |
| `replaceWaterMeter` | 246 | `oldWaterMeterId` | ídem | ídem |
| `changeWaterMeterOwner` | 359 | `waterMeterId` | ídem | ídem |

- [ ] **Step 1: Escribir los 12 tests** (2 por endpoint) instanciando la plantilla. Para los de lectura, el id cruzado es `b.reading.id`; para los de contador, `b.meter.id`.

- [ ] **Step 2: Verlos fallar.** Run: `bun run test:integration`. Expected: los 6 de acceso cruzado fallan.

- [ ] **Step 3: Añadir el guard de lecturas** en `water-meter-community-guard.ts`:

```typescript
export async function assertReadingBelongsToUserCommunity(
  readingId: string,
  userCommunityId: string
): Promise<void> {
  const readingRepo = WaterAccountFactory.waterMeterReadingPrismaRepository()
  const reading = await readingRepo.findById(Id.fromString(readingId))
  if (!reading) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Water meter reading not found' })
  }
  await assertWaterMeterBelongsToUserCommunity(reading.waterMeterId.toString(), userCommunityId)
}
```

- [ ] **Step 4: Aplicar el arreglo a los 6 endpoints.** Cambiar `staffProcedure` por `communityScopedProcedure` y añadir la llamada al guard como primera línea del handler, dentro del `try` existente para que `handleDomainError` no se coma el `TRPCError`. Ejemplo en `deleteWaterMeterReading`:

```typescript
  deleteWaterMeterReading: communityScopedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await assertReadingBelongsToUserCommunity(input.id, ctx.communityId)
      try {
        const service = WaterAccountFactory.waterMeterReadingDeleterService()
        await service.run(Id.fromString(input.id))
        return { success: true }
      } catch (error) {
        handleDomainError(error)
      }
    }),
```

Ojo: el guard va **fuera** del `try`, porque `handleDomainError` re-lanza sólo lo que no reconoce y no debe interceptar un `FORBIDDEN`.

- [ ] **Step 5-7: Cerrar el ciclo** (verde, unit tests, biome, commit).

```bash
git commit -m "fix(security): scope water meter mutations to the caller community"
```

---

### Task 6: `water-account.ts` — lecturas

**Files:**
- Modify: `apps/webapp/src/server/api/__tests__/water-account.test.ts` (mismo archivo que Task 5)
- Modify: `apps/webapp/src/server/api/routers/water-account.ts`

| Endpoint | Línea | Id que recibe | Arreglo |
|---|---|---|---|
| `getWaterMetersByWaterPointId` | 47 | `id` de punto de agua | guard nuevo `assertWaterPointBelongsToUserCommunity` |
| `getAllWaterAccounts` | 292 | ninguno | **Borrarlo.** Devuelve las cuentas de todas las comunidades y ninguna pantalla lo usa (verificado con grep). `getWaterAccountsByCommunityId` ya cubre el caso legítimo |
| `getWaterMeterById` | 20 | `id` de contador | El guard existe pero corre sólo bajo `isWaterMeterReaderOnly`: quitar la condición y aplicarlo siempre |
| `getWaterMeterReadings` | 32 | `waterMeterId` | ídem |
| `getActiveWaterMetersOrderedByLastReading` | 55 | `zoneIds` | ídem, con `assertZoneIdsBelongToUserCommunity` |

- [ ] **Step 1: Antes de borrar `getAllWaterAccounts`, confirmar que nadie lo llama.**

Run: `grep -rn "getAllWaterAccounts" apps/webapp/src --include=*.tsx --include=*.ts | grep -v "/server/"`
Expected: sin salida. Si aparece algo, **no lo borres**: dale scope de comunidad como los demás y reportá el hallazgo.

- [ ] **Step 2-7: Ciclo completo** con la plantilla de test y los arreglos de la tabla.

```bash
git commit -m "fix(security): scope water meter reads and remove unscoped getAllWaterAccounts"
```

---

### Task 7: `community.ts`

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/community.test.ts`
- Modify: `apps/webapp/src/server/api/routers/community.ts`
- Modify: callers del frontend de los 3 endpoints que cambian firma

| Endpoint | Línea | Recibe | Arreglo |
|---|---|---|---|
| `getCommunityZones` | 18 | `id` de comunidad | Quitar el input, usar `ctx.communityId`. **Cambia firma** |
| `getWaterPoints` | 28 | `zoneIds` | `assertZoneIdsBelongToUserCommunity` |
| `getWaterPointsWithAccount` | 36 | `zoneIds` | ídem |
| `getWaterPointsByCommunityWithAccount` | 46 | `communityId` | Quitar el input, usar `ctx.communityId`. **Cambia firma** |
| `getWaterPointById` | 53 | `id` de punto | `assertWaterPointBelongsToUserCommunity` (creado en Task 6) |
| `getWaterDepositsByCommunityId` | 60 | `id` de comunidad | Quitar el input, usar `ctx.communityId`. **Cambia firma** |
| `getDepositsByWaterPointId` | 68 | `id` de punto | `assertWaterPointBelongsToUserCommunity` |
| `updateWaterPointDeposits` | 142 | `waterPointId` + `depositIds` | Guard del punto **y** verificar que todos los depósitos son de `ctx.communityId` |
| `updateWaterPointData` | 159 | `waterPointId` | `assertWaterPointBelongsToUserCommunity` |

`createWaterDeposit` (80), `updateWaterDeposit` (107) y `createWaterPointOnboarding` (202) **ya toman la comunidad de la sesión**: sólo migran a `communityScopedProcedure` para quitar el `if (!communityId)` repetido.

- [ ] **Step 1: Tests** de los 9 endpoints con la plantilla.
- [ ] **Step 2: Verlos fallar.**
- [ ] **Step 3: Arreglos** según la tabla.
- [ ] **Step 4: Actualizar los callers** de los 3 endpoints que pierden parámetro.

Run: `grep -rn "getCommunityZones\|getWaterPointsByCommunityWithAccount\|getWaterDepositsByCommunityId" apps/webapp/src --include=*.tsx | grep -v "/server/"`

Quitar el argumento de cada llamada. Verificar con `cd apps/webapp && bunx tsc --noEmit`.

- [ ] **Step 5-7: Cerrar el ciclo.**

```bash
git commit -m "fix(security): scope community router to the caller community"
```

---

### Task 8: `incident.ts`

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/incident.test.ts`
- Modify: `apps/webapp/src/server/api/routers/incident.ts`
- Create: `apps/webapp/src/server/api/guards/incident-community-guard.ts`

| Endpoint | Línea | Recibe | Arreglo |
|---|---|---|---|
| `getIncidents` | 16 | nada | **Borrarlo** si nadie lo usa (verificar con grep); `getIncidentsByCommunityId` cubre el caso |
| `getIncidentsByCommunityId` | 22 | `id` de comunidad | Quitar input, usar `ctx.communityId`. **Cambia firma** |
| `getIncidentById` | 30 | `id` de incidencia | Guard nuevo `assertIncidentBelongsToUserCommunity` |
| `addIncident` | 45 | `communityId` en el schema | Quitar del input, usar `ctx.communityId`. **Cambia firma** |
| `updateIncident` | 93 | `id` + schema completo | Guard de incidencia |
| `deleteIncident` | 138 | `id` | Guard de incidencia |
| `exportIncidents` | 144 | `communityId` opcional | Quitar del input, usar `ctx.communityId`. **Cambia firma** |
| `deleteIncidentImage` | 192 | `imageId` | Resolver imagen → incidencia → comunidad |

- [ ] Ciclo completo. `git commit -m "fix(security): scope incident router to the caller community"`

---

### Task 9: `analysis.ts`

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/analysis.test.ts`
- Modify: `apps/webapp/src/server/api/routers/analysis.ts`
- Create: `apps/webapp/src/server/api/guards/analysis-community-guard.ts`

| Endpoint | Línea | Recibe | Arreglo |
|---|---|---|---|
| `getAnalyses` | 14 | nada | **Borrarlo** si nadie lo usa |
| `getAnalysesByCommunityId` | 20 | `id` de comunidad | Quitar input, usar `ctx.communityId`. **Cambia firma** |
| `getAnalysisById` | 28 | `id` de análisis | Guard nuevo |
| `addAnalysis` | 34 | `communityId` en el schema | Quitar del input, usar `ctx.communityId`. **Cambia firma** |
| `exportAnalyses` | 62 | `communityId` opcional | Quitar del input, usar `ctx.communityId`. **Cambia firma** |

- [ ] Ciclo completo. `git commit -m "fix(security): scope analysis router to the caller community"`

---

### Task 10: `provider.ts`

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/provider.test.ts`
- Modify: `apps/webapp/src/server/api/routers/provider.ts`
- Create: `apps/webapp/src/server/api/guards/provider-community-guard.ts`

| Endpoint | Línea | Recibe | Arreglo |
|---|---|---|---|
| `getProviders` | 10 | nada | **Borrarlo** si nadie lo usa |
| `getProvidersByCommunityId` | 16 | `id` de comunidad | Quitar input, usar `ctx.communityId`. **Cambia firma** |
| `getProviderById` | 24 | `id` de proveedor | Guard nuevo |
| `addProvider` | 30 | `communityId` en el schema | Quitar del input, usar `ctx.communityId`. **Cambia firma** |
| `updateProvider` | 43 | schema completo con `id` | Guard nuevo |
| `deleteProvider` | 57 | `id` | Guard nuevo |
| `toggleProviderActive` | 67 | `id` | Guard nuevo |

Ojo con `Provider.communityId`, que es **opcional** en el schema Prisma (`communityId String?`). Un proveedor sin comunidad no pertenece a nadie: el guard debe rechazarlo (`FORBIDDEN`), no dejarlo pasar. Anotá cuántos proveedores sin comunidad hay en producción antes de desplegar, porque dejarán de ser accesibles.

- [ ] Ciclo completo. `git commit -m "fix(security): scope provider router to the caller community"`

---

### Task 11: `user.ts` — roto y sin scope

Los tres endpoints validan `z.string().uuid()` mientras `User.id` es `@default(cuid())` (`packages/database/prisma/schema.prisma:50`), así que **rechazan todos los ids reales** y la pantalla de administración de usuarios no funciona. Y `user.delete` (línea 21) es un stub que sólo hace `console.log`: el botón de borrar no borra nada.

Arreglar la validación **sin** añadir scope abriría una vía de toma de cuentas: `user.update` acepta `userSchema` completo y `User.update()` aplica `passwordHash`, así que un staff de la comunidad A podría fijar la contraseña de un usuario de B. Por eso van juntos.

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/user.test.ts`
- Modify: `apps/webapp/src/server/api/routers/user.ts`
- Modify: `packages/user/domain/entities/user.dto.ts` (el `uuid` que rompe todo)

| Endpoint | Línea | Problema | Arreglo |
|---|---|---|---|
| `getById` | 8 | `uuid` vs `cuid` + sin scope | `idSchema` de `@pda/common/domain` + guard de comunidad |
| `update` | 15 | ídem + acepta `passwordHash` del cliente | ídem, **y** quitar `passwordHash` del input: cambiar contraseña es otro caso de uso, no un update genérico |
| `delete` | 20 | Stub que sólo loguea | Implementarlo con scope, o borrar el endpoint y el botón. **Decidilo con el usuario antes de implementar** |

- [ ] **Step 1: Tests**, incluyendo uno que afirme que `update` **no** puede cambiar el `passwordHash` de un usuario de otra comunidad, y uno que confirme que un id `cuid` real es aceptado.
- [ ] **Step 2: Verlos fallar** (el de `cuid` falla con error de validación de Zod, no con `FORBIDDEN` — asertá el error correcto).
- [ ] **Step 3: Arreglar** `user.dto.ts` cambiando `id: z.string().uuid()` por `id: idSchema`, y los tres endpoints.
- [ ] **Step 4: Consultar al usuario** sobre `delete` antes de implementarlo o borrarlo.
- [ ] **Step 5-7: Ciclo.**

```bash
git commit -m "fix(security): scope user router and repair cuid/uuid id validation"
```

---

### Task 12: `fees.ts` — migrar el patrón correcto

Los 7 endpoints de `fees.ts` **ya son correctos**: llaman `assertCommunityAccess` y resuelven la comunidad del recurso antes de mutar. Esta tarea no arregla un bug: elimina el parámetro `communityId` redundante ahora que `ctx.communityId` existe, para que el router no sea el único con dos formas de saber la comunidad.

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/fees.test.ts`
- Modify: `apps/webapp/src/server/api/routers/fees.ts`
- Modify: `packages/fees/domain/entities/*.dto.ts` si los schemas de input llevan `communityId`
- Modify: callers del frontend

- [ ] **Step 1: Escribir los tests primero, que deben pasar en verde desde el principio.** Son la red que protege la migración: si algo se rompe al quitar el parámetro, se ve acá.
- [ ] **Step 2: Migrar** los 7 endpoints a `communityScopedProcedure`, quitando `communityId` de los inputs y de `feeConfigUpsertSchema` / `feePaymentCreateSchema` si lo llevan.
- [ ] **Step 3: Actualizar callers** y verificar con typecheck.
- [ ] **Step 4-6: Ciclo.**

```bash
git commit -m "refactor(fees): take community from context instead of input"
```

---

### Task 13: Matriz de roles

Cierra el plan verificando la dimensión que las tareas 5-12 no cubren: no sólo *qué comunidad*, sino *qué rol*.

**Files:**
- Create: `apps/webapp/src/server/api/__tests__/roles.test.ts`

**Interfaces:**
- Consumes: `asAdmin`, `asCommunityAdminOf`, `asManagerOf`, `asReaderOf`, `asAnonymous`.

- [ ] **Step 1: Escribir la tabla de casos.** Un test por celda relevante:

| Rol | Debe poder | No debe poder |
|---|---|---|
| `asAnonymous` | nada | cualquier procedure protegido |
| `asReaderOf` | `getWaterMeterById`, `getWaterMeterReadings`, `getActiveWaterMetersOrderedByLastReading`, `addWaterMeterReading`, `getCommunityZones` de su comunidad | cualquier `staffProcedure`: `table.domainTable`, `updateWaterMeterReading`, `deleteWaterMeterReading`, todo `provider`/`incident`/`analysis`/`fees` |
| `asManagerOf` | los `staffProcedure` de su comunidad | `createWaterDeposit`, `updateWaterDeposit`, `createWaterPointOnboarding` (requieren ADMIN o COMMUNITY_ADMIN) |
| `asCommunityAdminOf` | además, los de gestión de depósitos y onboarding | endpoints de `adminPanelProcedure` |
| `asAdmin` | todo lo de su comunidad | acceder a otra comunidad (mismo scope que el resto) |

- [ ] **Step 2: Ejecutar y clasificar cada fallo.** Un fallo acá puede significar dos cosas distintas: que el permiso está mal, o que mi tabla está mal. Antes de cambiar código, decidí cuál de las dos es y **reportá las discrepancias** en vez de ajustar el test para que pase.

- [ ] **Step 3: Anotar los dos hallazgos ya conocidos** de `trpc.ts`, sin arreglarlos (son cosméticos, no huecos): `adminProcedure` (160) y `adminPanelProcedure` (171) son idénticos en efecto, y `waterMeterReaderAllowedProcedure` (143) es un alias vacío de `protectedProcedure`.

- [ ] **Step 4: Ciclo.**

```bash
git commit -m "test: cover the role authorization matrix"
```

---

## Verificación final

```bash
bun install
bun run -F @pda/database generate
bun run dbs
bun run test:unit          # 281 pass, 0 fail
bun run test:integration   # 0 fail, 0 it.failing sin comentario HOLE:
bunx biome ci --diagnostic-level=error .
cd apps/webapp && bunx tsc --noEmit    # sin errores nuevos respecto al baseline de 166
```

Comprobación de que no queda ningún agujero aparcado:

```bash
grep -rn "it.failing\|test.failing" apps/webapp/src/server/api/__tests__/
```

Cada resultado debe tener un comentario `HOLE:` inmediatamente encima explicando por qué se aplazó. Sin comentario, es un test que se está escondiendo.

Y la verificación manual, porque ninguna de estas tareas prueba que la aplicación siga siendo usable:

1. Entrar como usuario de una comunidad y recorrer: tablas del panel, alta de lectura con imagen, alta y cierre de incidencia, alta de análisis, alta de proveedor, gestión de depósitos, y el flujo de onboarding de punto de agua.
2. Entrar como `WATER_METER_READER` y comprobar que el flujo de lectura funciona y que no aparece nada de gestión.
3. Exportar lecturas y análisis.

## Apéndice — hallazgos que este plan destapa pero no arregla

1. **`ADMIN` sin comunidad asignada.** `communityScopedProcedure` lo rechaza. Si el panel de administración global depende de un admin sin comunidad, necesita un camino propio. Se detecta en el Step 7 de la Task 3 y merece decisión del usuario.
2. **`user.delete` es un stub.** El botón de la UI no borra nada. Decisión pendiente en Task 11.
3. **Proveedores sin comunidad** (`communityId` es opcional en el schema) dejarán de ser accesibles. Hay que contarlos en producción antes de desplegar.
4. **`table.domainTable` sigue siendo un endpoint genérico** con `model: z.string()`. El arreglo de la Task 3 es defensivo; si ese diseño es buena idea es otra discusión.
5. **`adminProcedure` y `adminPanelProcedure` son redundantes**, y `waterMeterReaderAllowedProcedure` es un alias vacío.
