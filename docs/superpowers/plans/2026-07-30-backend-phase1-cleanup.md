# Backend Fase 1 — Bugs, Tooling y Código Muerto

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar `packages/*` compilando limpio bajo `tsc --noEmit`, con un job de CI que lo mantenga así, tras arreglar 8 bugs reales y borrar ~600 líneas de código muerto.

**Architecture:** El typecheck **es** el test de este plan. Primero se monta la infraestructura que lo hace fallar de forma medible (Task 1), después cada tarea elimina un grupo de errores y se verifica con el conteo, y la última tarea cierra la puerta con CI. Los tests existentes (`bun test packages`, 281 pass) son la red de seguridad de regresión en cada tarea.

**Tech Stack:** Bun 1.2.21 workspaces, TypeScript 5 (`moduleResolution: bundler`, `strict`, `noUncheckedIndexedAccess`), Prisma 6, Biome 2.2.2, GitHub Actions.

## Global Constraints

- Runtime y package manager: **bun**. Nunca `npm`/`yarn`/`pnpm`.
- Comando de tests: `bun test packages` desde la raíz. Debe terminar en **281 pass / 0 fail** al final de cada tarea (salvo Task 11, que corrige tests y puede variar el total — ahí el criterio es 0 fail).
- Formato/lint: `bunx biome check --write <archivos>` antes de cada commit. La CI corre `biome ci --diagnostic-level=error`.
- Idioma de comentarios en código: **inglés** (regla del proyecto, `.cursor/.rules/code-style-and-commands.mdc`).
- No usar type assertions (`as X`) salvo que sea imprescindible; preferir que TS infiera. Los `as any` existentes que este plan no toca se dejan como están.
- **No** tocar `apps/webapp/src` salvo en Task 9 (borrado de una función muerta). El typecheck del webapp queda fuera de alcance (medido: 166 errores; es la Fase siguiente).
- **No** tocar autorización ni multi-tenancy en esta fase. Decisión ya tomada para la Fase 2, anotada en el Apéndice A.
- Commits en inglés, formato convencional (`fix:`, `chore:`, `refactor:`, `ci:`), uno por tarea salvo indicación distinta.

## Contexto de ramas

- Este plan se ejecuta en el worktree `.claude/worktrees/backend-cleanup-plan`, rama `worktree-backend-cleanup-plan`, basada en `main` (`f9fbd3f`).
- Hay trabajo en vuelo en `feat/water-deposit-management` (commits `50dc165`, `7c8b04b`) que añade `packages/community/application/water-deposit-{creator,updater}.service.ts` y sus tests. **Esos archivos no existen en este worktree.** Ninguna tarea de este plan los toca, así que el merge debería ser limpio; si esa rama entra a `main` primero, rebasar antes de empezar.

## File Structure

**Se crean:**
- `tsconfig.packages.json` (raíz) — proyecto TS que cubre solo `packages/**`, con `paths` para resolver los workspaces `@pda/*`. Responsabilidad única: dar un comando de typecheck determinista para el backend.
- `.github/workflows/typecheck.yml` — gate de CI.

**Se borran (código muerto verificado, 0 referencias externas):**
- `packages/user/application/user-updater.service.ts`
- `packages/common/infrastructure/repositories/table-query-builder.ts`
- `packages/common/infrastructure/repositories/base-table.repository.ts`
- `packages/common/domain/events/` (3 archivos)
- `packages/common/domain/value-objects/uuid.ts`
- `packages/community/infrastructure/repositories/community-zone-table-config.ts`

**Se modifican (agrupados por responsabilidad, no por capa):**
- Configs de tabla: `packages/{providers,registers}/infrastructure/repositories/*-table-config.ts`
- Puertos de repositorio: `packages/providers/domain/repositories/provider.repository.ts`
- Adaptadores Prisma: `packages/providers/infrastructure/repositories/provider.prisma-repository.ts`, `packages/common/infrastructure/repositories/prisma-table-query-builder.ts`
- Barrels: `packages/common/{domain,infrastructure}/index.ts`, `packages/user/infrastructure/index.ts`
- Manifests: `package.json` (raíz), `packages/{common,storage}/package.json`
- Tests con referencias rotas: 6 archivos en `packages/{water-account,registers,community}`

**Decisión de diseño — un solo `tsconfig.packages.json` en vez de 8 tsconfigs por paquete:** los paquetes no tienen build step ni emiten artefactos, así que project references solo añadiría 9 archivos y un grafo que mantener para la misma señal. Un único proyecto da un comando, un conteo de errores y un job de CI. Si más adelante se quiere aislamiento real entre paquetes (que `@pda/fees` no pueda importar de `@pda/registers` sin declararlo), ese es el momento de partirlo — se anota en el Apéndice B.

---

### Task 1: Infraestructura de typecheck y baseline

Esta tarea no arregla nada: monta el instrumento de medición y registra el estado inicial. Es el "escribir el test que falla" del plan.

**Files:**
- Create: `tsconfig.packages.json`
- Modify: `package.json` (raíz, sección `scripts`)

**Interfaces:**
- Consumes: nada.
- Produces: comando `bun run typecheck` que ejecuta `tsc --noEmit -p tsconfig.packages.json`. Todas las tareas siguientes lo usan como criterio de aceptación.

**Contexto que necesitás saber:** `bun install` en este monorepo **no** crea `node_modules/@pda/`. Cada paquete recibe su propio `node_modules` con symlinks solo a las dependencias que declara en su `package.json`. Como `@pda/common` no declara `@pda/database` y `@pda/storage` no declara `@pda/common`, `tsc` no puede resolver esos imports. Los `paths` de abajo lo resuelven a nivel de typecheck; la dependencia no declarada de storage se arregla de verdad en Task 10.

- [ ] **Step 1: Crear el proyecto de typecheck**

Crear `tsconfig.packages.json` en la raíz:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@pda/common/*": ["./packages/common/*"],
      "@pda/community": ["./packages/community/index.ts"],
      "@pda/community/*": ["./packages/community/*"],
      "@pda/database": ["./packages/database/index.ts"],
      "@pda/database/*": ["./packages/database/*"],
      "@pda/fees": ["./packages/fees/index.ts"],
      "@pda/fees/*": ["./packages/fees/*"],
      "@pda/providers": ["./packages/providers/index.ts"],
      "@pda/providers/*": ["./packages/providers/*"],
      "@pda/registers": ["./packages/registers/index.ts"],
      "@pda/registers/*": ["./packages/registers/*"],
      "@pda/storage": ["./packages/storage/index.ts"],
      "@pda/storage/*": ["./packages/storage/*"],
      "@pda/user": ["./packages/user/index.ts"],
      "@pda/user/*": ["./packages/user/*"],
      "@pda/water-account": ["./packages/water-account/index.ts"],
      "@pda/water-account/*": ["./packages/water-account/*"]
    }
  },
  "include": ["packages/**/*.ts"],
  "exclude": [
    "node_modules",
    "**/node_modules",
    "packages/database/prisma/generated"
  ]
}
```

- [ ] **Step 2: Añadir el script**

En `package.json` de la raíz, dentro de `"scripts"`, añadir después de `"check:errors"`:

```json
    "typecheck": "tsc --noEmit -p tsconfig.packages.json"
```

- [ ] **Step 3: Ejecutar y registrar el baseline**

Run: `bun run typecheck 2>&1 | grep -c "error TS"`

Expected: un número > 0 (con el tsconfig raíz eran **75**; con `paths` resueltos debería bajar porque desaparecen los `TS2307` de `@pda/*`, pero pueden aparecer errores nuevos en archivos que antes ni se analizaban).

**Anotá el número exacto acá antes de seguir — es el baseline contra el que se mide todo:** `BASELINE = ____`

- [ ] **Step 4: Verificar que los imports de workspace resuelven**

Run: `bun run typecheck 2>&1 | grep "TS2307" | grep "@pda/"`

Expected: **sin salida**. Si aparece algún `Cannot find module '@pda/...'`, falta una entrada en `paths` o el paquete no tiene `index.ts` — corregilo antes de continuar. Nota: `@pda/common` no tiene `index.ts` (solo `domain/index.ts` e `infrastructure/index.ts`), por eso su mapeo es solo el wildcard.

- [ ] **Step 5: Verificar que los tests siguen verdes**

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

- [ ] **Step 6: Commit**

```bash
git add tsconfig.packages.json package.json
git commit -m "chore(tooling): add typecheck project for backend packages"
```

---

### Task 2: Arreglar el import roto de `auto-table-config`

Este es el bug de mayor apalancamiento del plan: como `auto-table-config.ts` no compila, el tipo de retorno de `createAutoTableConfig` colapsa y **los 8 repositorios que lo usan** heredan errores `TS2345` ("missing properties defaultSort, fields, databaseType"). Arreglar una línea debería eliminar una decena de errores.

**Files:**
- Modify: `packages/common/domain/repositories/auto-table-config.ts:1`

**Interfaces:**
- Consumes: `tsconfig.packages.json` (Task 1).
- Produces: `createAutoTableConfig<TEntity>(options)` con tipo de retorno correcto — `Omit<TableQueryConfig<TEntity, TEntity>, 'entityFromDto'> & { entityFromDto?: (dto: Record<string, unknown>) => TEntity }`.

- [ ] **Step 1: Confirmar que el error existe**

Run: `bun run typecheck 2>&1 | grep "auto-table-config"`
Expected: `packages/common/domain/repositories/auto-table-config.ts(1,78): error TS2307: Cannot find module './TableQueryConfig' or its corresponding type declarations.`

- [ ] **Step 2: Corregir el import**

En `packages/common/domain/repositories/auto-table-config.ts`, línea 1, reemplazar:

```typescript
import type { TableFieldConfig, TableQueryConfig, TableRelationConfig } from './TableQueryConfig'
```

por:

```typescript
import type { TableFieldConfig, TableQueryConfig, TableRelationConfig } from './table-query-config'
```

(Los tres tipos ya están exportados desde `table-query-config.ts` — no hay que crear nada.)

- [ ] **Step 3: Verificar la caída de errores**

Run: `bun run typecheck 2>&1 | grep -c "error TS"`
Expected: un número **menor** al BASELINE de Task 1. Anotalo.

Run: `bun run typecheck 2>&1 | grep "auto-table-config"`
Expected: sin salida.

- [ ] **Step 4: Verificar tests**

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

- [ ] **Step 5: Commit**

```bash
bunx biome check --write packages/common/domain/repositories/auto-table-config.ts
git add packages/common/domain/repositories/auto-table-config.ts
git commit -m "fix(common): correct module path in auto-table-config import"
```

---

### Task 3: Reemplazar el tipo fantasma `TableConfig` en providers y registers

`packages/providers/.../provider-table-config.ts` y `packages/registers/.../incident-table-config.ts` importan un tipo `TableConfig` que **no existe** en `@pda/common/domain`, y describen una forma (`model`/`columns`/`filters`/`searchFields`) que `PrismaTableQueryBuilder` no entiende: espera `databaseType`, `modelName`, `defaultSort` y `fields`. Como `config.fields` queda `undefined`, una búsqueda sobre esas tablas lanzaría `TypeError` en `buildSearchConditions`. Hoy no explota solo porque `TableRepositoryProxy` no rutea `'provider'` ni `'incident'`.

Los campos `columns`, `filters` y `searchFields` son metadata de UI que **nadie consume** (el router `table.ts` recibe `searchFields` desde el cliente). Se descartan.

**Files:**
- Modify: `packages/providers/infrastructure/repositories/provider-table-config.ts` (reescritura completa, 65 → 8 líneas)
- Modify: `packages/registers/infrastructure/repositories/incident-table-config.ts` (reescritura completa, ~58 → 8 líneas)

**Interfaces:**
- Consumes: `createAutoTableConfig` de Task 2.
- Produces: `providerTableConfig` e `incidentTableConfig` con la misma forma que los otros 6 configs del repo (`analysisTableConfig`, `userTableConfig`, etc.), consumibles con `{ ...config, entityFromDto }` por `PrismaTableQueryBuilder`.

- [ ] **Step 1: Confirmar los errores**

Run: `bun run typecheck 2>&1 | grep "TS2305"`
Expected: dos líneas, una por cada archivo, con `has no exported member 'TableConfig'`.

- [ ] **Step 2: Reescribir el config de providers**

Reemplazar **todo** el contenido de `packages/providers/infrastructure/repositories/provider-table-config.ts` por:

```typescript
import { createAutoTableConfig } from '@pda/common/domain'

export const providerTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'provider',
  defaultSort: { field: 'companyName', direction: 'asc' as const }
})
```

- [ ] **Step 3: Reescribir el config de incidents**

Reemplazar **todo** el contenido de `packages/registers/infrastructure/repositories/incident-table-config.ts` por:

```typescript
import { createAutoTableConfig } from '@pda/common/domain'

export const incidentTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'incident',
  defaultSort: { field: 'startAt', direction: 'desc' as const }
})
```

(Se preserva el `defaultSort` que tenían los configs viejos: `companyName asc` y `startAt desc`.)

- [ ] **Step 4: Verificar**

Run: `bun run typecheck 2>&1 | grep -E "TS2305|table-config"`
Expected: sin salida.

Run: `bun run typecheck 2>&1 | grep -c "error TS"`
Expected: menor que al final de Task 2.

- [ ] **Step 5: Verificar tests**

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

- [ ] **Step 6: Commit**

```bash
bunx biome check --write packages/providers/infrastructure/repositories/provider-table-config.ts packages/registers/infrastructure/repositories/incident-table-config.ts
git add packages/providers/infrastructure/repositories/provider-table-config.ts packages/registers/infrastructure/repositories/incident-table-config.ts
git commit -m "fix(providers,registers): replace non-existent TableConfig type with createAutoTableConfig"
```

---

### Task 4: Arreglar `ProviderRepository` (genérico faltante + métodos redundantes)

`ProviderRepository extends Deletable` sin argumento de tipo → `TS2314`. Además redeclara los 5 métodos que ya hereda de `FindableAll`, `FindableById`, `FindableByCommunityId`, `Savable` y `Deletable`.

**Files:**
- Modify: `packages/providers/domain/repositories/provider.repository.ts`

**Interfaces:**
- Consumes: los puertos de `@pda/common/domain`.
- Produces: `ProviderRepository` con exactamente los mismos métodos que antes (`findById`, `findAll`, `findByCommunityId`, `findForTable`, `save`, `delete`) — la superficie pública no cambia, solo deja de estar duplicada. `ProviderPrismaRepository` no necesita ningún cambio.

- [ ] **Step 1: Confirmar el error**

Run: `bun run typecheck 2>&1 | grep "provider.repository"`
Expected: `packages/providers/domain/repositories/provider.repository.ts(18,5): error TS2314: Generic type 'Deletable<In>' requires 1 type argument(s).`

- [ ] **Step 2: Reescribir el puerto**

Reemplazar **todo** el contenido de `packages/providers/domain/repositories/provider.repository.ts` por:

```typescript
import type {
  Deletable,
  FindableAll,
  FindableByCommunityId,
  FindableById,
  FindableForTable,
  Savable
} from '@pda/common/domain'
import type { Provider } from '../entities/provider'

export interface ProviderRepository
  extends FindableAll<Provider>,
    FindableById<Provider>,
    FindableByCommunityId<Provider>,
    FindableForTable<Provider>,
    Savable<Provider>,
    Deletable<Provider> {}
```

Nota: `Id` deja de importarse porque ya no se declaran firmas a mano.

- [ ] **Step 3: Verificar**

Run: `bun run typecheck 2>&1 | grep -E "TS2314|provider.repository"`
Expected: sin salida.

- [ ] **Step 4: Verificar tests**

Run: `bun test packages/providers`
Expected: todos verdes, `0 fail`.

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

- [ ] **Step 5: Commit**

```bash
bunx biome check --write packages/providers/domain/repositories/provider.repository.ts
git add packages/providers/domain/repositories/provider.repository.ts
git commit -m "fix(providers): add missing type argument to Deletable and drop redundant method declarations"
```

---

### Task 5: Eliminar las referencias a `customProviderType`

`provider.prisma-repository.ts` lee `provider.customProviderType` (línea 63) y `payload.customProviderType` (línea 105). Esa propiedad **no existe** ni en la entidad `Provider` ni en el modelo Prisma `Provider`. En runtime evalúa a `undefined` y Prisma ignora los `undefined`, así que no rompe nada hoy — pero son dos referencias muertas que el typecheck marca (`TS2551`).

**Files:**
- Modify: `packages/providers/infrastructure/repositories/provider.prisma-repository.ts:63,105`

**Interfaces:**
- Consumes: entidad `Provider` (sin cambios).
- Produces: sin cambios de superficie pública.

- [ ] **Step 1: Confirmar los errores**

Run: `bun run typecheck 2>&1 | grep "customProviderType"`
Expected: dos errores `TS2551` en las líneas 63 y 105.

- [ ] **Step 2: Borrar la línea del `update`**

En `packages/providers/infrastructure/repositories/provider.prisma-repository.ts`, dentro del objeto `update` de `save()`, borrar la línea:

```typescript
      customProviderType: provider.customProviderType ?? undefined,
```

- [ ] **Step 3: Borrar la línea del mapeo de payload**

En el mismo archivo, dentro de `fromPrismaPayload()`, borrar la línea:

```typescript
      customProviderType: payload.customProviderType ?? undefined,
```

- [ ] **Step 4: Verificar**

Run: `bun run typecheck 2>&1 | grep "customProviderType"`
Expected: sin salida.

- [ ] **Step 5: Verificar tests**

Run: `bun test packages/providers`
Expected: `0 fail`. (Si algún test aserta sobre `customProviderType`, es un test sobre un campo inexistente — borrá esa aserción y anotalo en el mensaje de commit.)

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

- [ ] **Step 6: Commit**

```bash
bunx biome check --write packages/providers/infrastructure/repositories/provider.prisma-repository.ts
git add packages/providers/infrastructure/repositories/provider.prisma-repository.ts
git commit -m "fix(providers): remove references to non-existent customProviderType field"
```

---

### Task 6: Borrar el config de tabla duplicado de community-zone

`community-zone-table-config.ts` exporta una constante llamada `communityTableConfig` (nombre copiado del archivo vecino) y **nadie lo importa**: `community-zone.prisma-repository.ts` importa el config de *community*. Como `PrismaTableQueryBuilder` recibe el `modelName` por constructor y no por config, el comportamiento actual es correcto por accidente. Se borra el archivo muerto y se deja el import explícito.

**Files:**
- Delete: `packages/community/infrastructure/repositories/community-zone-table-config.ts`
- Modify: `packages/community/infrastructure/repositories/community-zone.prisma-repository.ts:6,21`

**Interfaces:**
- Consumes: `communityTableConfig` de `./community-table-config` (sin cambios).
- Produces: sin cambios de comportamiento; `CommunityZonePrismaRepository` sigue construyendo el mismo builder.

- [ ] **Step 1: Confirmar que el archivo está huérfano**

Run: `grep -rn "community-zone-table-config" --include=*.ts packages apps`
Expected: **sin salida** (nadie lo importa).

- [ ] **Step 2: Borrar el archivo**

```bash
git rm packages/community/infrastructure/repositories/community-zone-table-config.ts
```

- [ ] **Step 3: Documentar el import compartido**

En `packages/community/infrastructure/repositories/community-zone.prisma-repository.ts`, línea 6, dejar el import como está pero añadir el comentario que explica por qué una entidad usa el config de otra:

```typescript
// Shared config: modelName is passed to PrismaTableQueryBuilder via constructor, not via config
import { communityTableConfig } from './community-table-config'
```

- [ ] **Step 4: Verificar**

Run: `bun run typecheck 2>&1 | grep "community-zone"`
Expected: sin salida.

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

- [ ] **Step 5: Commit**

```bash
bunx biome check --write packages/community/infrastructure/repositories/community-zone.prisma-repository.ts
git add -A packages/community/infrastructure/repositories/
git commit -m "chore(community): remove orphan community-zone table config"
```

---

### Task 7: Borrar el `UserUpdater` duplicado

`packages/user/application/user-updater.service.ts` es una copia **byte a byte** de `packages/user/infrastructure/controllers/user-updater.controller.ts`. La factory usa la del controller, y `infrastructure/index.ts` la reexporta como `UserUpdaterController`. La copia de `application/` no la importa nadie.

Se borra la copia huérfana y **no** se mueve el controller en esta fase: mover el servicio de `infrastructure/controllers/` a `application/` es un refactor de estructura que toca la factory y el barrel, y pertenece a la Fase 3 (Apéndice B).

**Files:**
- Delete: `packages/user/application/user-updater.service.ts` (y el directorio `packages/user/application/`, que queda vacío)

**Interfaces:**
- Consumes: nada.
- Produces: nada. `UserFactory.userUpdaterService()` y `UserUpdaterController` siguen funcionando igual.

- [ ] **Step 1: Confirmar que es un duplicado exacto y que está huérfano**

```bash
diff packages/user/application/user-updater.service.ts packages/user/infrastructure/controllers/user-updater.controller.ts
grep -rn "application/user-updater.service" --include=*.ts packages apps
```

Expected: el `diff` solo muestra la diferencia de rutas de import relativas (`../domain` vs `../../domain/...`); el `grep` no devuelve nada.

- [ ] **Step 2: Borrar**

```bash
git rm packages/user/application/user-updater.service.ts
```

- [ ] **Step 3: Verificar**

Run: `bun run typecheck 2>&1 | grep "packages/user"`
Expected: sin salida.

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

- [ ] **Step 4: Commit**

```bash
git add -A packages/user/
git commit -m "chore(user): remove duplicated UserUpdater application service"
```

---

### Task 8: Borrar la infraestructura de tabla y de eventos sin usar

Cuatro bloques de código muerto verificado (0 referencias fuera de su propio archivo y de los barrels):

1. `table-query-builder.ts` (252 líneas): clase abstracta `TableQueryBuilder` + interfaz `DatabaseQuery`, sin ninguna subclase. Vestigio del diseño dual prisma/mongo (`databaseType: 'prisma' | 'mongo'`, `atlasSearchMode`) que nunca se materializó.
2. `base-table.repository.ts` (120 líneas): `BaseTableRepository`, nadie la extiende — todos los repos extienden `BasePrismaRepository` y componen `PrismaTableQueryBuilder`.
3. `packages/common/domain/events/` (3 archivos): `DomainEvent`, `DomainEventSubscriber`, `DomainEventName`. Cero eventos en todo el repo. Hay un comentario en `water-meter-reading-creator.service.ts:100` que dice *"If we would have events we would launch an event instead"* — se deja tal cual, sigue siendo una nota válida.
4. `uuid.ts`: la clase `Uuid`, sin usar. Borrarla permite además sacar la dependencia `uuid` de `@pda/common` y elimina el error `TS7016` (faltan los tipos de `uuid`).

**Files:**
- Delete: `packages/common/infrastructure/repositories/table-query-builder.ts`
- Delete: `packages/common/infrastructure/repositories/base-table.repository.ts`
- Delete: `packages/common/domain/events/domain-event.ts`, `domain-event-name.ts`, `domain-event-subscriber.ts`
- Delete: `packages/common/domain/value-objects/uuid.ts`
- Modify: `packages/common/infrastructure/index.ts`, `packages/common/domain/index.ts`, `packages/common/package.json`

**Interfaces:**
- Consumes: nada.
- Produces: `@pda/common/infrastructure` deja de exportar `BaseTableRepository` y `TableQueryBuilder`; `@pda/common/domain` deja de exportar `DomainEvent` y `Uuid`. Sigue exportando todo lo demás sin cambios.

- [ ] **Step 1: Confirmar que todo está huérfano**

```bash
for s in BaseTableRepository TableQueryBuilder DatabaseQuery DomainEvent DomainEventSubscriber DomainEventName Uuid; do
  echo "--- $s"
  grep -rlw "$s" --include=*.ts --include=*.tsx packages apps/webapp/src apps/seed-data/src | grep -v '/generated/'
done
```

Expected: para cada símbolo, solo aparecen su propio archivo y los barrels de `packages/common`. Si aparece cualquier otro archivo, **parar** y reportarlo — ese símbolo no es huérfano.

- [ ] **Step 2: Borrar los archivos**

```bash
git rm packages/common/infrastructure/repositories/table-query-builder.ts \
       packages/common/infrastructure/repositories/base-table.repository.ts \
       packages/common/domain/events/domain-event.ts \
       packages/common/domain/events/domain-event-name.ts \
       packages/common/domain/events/domain-event-subscriber.ts \
       packages/common/domain/value-objects/uuid.ts
```

- [ ] **Step 3: Limpiar el barrel de infrastructure**

Reemplazar **todo** el contenido de `packages/common/infrastructure/index.ts` por:

```typescript
export { sendEmail, sendResetPasswordEmail } from './email-service'
export { BasePrismaRepository } from './repositories/base-prisma.repository'
export { PrismaTableQueryBuilder } from './repositories/prisma-table-query-builder'
```

- [ ] **Step 4: Limpiar el barrel de domain**

En `packages/common/domain/index.ts`, borrar estas dos líneas:

```typescript
export { DomainEvent } from './events/domain-event'
```

```typescript
export { Uuid } from './value-objects/uuid'
```

Todas las demás exportaciones quedan igual.

- [ ] **Step 5: Sacar la dependencia `uuid`**

En `packages/common/package.json`, borrar de `"dependencies"` la línea:

```json
    "uuid": "^10.0.0",
```

Run: `bun install`

- [ ] **Step 6: Verificar**

Run: `bun run typecheck 2>&1 | grep -E "TS7016|uuid|table-query-builder|base-table"`
Expected: sin salida.

Run: `bun run typecheck 2>&1 | grep -c "error TS"`
Expected: menor que al final de Task 5. Anotalo.

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

- [ ] **Step 7: Commit**

```bash
bunx biome check --write packages/common/
git add -A packages/common/ bun.lock
git commit -m "chore(common): remove unused table builder, domain events and Uuid value object"
```

---

### Task 9: Borrar `withDomainErrorHandling` y las clases de error sin usar

Restos menores, en dos paquetes distintos pero de la misma naturaleza (exportado y jamás consumido):

- `withDomainErrorHandling` en `apps/webapp/src/server/api/error-handler.ts:26` — nunca usada; todos los routers llaman `handleDomainError` directo en el `catch`.
- `UnauthorizedError` y `RateLimitError` en `packages/common/domain/errors/domain-errors.ts` — sin referencias. `BadRequestError`, `ForbiddenError` y `NotFoundError` **sí** se usan (los extienden los errores de dominio de water-account, registers, fees y providers): no tocarlas.

**Files:**
- Modify: `apps/webapp/src/server/api/error-handler.ts` (borrar líneas 22-36)
- Modify: `packages/common/domain/errors/domain-errors.ts` (borrar dos clases)

**Interfaces:**
- Consumes: nada.
- Produces: `handleDomainError(error: unknown): never` sigue exportada e intacta.

- [ ] **Step 1: Confirmar que están huérfanos**

```bash
grep -rn "withDomainErrorHandling" apps/webapp/src packages --include=*.ts --include=*.tsx
for s in UnauthorizedError RateLimitError; do echo "--- $s"; grep -rlw "$s" --include=*.ts --include=*.tsx packages apps/webapp/src | grep -v '/generated/'; done
```

Expected: `withDomainErrorHandling` solo aparece en su propia definición; `UnauthorizedError` y `RateLimitError` solo en `domain-errors.ts`.

- [ ] **Step 2: Borrar la función wrapper**

En `apps/webapp/src/server/api/error-handler.ts`, borrar desde el comentario `/**` de la línea 22 hasta el final del archivo, dejando el archivo terminado justo después del cierre de `handleDomainError`. El archivo queda así:

```typescript
import { TRPCError } from '@trpc/server'

/**
 * Handles domain errors and converts them to TRPC errors with Spanish messages
 * This ensures consistent error handling across all tRPC routers
 */
export function handleDomainError(error: unknown): never {
  // Handle domain errors with Spanish messages
  if (error?.constructor && 'defaultMessageEs' in error.constructor) {
    const errorClass = error.constructor as { defaultMessageEs: string; statusCode?: number }
    const errorCode = errorClass.statusCode === 404 ? 'NOT_FOUND' : 'BAD_REQUEST'
    throw new TRPCError({
      code: errorCode,
      message: errorClass.defaultMessageEs
    })
  }

  // Re-throw the original error if it's not a domain error
  throw error
}
```

- [ ] **Step 3: Borrar las dos clases de error**

En `packages/common/domain/errors/domain-errors.ts`, borrar los bloques completos de `UnauthorizedError` (líneas 12-21) y `RateLimitError` (líneas 45-54). El archivo queda con `BadRequestError`, `ForbiddenError` y `NotFoundError`.

- [ ] **Step 4: Verificar**

Run: `bun run typecheck 2>&1 | grep "domain-errors"`
Expected: sin salida.

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

- [ ] **Step 5: Commit**

```bash
bunx biome check --write apps/webapp/src/server/api/error-handler.ts packages/common/domain/errors/domain-errors.ts
git add apps/webapp/src/server/api/error-handler.ts packages/common/domain/errors/domain-errors.ts
git commit -m "chore: remove unused withDomainErrorHandling wrapper and unused error classes"
```

---

### Task 10: Sacar el `console.log` de producción y limpiar `PrismaTableQueryBuilder`

`prisma-table-query-builder.ts` loguea `{ include, where, orderBy }` en **cada query paginada de producción** (línea 20) y tiene un `@ts-expect-error` que ya no expecta nada (línea 246). Es además el archivo con más errores de tipo del backend (13 en el baseline), casi todos por `noUncheckedIndexedAccess`.

**Files:**
- Modify: `packages/common/infrastructure/repositories/prisma-table-query-builder.ts`

**Interfaces:**
- Consumes: `TableQueryConfig` (arreglado en Task 2).
- Produces: `PrismaTableQueryBuilder<TEntity, TDto>` con la misma API pública (`findForTable(params)`).

- [ ] **Step 1: Ver los errores que quedan en el archivo**

Run: `bun run typecheck 2>&1 | grep "prisma-table-query-builder"`

Anotá la lista. Después de Task 2 muchos de los `TS2345` deberían haber desaparecido; lo que queda son mayormente accesos indexados posiblemente `undefined`.

- [ ] **Step 2: Borrar el `console.log`**

En `findForTable()`, borrar la línea 20:

```typescript
    console.log({ include, where, orderBy })
```

- [ ] **Step 3: Arreglar el acceso indexado de `buildWhereClause`**

Reemplazar el final de `buildWhereClause` (líneas 60-62):

```typescript
    if (!conditions.length) return {}
    if (conditions.length === 1) return conditions[0]
    return { AND: conditions }
```

por:

```typescript
    const [firstCondition] = conditions
    if (!firstCondition) return {}
    if (conditions.length === 1) return firstCondition
    return { AND: conditions }
```

- [ ] **Step 4: Arreglar el acceso indexado de `buildFilterConditions`**

Reemplazar el cuerpo del `map` (líneas 91-97):

```typescript
    return Object.entries(grouped).map(([, fieldFilters]) => {
      if (fieldFilters.length > 1) {
        const conditions = fieldFilters.map((f) => this.buildSingleFilterCondition(f))
        return { OR: conditions }
      }
      return this.buildSingleFilterCondition(fieldFilters[0])
    })
```

por:

```typescript
    return Object.entries(grouped).flatMap(([, fieldFilters]) => {
      if (fieldFilters.length > 1) {
        const conditions = fieldFilters.map((f) => this.buildSingleFilterCondition(f))
        return [{ OR: conditions }]
      }
      const [singleFilter] = fieldFilters
      if (!singleFilter) return []
      return [this.buildSingleFilterCondition(singleFilter)]
    })
```

- [ ] **Step 5: Arreglar el destructuring de campos anidados**

En `buildDefaultSearchCondition` (líneas 118-131), reemplazar:

```typescript
    if (field.includes('.')) {
      const [relation, subField] = field.split('.')
      const leaf = subField
```

por:

```typescript
    if (field.includes('.')) {
      const [relation, subField] = field.split('.')
      if (!relation || !subField) return undefined
      const leaf = subField
```

Y en `buildOrderBy` (líneas 198-205), reemplazar:

```typescript
    if (field.includes('.')) {
      const [relation, subField] = field.split('.')
      return {
        [relation]: {
          [subField]: direction
        }
      }
    }
```

por:

```typescript
    if (field.includes('.')) {
      const [relation, subField] = field.split('.')
      if (relation && subField) {
        return {
          [relation]: {
            [subField]: direction
          }
        }
      }
    }
```

- [ ] **Step 6: Arreglar el `groupFiltersByField`**

En `groupFiltersByField` (líneas 222-229), reemplazar:

```typescript
      (grouped, filter) => {
        if (!grouped[filter.field]) grouped[filter.field] = []
        grouped[filter.field].push(filter)
        return grouped
      },
```

por:

```typescript
      (grouped, filter) => {
        const bucket = grouped[filter.field] ?? []
        bucket.push(filter)
        grouped[filter.field] = bucket
        return grouped
      },
```

- [ ] **Step 7: Resolver el `@ts-expect-error` inútil**

En `getModel()` (líneas 245-248), reemplazar:

```typescript
  private getModel() {
    // @ts-expect-error dynamic model
    return this.db[this.modelName]
  }
```

por:

```typescript
  private getModel() {
    // Dynamic model access by string name; Prisma has no index signature for this
    const models = this.db as unknown as Record<
      string,
      {
        findMany: (args: Record<string, unknown>) => Promise<unknown[]>
        count: (args: Record<string, unknown>) => Promise<number>
      }
    >
    const model = models[this.modelName]
    if (!model) {
      throw new Error(`PrismaTableQueryBuilder: unknown model "${this.modelName}"`)
    }
    return model
  }
```

- [ ] **Step 8: Arreglar el `implicit any` del map**

En `findForTable`, línea 34, reemplazar:

```typescript
    const entities = items.map((item) => entityFromDto(item as Record<string, unknown>))
```

por:

```typescript
    const entities = items.map((item: unknown) => entityFromDto(item as Record<string, unknown>))
```

- [ ] **Step 9: Verificar**

Run: `bun run typecheck 2>&1 | grep "prisma-table-query-builder"`
Expected: sin salida. Si queda algún error, resolvelo con el mismo criterio (guardas explícitas, nunca `as any`).

Run: `grep -n "console\." packages/common/infrastructure/repositories/prisma-table-query-builder.ts`
Expected: sin salida.

- [ ] **Step 10: Verificar tests — esta es la tarea de mayor riesgo del plan**

Run: `bun test packages`
Expected: `281 pass`, `0 fail`

Los tests no cubren el builder directamente, así que además hacé una verificación manual del camino real:

```bash
bun run dbs        # levanta postgres
bun run db:sync    # (arreglado en Task 12; si todavía falla, usar: bun run -F @pda/database db:sync)
bun run webapp
```

Abrí `http://localhost:3005`, entrá a una tabla que use el proxy (usuarios, comunidades, puntos de agua o análisis), y comprobá que **lista, pagina, ordena y busca**. Los 4 modelos ruteados por `TableRepositoryProxy` son `user`, `community`, `waterPoint` y `analysis`.

- [ ] **Step 11: Commit**

```bash
bunx biome check --write packages/common/infrastructure/repositories/prisma-table-query-builder.ts
git add packages/common/infrastructure/repositories/prisma-table-query-builder.ts
git commit -m "fix(common): remove production console.log and fix unchecked index access in table query builder"
```

---

### Task 11: Arreglar los tests con referencias rotas

Seis tests tienen referencias que no compilan. Dos de ellos revelan bugs reales en el propio test (asertan sobre cosas que el código no hace):

| Archivo | Error | Causa |
|---|---|---|
| `water-account/tests/water-meter-reading-creator.service.test.ts:4` | `TS2307` | importa `../application/file-uploader.service`; ese servicio vive en `@pda/storage` |
| `water-account/tests/water-meter-reading-deleter.service.test.ts:4` | `TS2307` | ídem con `file-deleter.service` |
| `water-account/tests/water-meter-reading-updater.service.test.ts:4,5` | `TS2307` x2 | ídem, ambos |
| `water-account/tests/water-meter-replacer.service.test.ts:50` | `TS2554` | `Expected 3 arguments, but got 2` — el constructor de `WaterMeterReplacer` pide 3 |
| `water-account/tests/water-meter-last-reading-updater.service.test.ts:62` | `TS2741` | falta `waterDepositIds` en el DTO de water point |
| `registers/test/application/issue-updater.test.ts:34` | `TS2561` | pasa `updatedIncident` en vez de `updatedIncidentData` |
| `community/tests/water-point-connection-number.test.ts:49` | `TS2749` | usa `PrismaClient` como tipo en vez de `typeof PrismaClient` |

**Files:**
- Modify: los 6 archivos de test listados arriba.

**Interfaces:**
- Consumes: `FileUploaderService` y `FileDeleterService` desde `@pda/storage`; `WaterMeterReplacer(waterMeterRepository, waterMeterReadingCreator, fileUploaderService)`.
- Produces: nada (son tests).

- [ ] **Step 1: Ver el estado exacto**

Run: `bun run typecheck 2>&1 | grep -E "tests?/"`

Anotá la lista completa; puede haber alguno más que los 7 de la tabla.

- [ ] **Step 2: Corregir los imports de storage**

Los tres archivos ya importan algo de `@pda/storage`, así que el arreglo es fusionar el símbolo roto en ese import y borrar la línea rota.

En `packages/water-account/tests/water-meter-reading-creator.service.test.ts`, reemplazar las líneas 3-4:

```typescript
import { FileMetadata } from '@pda/storage'
import type { FileUploaderService } from '../application/file-uploader.service'
```

por:

```typescript
import { FileMetadata, type FileUploaderService } from '@pda/storage'
```

En `packages/water-account/tests/water-meter-reading-deleter.service.test.ts`, reemplazar las líneas 3-4:

```typescript
import { ImageEntityType } from '@pda/storage'
import type { FileDeleterService } from '../application/file-deleter.service'
```

por:

```typescript
import { type FileDeleterService, ImageEntityType } from '@pda/storage'
```

En `packages/water-account/tests/water-meter-reading-updater.service.test.ts`, reemplazar las líneas 3-5:

```typescript
import { FileMetadata } from '@pda/storage'
import type { FileDeleterService } from '../application/file-deleter.service'
import type { FileUploaderService } from '../application/file-uploader.service'
```

por:

```typescript
import { type FileDeleterService, FileMetadata, type FileUploaderService } from '@pda/storage'
```

- [ ] **Step 3: Ejecutar los tests tocados**

Run: `bun test packages/water-account/tests/water-meter-reading-creator.service.test.ts packages/water-account/tests/water-meter-reading-deleter.service.test.ts packages/water-account/tests/water-meter-reading-updater.service.test.ts`
Expected: `0 fail`

- [ ] **Step 4: Corregir la aridad del constructor en el replacer test**

`WaterMeterReplacer` recibe 3 dependencias (`waterMeterRepository`, `waterMeterReadingCreator`, `fileUploaderService`) y el test solo pasa 2. Falta el mock del uploader.

En `packages/water-account/tests/water-meter-replacer.service.test.ts`, añadir el import después de la línea 2:

```typescript
import type { FileUploaderService } from '@pda/storage'
```

Declarar la variable junto a las otras dos (después de la línea 17):

```typescript
  let mockFileUploaderService: FileUploaderService
```

Y en el `beforeEach`, reemplazar las líneas 46-50:

```typescript
    mockWaterMeterReadingCreator = {
      run: mock()
    } as unknown as WaterMeterReadingCreator

    service = new WaterMeterReplacer(mockWaterMeterRepository, mockWaterMeterReadingCreator)
```

por:

```typescript
    mockWaterMeterReadingCreator = {
      run: mock()
    } as unknown as WaterMeterReadingCreator

    mockFileUploaderService = {
      run: mock()
    } as unknown as FileUploaderService

    service = new WaterMeterReplacer(
      mockWaterMeterRepository,
      mockWaterMeterReadingCreator,
      mockFileUploaderService
    )
```

(El doble assertion `as unknown as` es el patrón ya establecido en este archivo y en `tests/helpers/mocks.ts`; se mantiene por consistencia.)

- [ ] **Step 5: Corregir el DTO incompleto**

En `packages/water-account/tests/water-meter-last-reading-updater.service.test.ts:62`, añadir al objeto literal del water point:

```typescript
      waterDepositIds: [],
```

- [ ] **Step 6: Corregir el nombre de propiedad en issue-updater**

En `packages/registers/test/application/issue-updater.test.ts:34`, renombrar la propiedad `updatedIncident` a `updatedIncidentData`.

**Ojo:** el test estaba pasando un parámetro que el servicio ignora, así que la aserción que lo acompaña puede estar verificando algo que nunca ocurría. Después del rename, si el test falla, **es un bug real que el test tapaba** — arreglalo (o marcalo y reportalo) en vez de revertir el rename.

- [ ] **Step 7: Corregir el uso de `PrismaClient` como tipo**

En `packages/community/tests/water-point-connection-number.test.ts:49`, reemplazar la anotación `PrismaClient` por `typeof PrismaClient` (o por el tipo del cliente que ya usan los otros tests del paquete, `typeof prisma`).

- [ ] **Step 8: Verificar todo**

Run: `bun run typecheck 2>&1 | grep -cE "tests?/"`
Expected: `0`

Run: `bun test packages`
Expected: `0 fail`. El total puede subir si el rename del Step 6 destapa aserciones nuevas — lo importante es que no haya fallos.

- [ ] **Step 9: Commit**

```bash
bunx biome check --write packages/water-account/tests packages/registers/test packages/community/tests
git add packages/water-account/tests packages/registers/test packages/community/tests
git commit -m "fix(tests): correct broken imports, constructor arity and param names"
```

---

### Task 12: Declarar la dependencia faltante y arreglar los scripts rotos de la raíz

Dos cosas de manifest que se arreglan juntas porque ambas se verifican ejecutando comandos:

1. `@pda/storage` importa `@pda/common/domain` en 3 archivos pero **no lo declara** en su `package.json`. Funciona solo por la resolución de bun. Declararlo lo hace honesto y hace que `packages/storage/node_modules/@pda/common` exista.
2. Scripts rotos en la raíz: `db:sync` filtra por `@pta/database` (typo, el paquete es `@pda/database`) y `start` invoca `bun run admin`, un script que no existe.

**Nota sobre `@pda/common` → `@pda/database`:** `common/infrastructure` importa tipos de `@pda/database`, que a su vez depende de `@pda/common`. Declararlo crearía un ciclo en el grafo de workspaces. Como los imports son `import type` (se borran en runtime) y los `paths` de Task 1 ya los resuelven para el typecheck, **no se declara** en esta fase. La solución real —mover `BasePrismaRepository` y `PrismaTableQueryBuilder` a `@pda/database`— está en el Apéndice B.

**Files:**
- Modify: `packages/storage/package.json`
- Modify: `package.json` (raíz, `scripts.db:sync` y `scripts.start`)

**Interfaces:**
- Consumes: nada.
- Produces: `bun run db:sync` y `bun start` funcionales.

- [ ] **Step 1: Confirmar que los scripts fallan**

Run: `bun run db:sync`
Expected: falla, no encuentra el workspace `@pta/database`.

- [ ] **Step 2: Declarar la dependencia de storage**

En `packages/storage/package.json`, dentro de `"dependencies"`, añadir antes de `"@aws-sdk/client-s3"`:

```json
    "@pda/common": "workspace:*",
```

- [ ] **Step 3: Reinstalar y verificar el symlink**

Run: `bun install`
Run: `ls packages/storage/node_modules/@pda/`
Expected: aparece `common`.

- [ ] **Step 4: Arreglar el typo de `db:sync`**

En `package.json` de la raíz, reemplazar:

```json
    "db:sync": "bun run -F @pta/database db:sync",
```

por:

```json
    "db:sync": "bun run -F @pda/database db:sync",
```

- [ ] **Step 5: Arreglar el script `start`**

El script `start` orquesta dos apps con `concurrently`, pero solo existe `webapp` (`admin` es un nombre heredado de una app que ya no está). Reemplazar:

```json
    "start": "concurrently -k --prefix-colors 'red,green,blue,yellow' --names 'admin,webapp' --prefix '[{name}]' 'bun run admin' 'bun run webapp'",
```

por:

```json
    "start": "bun run webapp",
```

- [ ] **Step 6: Alinear el README con la realidad**

El `README.md` documenta una app que no existe. Corregir:

1. En el diagrama de estructura, reemplazar `│   └── admin/          # NextJS 14 admin dashboard` por `│   ├── webapp/         # NextJS admin & management dashboard` y añadir debajo `│   └── seed-data/      # Data import and seeding tooling`.
2. En la sección "Available Applications", reemplazar el bloque de comando `bun run admin` por `bun run webapp`, y el título "Admin Dashboard" por "Webapp".
3. Añadir a la lista de bounded contexts los tres que faltan: `@pda/fees`, `@pda/providers` y `@pda/storage`.
4. Verificar que **cada** comando que el README documenta existe realmente:

```bash
grep -oE 'bun run [a-z:-]+' README.md | sort -u
bun run --silent 2>&1 | head -40
```

Si el README menciona algún script que no está en `package.json` (por ejemplo `bun run db:seed`, que vive en `packages/database` y se invoca con `bun run -F @pda/database db:seed`), corregí la invocación documentada.

- [ ] **Step 7: Verificar**

Run: `bun run db:sync`
Expected: corre `prisma generate` + `prisma db push` sin error de workspace. (Necesita la base levantada: `bun run dbs` primero.)

Run: `bun run typecheck 2>&1 | grep -c "error TS"`
Expected: igual o menor que al final de Task 11.

Run: `bun test packages`
Expected: `0 fail`

- [ ] **Step 8: Commit**

```bash
git add package.json packages/storage/package.json bun.lock README.md
git commit -m "fix(tooling): declare missing @pda/common dependency, repair root scripts and README"
```

---

### Task 13: Cerrar los errores restantes hasta llegar a cero

Después de las tareas 2-12 deberían quedar pocos errores sueltos (los que no entraron en ningún grupo). Esta tarea los liquida uno por uno para que Task 14 pueda añadir un gate que no admita excepciones.

**Files:**
- Modify: los que reporte el typecheck. Esperables según el baseline: los adaptadores Prisma con `TS7006` (`implicit any` en callbacks de `.map()`) en `community`, `registers`, `providers`, `water-account`, `user`; y `TS2345` de payloads Prisma que no encajan con los DTOs de dominio en `water-point.prisma-repository.ts`.

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: `bun run typecheck` con **0 errores**.

- [ ] **Step 1: Listar lo que queda**

Run: `bun run typecheck 2>&1 | grep "error TS" | sed 's/(.*//' | sort | uniq -c | sort -rn`

- [ ] **Step 2: Arreglar los `TS7006` (parámetros implícitamente `any`)**

Son callbacks de `.map()` sobre resultados de Prisma. El patrón correcto es tipar el parámetro con el payload de Prisma, no con `any`. Ejemplo, en `packages/community/infrastructure/repositories/community.prisma-repository.ts:38`:

```typescript
    return communities.map((community) => Community.fromDto(fromCommunityPrismaPayload(community)))
```

se convierte en:

```typescript
    return communities.map((community: Prisma.CommunityGetPayload<null>) =>
      Community.fromDto(fromCommunityPrismaPayload(community))
    )
```

Aplicá el mismo criterio en cada sitio, usando el `Prisma.<Model>GetPayload<...>` que corresponda. `Prisma` ya está importado como tipo en todos estos archivos.

- [ ] **Step 3: Arreglar los `TS2345` de payload en water-point**

En `packages/community/infrastructure/repositories/water-point.prisma-repository.ts`, el payload de Prisma trae `notes: string` y `connectionNumber: string | null`, mientras `WaterPointDto` espera `notes?: string` y `connectionNumber?: string`. Ajustar `fromPrismaPayload` para normalizar ambos:

```typescript
  private fromPrismaPayload(payload: Prisma.WaterPointGetPayload<null>) {
    return {
      id: payload.id,
      name: payload.name,
      location: payload.location,
      notes: payload.notes ?? undefined,
      connectionNumber: payload.connectionNumber ?? undefined,
      fixedPopulation: payload.fixedPopulation,
      floatingPopulation: payload.floatingPopulation,
      cadastralReference: payload.cadastralReference,
      communityZoneId: payload.communityZoneId,
      waterDepositIds: payload.waterDepositIds ?? []
    }
  }
```

Esto además deja de propagar `createdAt`/`updatedAt` de Prisma hacia la capa de dominio, que era una fuga silenciosa.

- [ ] **Step 4: Arreglar lo que quede**

Para cada error restante, aplicá el criterio general: guardas explícitas para índices posiblemente `undefined`, tipos de payload de Prisma para callbacks, y **nunca** `as any` ni `@ts-ignore`. Si un error solo se puede resolver con un cambio de diseño (por ejemplo el embebido `WaterMeter`→`WaterPoint`), **parar y reportarlo** — eso es Fase 3, no se fuerza acá.

- [ ] **Step 5: Verificar cero**

Run: `bun run typecheck`
Expected: sin salida, exit code 0.

Run: `echo $?`
Expected: `0`

- [ ] **Step 6: Verificar tests**

Run: `bun test packages`
Expected: `0 fail`

- [ ] **Step 7: Commit**

```bash
bunx biome check --write packages/
git add packages/
git commit -m "fix(packages): resolve remaining type errors to reach a clean typecheck"
```

---

### Task 14: Añadir el gate de CI

Sin esto, todo lo anterior se vuelve a pudrir en dos semanas. Recordá que `apps/webapp/next.config.js` tiene `typescript.ignoreBuildErrors: true`, así que el build **no** es un gate — este job es el único que va a mirar los tipos del backend.

**Files:**
- Create: `.github/workflows/typecheck.yml`

**Interfaces:**
- Consumes: el script `typecheck` de Task 1.
- Produces: un check obligatorio en cada push y PR.

- [ ] **Step 1: Crear el workflow**

Crear `.github/workflows/typecheck.yml`:

```yaml
name: Typecheck

on:
  push:
  pull_request:

jobs:
  typecheck:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: "1.2.21"

      - name: Install dependencies
        run: bun install

      - name: Generate Prisma client
        run: bun run -F @pda/database generate

      - name: Typecheck backend packages
        run: bun run typecheck
```

El paso de `prisma generate` es imprescindible: `packages/database/prisma/generated/` está en `.gitignore`, así que en un checkout limpio los tipos de Prisma no existen y el typecheck fallaría con cientos de `TS2307`.

- [ ] **Step 2: Verificar el workflow localmente**

Simulá el checkout limpio:

```bash
rm -rf packages/database/prisma/generated
bun install
bun run -F @pda/database generate
bun run typecheck
```

Expected: sin salida, exit code 0.

- [ ] **Step 3: Commit y push**

```bash
git add .github/workflows/typecheck.yml
git commit -m "ci: add typecheck gate for backend packages"
git push -u origin worktree-backend-cleanup-plan
```

- [ ] **Step 4: Verificar en GitHub**

Abrí un PR en draft y comprobá que los tres checks (Biome CI, Run Tests, Typecheck) quedan en verde.

```bash
gh pr create --draft --title "Backend fase 1: bugs, tooling y código muerto" --body "Ver docs/superpowers/plans/2026-07-30-backend-phase1-cleanup.md"
```

- [ ] **Step 5: Limpiar el CI heredado (opcional, mismo PR)**

`.github/workflows/tests.yml` inyecta `WALLETS_API_ALLOWED_IPS` y `REDIS_URL`, variables de otro proyecto que este repo no usa. Verificá con `grep -rn "WALLETS_API_ALLOWED_IPS\|REDIS_URL" --include=*.ts packages apps` que no aparecen en el código, y si no aparecen, borralas del workflow.

```bash
git add .github/workflows/tests.yml
git commit -m "ci: drop unused env vars inherited from another project"
```

---

## Verificación final

Con las 14 tareas cerradas, desde la raíz del worktree:

```bash
bun install
bun run -F @pda/database generate
bun run typecheck          # 0 errores, exit 0
bun test packages          # 0 fail
bunx biome ci --diagnostic-level=error .   # limpio
```

Y la verificación de que no se rompió nada en funcionamiento real (el typecheck no prueba comportamiento):

```bash
bun run dbs
bun run db:sync
bun run webapp
```

En `http://localhost:3005`:
1. Listar, paginar, ordenar y **buscar** en una tabla del proxy (usuarios / comunidades / puntos de agua / análisis) — cubre Task 10, la de más riesgo.
2. Crear una lectura de contador con imagen — cubre el camino storage tras Task 12.
3. Crear y cerrar una incidencia — cubre registers tras Task 3.
4. Crear un proveedor — cubre Task 5.

Conteo esperado de líneas borradas: ~600 (`git diff --stat main`).

---

## Apéndice A — Decisiones tomadas para fases siguientes

- **Multi-tenancy (Fase 2):** enfoque elegido = **middleware + guards explícitos**. Un `communityScopedProcedure` en `apps/webapp/src/server/api/trpc.ts` que resuelva y valide la comunidad e inyecte `ctx.communityId` ya verificado, más guards por recurso donde el id llega por input. Hay ~18 endpoints a auditar y 4 `findAll()` sin scope a borrar (`waterAccount.getAllWaterAccounts`, `incidents.getIncidents`, `registers.getAnalyses`, `providers.getProviders`). El patrón de referencia ya implementado correctamente es `apps/webapp/src/server/api/routers/fees.ts`.

## Apéndice B — Deuda identificada y deliberadamente NO tocada en Fase 1

Cada punto es un plan aparte; ninguno es requisito de esta fase.

1. **Ciclo `@pda/common` ↔ `@pda/database`**: mover `BasePrismaRepository` y `PrismaTableQueryBuilder` a `@pda/database`, o parametrizar el cliente por genérico. Mientras tanto, los `paths` de `tsconfig.packages.json` lo sostienen.
2. **Typecheck del webapp**: 166 errores medidos con su propio tsconfig; quitar `ignoreBuildErrors: true` de `next.config.js` requiere cerrarlos antes.
3. **Tsconfigs por paquete**: si se quiere impedir imports entre paquetes no declarados, partir `tsconfig.packages.json` en 8 proyectos con `references`.
4. **`UserUpdater` en `infrastructure/controllers/`**: es un application service viviendo en infraestructura, en una carpeta que ningún otro paquete tiene. Moverlo a `packages/user/application/` y actualizar `UserFactory` + barrel.
5. **Sin transacciones**: `WaterPointOnboarding` y `WaterMeterReplacer` compensan a mano con `delete()` en `catch`. Hace falta un `TransactionPort` en `@pda/common/domain` con adaptador `prisma.$transaction`.
6. **`WaterMeter` embebe la entidad `WaterPoint`** de otro bounded context: obliga a fabricar un WaterPoint falso con `'Unknown'` en `water-meter.prisma-repository.ts:25-40` y a repetir el mismo `include`+mapeo 6 veces en 423 líneas.
7. **Reglas de negocio fuera del dominio**: unicidad de `connectionNumber` en el repositorio Prisma; cálculo de exceso de consumo con `if (rule.getRuleType() === 'PERSON_BASED')` en un application service, cuando `WaterLimitRule` ya es polimórfico. No existe ningún `domain/services/` en el repo.
8. **Los routers tRPC son la capa de aplicación**: `exportWaterMeterReadings` (`water-account.ts:390-500`) son 110 líneas de caso de uso con `await import()` dinámico y N+1, sin tests.
9. **Config de R2 duplicada** en `water-account.factory.ts:174-180` y `registers.factory.ts:80-86`; `@pda/storage` es el único paquete sin factory propia.
10. **Restos de migración**: `ImageEntityType` es un alias "backward compatibility" de `FileEntityType`, pero `water-account` usa el alias viejo y `registers` el nombre nuevo. Ídem `MAX_FILE_SIZE`.
11. **Carpetas de test inconsistentes**: `test/` en common y registers, `tests/` en los otros cinco.
