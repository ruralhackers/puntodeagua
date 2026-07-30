# Mejoras Mondariz: enlace a Google Maps y búsqueda desde 1 carácter

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que cada punto de agua pueda guardar un enlace de Google Maps que se abre desde la ficha del contador, que la búsqueda de contadores funcione desde el primer carácter (hoy los enganches < 100 son inencontrables), y que la exportación de lecturas se pueda limitar a una zona además de a un contador concreto.

**Architecture:** `mapsUrl` es un campo opcional de texto en `WaterPoint` que atraviesa las capas existentes igual que `connectionNumber` (Prisma → entidad/DTO de dominio → repositorio → servicio de aplicación → router tRPC → formularios). El href se calcula en el cliente con un helper puro que acepta URL `http(s)` o coordenadas `lat,lng` y rechaza cualquier otra cosa (incluido `javascript:`). El botón "Ver Punto" de la ficha del contador, que hoy enlaza a la ruta inexistente `/water-point/<id>` y devuelve 404, se sustituye por el botón de Google Maps. La búsqueda baja a 1 carácter cambiando el default de `SearchInput` y quitando los guards `length >= 3` duplicados en las páginas.

**Tech Stack:** Bun, TypeScript, Next.js (App Router), tRPC, Prisma/PostgreSQL, zod, react-hook-form, shadcn/ui, Biome, `bun:test`.

## Global Constraints

- Peticiones que este plan cubre: (1) enlace de Google Maps donde aparece "Ver Punto" en los contadores; (2) buscar por nº de enganche con menos de 3 caracteres; (4) filtrar la exportación de lecturas por zona, no solo "todos" o "un contador concreto". La petición (3) de Mondariz —dar de alta los depósitos "Val Oscuro" y "Landin"— **no requiere código**: ya existe `/management/deposits` con "Nuevo depósito" y la asignación por punto de agua en "Cambiar Datos de Casa". No se toca nada por ella.
- El filtro del export es de una sola zona (no multiselección) y excluyente con el de contador: o todos, o un contador, o una zona.
- Nombre del campo: `mapsUrl` en TypeScript, columna `maps_url` en Postgres. Nullable, sin default.
- El repo no tiene carpeta de migraciones: usa `db push`. La DDL de test la reconstruye `packages/testing/db-harness.ts` desde `schema.prisma`, así que los tests de integración ven la columna nueva sin pasos manuales. Para dev/prod: `bun run db:sync`.
- Texto de UI en español (el resto de la app lo está). Identificadores y comentarios de código en inglés.
- Nunca renderizar un href sin validar el esquema: solo `http://` y `https://`. Un `mapsUrl` guardado es texto libre metido por un usuario.
- Comandos de verificación: `bun run typecheck`, `bun run test:unit`, `bun run check:errors`. Integración: `bun run test:integration` (necesita `docker compose up -d`; el contenedor `puntodeagua2_postgres` ya escucha en 5559 según `.env.test`).
- Un commit por tarea, mensaje en inglés con prefijo convencional (`feat:`, `fix:`).

---

## File Structure

**Nuevos:**
- `apps/webapp/src/lib/maps-link.ts` — helper puro `buildMapsHref`. Vive en `src/lib` porque el glob de tests unitarios es `bun test packages apps/webapp/src/lib`.
- `apps/webapp/src/lib/maps-link.test.ts`
- `apps/webapp/src/lib/water-meter-search.ts` — helper puro de filtrado+orden de contadores (Tarea 7).
- `apps/webapp/src/lib/water-meter-search.test.ts`
- `packages/community/tests/water-point-maps-url.test.ts`

**Modificados (persistencia de `mapsUrl`):**
- `packages/database/prisma/schema.prisma` — columna.
- `packages/community/domain/entities/water-point.dto.ts` — campo del schema zod.
- `packages/community/domain/entities/water-point.ts` — campo de la entidad + `create`/`fromDto`/`toDto`.
- `packages/community/domain/entities/water-point-with-account.dto.ts` — campo del DTO de listado.
- `packages/community/infrastructure/repositories/water-point.prisma-repository.ts` — proyección `fromPrismaPayload` y objeto `update` del `save`.
- `packages/community/application/water-point-data-updater.service.ts` — parámetro + normalización a `null`.
- `packages/water-account/application/water-point-onboarding.service.ts` — parámetro + paso a `WaterPoint.create`.
- `packages/water-account/infrastructure/repositories/water-meter.prisma-repository.ts` — solo `findByIdForDisplay` (es la query de la ficha del contador). Las otras tres proyecciones de `waterPoint` no lo necesitan porque los listados no muestran el botón; `mapsUrl` es opcional en el schema, así que no rompen.
- `apps/webapp/src/server/api/routers/community.ts` — inputs de `updateWaterPointData` y `createWaterPointOnboarding`.

**Modificados (UI):**
- `apps/webapp/src/app/(main)/management/water-point-data/_components/water-point-data-form.tsx`
- `apps/webapp/src/app/(main)/management/new-water-point/_components/water-point-onboarding-form.tsx`
- `apps/webapp/src/app/(main)/water-meter/[id]/_components/water-point-section.tsx`
- `apps/webapp/src/app/(main)/water-meter/[id]/_components/meter-info-card.tsx`
- `apps/webapp/src/app/(main)/water-meter/[id]/_components/water-meter-detail-skeleton.tsx` (comentario)

**Modificados (búsqueda):**
- `apps/webapp/src/components/ui/search-input.tsx` — default `minChars = 1`.
- `apps/webapp/src/app/(main)/water-meter/page.tsx`, `apps/webapp/src/app/(main)/water-meter/new/page.tsx`, `apps/webapp/src/app/(main)/management/water-point-data/page.tsx`, `apps/webapp/src/app/(main)/management/owner-change/page.tsx`, `apps/webapp/src/app/(main)/management/meter-replacement/page.tsx`, `apps/webapp/src/app/(main)/management/edit-owner/page.tsx`, `apps/webapp/src/app/(main)/fees/new/page.tsx` — quitar el prop `minChars`.
- `apps/webapp/src/app/(main)/management/water-point-data/page.tsx`, `owner-change/page.tsx`, `meter-replacement/page.tsx` — quitar el guard `nameFilter.length >= 3`.
- `apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx` — usar el helper de búsqueda (Tarea 7).

**Modificados (filtro por zona en el export, Tarea 8):**
- `apps/webapp/src/server/api/routers/water-account.ts:412-467` — input `communityZoneId` en `exportWaterMeterReadings`.
- `apps/webapp/src/app/(main)/export/readings/page.tsx` — selector de alcance (todos / contador / zona).
- `apps/webapp/src/app/(main)/export/readings/results/page.tsx` — leer el param y pasarlo al hook.
- `apps/webapp/src/app/(main)/export/_hooks/use-readings-pdf-generator.ts` — propagar el filtro y nombrar el fichero.
- `apps/webapp/src/app/(main)/export/_utils/generate-readings-pdf.tsx` y `apps/webapp/src/app/(main)/export/_components/readings-pdf.tsx` — fila "Zona:" en el resumen del PDF.

---

### Task 1: Helper `buildMapsHref`

Función pura que convierte lo que el usuario pegó en un href seguro, o `null` si no hay nada usable.

**Files:**
- Create: `apps/webapp/src/lib/maps-link.ts`
- Test: `apps/webapp/src/lib/maps-link.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `buildMapsHref(value: string | null | undefined): string | null`. La usan la Tarea 4 (validación del formulario) y la Tarea 5 (botón).

- [ ] **Step 1: Write the failing test**

Crear `apps/webapp/src/lib/maps-link.test.ts`:

```ts
import { describe, expect, it } from 'bun:test'
import { buildMapsHref } from './maps-link'

describe('buildMapsHref', () => {
  it('returns a pasted Google Maps link untouched', () => {
    expect(buildMapsHref('https://maps.app.goo.gl/aBc123')).toBe('https://maps.app.goo.gl/aBc123')
  })

  it('accepts plain http links', () => {
    expect(buildMapsHref('http://www.google.com/maps?q=42,-8')).toBe(
      'http://www.google.com/maps?q=42,-8'
    )
  })

  it('trims surrounding whitespace', () => {
    expect(buildMapsHref('  https://maps.app.goo.gl/aBc123  ')).toBe(
      'https://maps.app.goo.gl/aBc123'
    )
  })

  it('turns "lat,lng" coordinates into a Google Maps search', () => {
    expect(buildMapsHref('42.2286,-8.4589')).toBe(
      'https://www.google.com/maps/search/?api=1&query=42.2286,-8.4589'
    )
  })

  it('accepts coordinates with a space after the comma', () => {
    expect(buildMapsHref('42.2286, -8.4589')).toBe(
      'https://www.google.com/maps/search/?api=1&query=42.2286,-8.4589'
    )
  })

  it('rejects out-of-range coordinates', () => {
    expect(buildMapsHref('95,200')).toBeNull()
  })

  it('rejects the "0,0" placeholder legacy rows carry', () => {
    expect(buildMapsHref('0,0')).toBeNull()
  })

  it('rejects free-form addresses: we do not geocode', () => {
    expect(buildMapsHref('Rúa do Muíño 3, Mondariz')).toBeNull()
  })

  it('rejects non-http schemes so the href can never execute script', () => {
    expect(buildMapsHref('javascript:alert(1)')).toBeNull()
    expect(buildMapsHref('data:text/html,<script>alert(1)</script>')).toBeNull()
  })

  it('returns null for empty and missing values', () => {
    expect(buildMapsHref('')).toBeNull()
    expect(buildMapsHref('   ')).toBeNull()
    expect(buildMapsHref(null)).toBeNull()
    expect(buildMapsHref(undefined)).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test apps/webapp/src/lib/maps-link.test.ts`
Expected: FAIL — no se resuelve el módulo `./maps-link`.

- [ ] **Step 3: Write minimal implementation**

Crear `apps/webapp/src/lib/maps-link.ts`:

```ts
// Matches "lat,lng" with an optional space after the comma.
const COORDINATES_PATTERN = /^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/

/**
 * Turns whatever the community typed into a safe map href, or null when there
 * is nothing usable. Accepts a pasted http(s) link (Google Maps short links
 * included) or bare "lat,lng" coordinates. Everything else is rejected: the
 * value is free text a user pasted, and it ends up in an href.
 */
export function buildMapsHref(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null

  const coordinates = COORDINATES_PATTERN.exec(trimmed)
  if (coordinates) {
    const latitude = Number(coordinates[1])
    const longitude = Number(coordinates[2])
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
    // Null island: the placeholder legacy rows and fixtures carry, not a place.
    if (latitude === 0 && longitude === 0) return null
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test apps/webapp/src/lib/maps-link.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/lib/maps-link.ts apps/webapp/src/lib/maps-link.test.ts
git commit -m "feat(webapp): add buildMapsHref helper for water point map links"
```

---

### Task 2: Persistir `mapsUrl` en el punto de agua

Campo nuevo de extremo a extremo en el dominio: DB, entidad, DTOs, repositorio y los dos servicios de aplicación que escriben puntos de agua.

**Files:**
- Modify: `packages/database/prisma/schema.prisma:122-149` (modelo `WaterPoint`)
- Modify: `packages/community/domain/entities/water-point.dto.ts`
- Modify: `packages/community/domain/entities/water-point.ts`
- Modify: `packages/community/domain/entities/water-point-with-account.dto.ts`
- Modify: `packages/community/infrastructure/repositories/water-point.prisma-repository.ts` (objeto `update` del `save`, y `fromPrismaPayload`)
- Modify: `packages/community/application/water-point-data-updater.service.ts`
- Modify: `packages/water-account/application/water-point-onboarding.service.ts`
- Modify: `packages/water-account/infrastructure/repositories/water-meter.prisma-repository.ts:94-149` (`findByIdForDisplay`)
- Create: `packages/community/tests/water-point-maps-url.test.ts`
- Test: `packages/community/tests/water-point-data-updater.service.test.ts` (añadir casos)

**Interfaces:**
- Consumes: nada de tareas anteriores.
- Produces:
  - `WaterPointDto.mapsUrl?: string` (opcional, ausente cuando no hay valor).
  - `WaterPoint.mapsUrl?: string | null` (propiedad pública mutable de la entidad, último parámetro del constructor).
  - `WaterPointWithAccountDto.mapsUrl?: string | null`.
  - `WaterPointDataUpdater.run({ updatedData: { mapsUrl?: string | null } })` — string vacío o en blanco se guarda como `null`.
  - `WaterPointOnboardingParams.waterPoint.mapsUrl?: string | null`.
  - `WaterMeterDisplayDto.waterPoint.mapsUrl?: string` — lo consume la Tarea 5.

- [ ] **Step 1: Write the failing tests**

Crear `packages/community/tests/water-point-maps-url.test.ts`:

```ts
import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { WaterPoint } from '../domain'

const baseDto = {
  name: 'Casa do Muíño',
  location: '42.2286,-8.4589',
  fixedPopulation: 3,
  floatingPopulation: 0,
  cadastralReference: 'CAD-1',
  communityZoneId: Id.generateUniqueId().toString(),
  waterDepositIds: []
}

describe('WaterPoint mapsUrl', () => {
  it('round-trips a maps url through fromDto/toDto', () => {
    const dto = {
      ...baseDto,
      id: Id.generateUniqueId().toString(),
      mapsUrl: 'https://maps.app.goo.gl/aBc123'
    }

    expect(WaterPoint.fromDto(dto).toDto().mapsUrl).toBe('https://maps.app.goo.gl/aBc123')
  })

  it('keeps mapsUrl undefined when it was never set', () => {
    const dto = { ...baseDto, id: Id.generateUniqueId().toString() }

    expect(WaterPoint.fromDto(dto).toDto().mapsUrl).toBeUndefined()
  })

  it('carries mapsUrl through create', () => {
    const waterPoint = WaterPoint.create({ ...baseDto, mapsUrl: 'https://maps.app.goo.gl/xYz' })

    expect(waterPoint.mapsUrl).toBe('https://maps.app.goo.gl/xYz')
  })
})
```

Añadir al final del `describe('Successful updates')` de `packages/community/tests/water-point-data-updater.service.test.ts` (el fichero ya define `defaultWaterPoint` y `mockWaterPointRepository`):

```ts
    it('should successfully update mapsUrl', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() => Promise.resolve(defaultWaterPoint))
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      const result = await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: { mapsUrl: '  https://maps.app.goo.gl/aBc123  ' }
      })

      // Assert
      expect(result.updatedFields).toContain('mapsUrl')
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.mapsUrl).toBe('https://maps.app.goo.gl/aBc123')
    })

    it('should clear mapsUrl when an empty string is sent', async () => {
      // Arrange
      mockWaterPointRepository.findById = mock(() =>
        Promise.resolve(
          WaterPoint.fromDto({
            ...defaultWaterPoint.toDto(),
            mapsUrl: 'https://maps.app.goo.gl/aBc123'
          })
        )
      )
      mockWaterPointRepository.save = mock(() => Promise.resolve())

      // Act
      await service.run({
        waterPointId: defaultWaterPoint.id,
        updatedData: { mapsUrl: '   ' }
      })

      // Assert
      const savedWaterPoint = (mockWaterPointRepository.save as any).mock.calls[0][0] as WaterPoint
      expect(savedWaterPoint.mapsUrl).toBeNull()
    })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test packages/community/tests/water-point-maps-url.test.ts packages/community/tests/water-point-data-updater.service.test.ts`
Expected: FAIL — `mapsUrl` no existe en el DTO ni en la entidad (error de tipos y `toBeUndefined`/`toBe` fallando).

- [ ] **Step 3: Add the Prisma column**

En `packages/database/prisma/schema.prisma`, dentro de `model WaterPoint`, justo debajo de `connectionNumber`:

```prisma
  connectionNumber String? @map("connection_number")

  mapsUrl String? @map("maps_url")
```

- [ ] **Step 4: Regenerate the Prisma client**

Run: `bun run -F @pda/database generate`
Expected: "Generated Prisma Client". (No hace falta `db push` para los tests: `packages/testing/db-harness.ts` reconstruye la DDL desde `schema.prisma`.)

- [ ] **Step 5: Add the field to the domain DTO**

En `packages/community/domain/entities/water-point.dto.ts`, dentro de `waterPointSchema`, tras `connectionNumber`:

```ts
  connectionNumber: z.string().optional(),
  // Pasted Google Maps link or "lat,lng"; validated at the edges, stored raw.
  mapsUrl: z.string().optional(),
```

- [ ] **Step 6: Add the field to the entity**

En `packages/community/domain/entities/water-point.ts`, añadir el parámetro al constructor después de `connectionNumber` y propagarlo en los tres factory/serializadores:

```ts
  private constructor(
    public readonly id: Id,
    public name: string,
    public location: string,
    public fixedPopulation: number,
    public floatingPopulation: number,
    public cadastralReference: string,
    public communityZoneId: Id,
    public waterDepositIds: Id[],
    public notes?: string,
    public connectionNumber?: string | null,
    public mapsUrl?: string | null
  ) {}
```

En `create`, añadir tras `dto.connectionNumber ?? null`:

```ts
      dto.connectionNumber ?? null,
      dto.mapsUrl ?? null
```

En `fromDto`, exactamente igual (tras `dto.connectionNumber ?? null`):

```ts
      dto.connectionNumber ?? null,
      dto.mapsUrl ?? null
```

En `toDto`, tras la línea de `connectionNumber`:

```ts
      connectionNumber: this.connectionNumber ?? undefined,
      mapsUrl: this.mapsUrl ?? undefined,
```

- [ ] **Step 7: Add the field to the with-account DTO**

En `packages/community/domain/entities/water-point-with-account.dto.ts`, tras `connectionNumber`:

```ts
  connectionNumber?: string | null
  mapsUrl?: string | null
```

- [ ] **Step 8: Persist and read the field in the repository**

En `packages/community/infrastructure/repositories/water-point.prisma-repository.ts`, en el objeto `update` de `save`, tras `connectionNumber`:

```ts
      connectionNumber: waterPoint.connectionNumber ?? null,
      mapsUrl: waterPoint.mapsUrl ?? null,
```

Y en `fromPrismaPayload`, tras `connectionNumber`:

```ts
      connectionNumber: payload.connectionNumber ?? undefined,
      mapsUrl: payload.mapsUrl ?? undefined,
```

- [ ] **Step 9: Accept the field in the updater service**

En `packages/community/application/water-point-data-updater.service.ts`, añadir a `UpdateWaterPointDataParams.updatedData` tras `connectionNumber`:

```ts
    connectionNumber?: string | null
    mapsUrl?: string | null
```

Y en `run`, justo después del bloque de `connectionNumber`:

```ts
    if (params.updatedData.mapsUrl !== undefined) {
      const trimmed = params.updatedData.mapsUrl?.trim()
      waterPoint.mapsUrl = trimmed ? trimmed : null
    }
```

- [ ] **Step 10: Accept the field in the onboarding service**

En `packages/water-account/application/water-point-onboarding.service.ts`, añadir a `WaterPointOnboardingParams.waterPoint` tras `connectionNumber`:

```ts
    connectionNumber?: string | null
    mapsUrl?: string | null
```

Y en la llamada a `WaterPoint.create`, tras la línea de `connectionNumber`:

```ts
      connectionNumber: params.waterPoint.connectionNumber?.trim() || undefined,
      mapsUrl: params.waterPoint.mapsUrl?.trim() || undefined,
```

- [ ] **Step 11: Expose the field on the meter detail query**

En `packages/water-account/infrastructure/repositories/water-meter.prisma-repository.ts`, método `findByIdForDisplay`: añadir `mapsUrl: true` al `select` de `waterPoint` (tras `connectionNumber: true`) y al objeto devuelto, tras `connectionNumber`:

```ts
        connectionNumber: meter.waterPoint.connectionNumber ?? undefined,
        mapsUrl: meter.waterPoint.mapsUrl ?? undefined
```

- [ ] **Step 12: Run the tests to verify they pass**

Run: `bun test packages/community/tests/water-point-maps-url.test.ts packages/community/tests/water-point-data-updater.service.test.ts`
Expected: PASS.

- [ ] **Step 13: Run the full unit suite and typecheck**

Run: `bun run test:unit && bun run typecheck`
Expected: ambos verdes. Si `typecheck` se queja de `mapsUrl` en algún `WaterPoint.create`/`fromDto` de un test o factoría, es porque el campo se pasó como requerido: debe ser opcional en el DTO.

- [ ] **Step 14: Commit**

```bash
git add packages/database/prisma/schema.prisma packages/community packages/water-account
git commit -m "feat(community): store an optional maps url on the water point"
```

---

### Task 3: Exponer `mapsUrl` en el router tRPC

**Files:**
- Modify: `apps/webapp/src/server/api/routers/community.ts:152-195` (`updateWaterPointData`) y `:195-245` (`createWaterPointOnboarding`)
- Test: `apps/webapp/src/server/api/__tests__/community.test.ts`

**Interfaces:**
- Consumes: `WaterPointDataUpdater` y `WaterPointOnboarding` de la Tarea 2.
- Produces: input `mapsUrl?: string | null` en `community.updateWaterPointData`, e input `mapsUrl?: string` en `community.createWaterPointOnboarding`. Los consumen los formularios de la Tarea 4.

- [ ] **Step 1: Write the failing test**

Añadir a `apps/webapp/src/server/api/__tests__/community.test.ts` un test que siga el patrón del fichero (leer los `describe` existentes de `updateWaterPointData` para reutilizar sus helpers de sesión y factorías; si no hay uno, crear el `describe`):

```ts
  it('persists mapsUrl through updateWaterPointData', async () => {
    const zone = await aCommunityZone({ communityId: community.id })
    const waterPoint = await aWaterPoint({ communityZoneId: zone.id })

    const caller = createCaller(communityAdminContext(community.id))
    await caller.community.updateWaterPointData({
      waterPointId: waterPoint.id,
      mapsUrl: 'https://maps.app.goo.gl/aBc123'
    })

    const stored = await prisma.waterPoint.findUniqueOrThrow({ where: { id: waterPoint.id } })
    expect(stored.mapsUrl).toBe('https://maps.app.goo.gl/aBc123')
  })
```

Ajustar los nombres de los helpers (`createCaller`, `communityAdminContext`, `aCommunityZone`, `aWaterPoint`, `prisma`) a los que ya usa el fichero.

- [ ] **Step 2: Run test to verify it fails**

Run: `PDA_INTEGRATION=1 bun --env-file=.env.test test apps/webapp/src/server/api/__tests__/community.test.ts --concurrency 1`
Expected: FAIL — zod rechaza la clave `mapsUrl` desconocida en el input.

- [ ] **Step 3: Add the input to both procedures**

En `updateWaterPointData`, tras `connectionNumber: z.string().nullable().optional(),`:

```ts
        mapsUrl: z.string().nullable().optional(),
```

y en la llamada al servicio, tras `connectionNumber: input.connectionNumber,`:

```ts
            mapsUrl: input.mapsUrl,
```

En `createWaterPointOnboarding`, tras `connectionNumber: z.string().optional(),`:

```ts
        mapsUrl: z.string().optional(),
```

y en el objeto `waterPoint:` que se pasa al servicio, tras `connectionNumber: input.connectionNumber,`:

```ts
            mapsUrl: input.mapsUrl,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `PDA_INTEGRATION=1 bun --env-file=.env.test test apps/webapp/src/server/api/__tests__/community.test.ts --concurrency 1`
Expected: PASS. Si Postgres no está arriba: `docker compose up -d` primero.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/server/api/routers/community.ts apps/webapp/src/server/api/__tests__/community.test.ts
git commit -m "feat(api): accept mapsUrl on water point create and update"
```

---

### Task 4: Campo "Enlace de Google Maps" en los dos formularios

**Files:**
- Modify: `apps/webapp/src/app/(main)/management/water-point-data/_components/water-point-data-form.tsx` (schema línea ~41, defaults ~95, `form.reset` ~110, `onSubmit` ~128, campo tras `location` ~174)
- Modify: `apps/webapp/src/app/(main)/management/new-water-point/_components/water-point-onboarding-form.tsx` (schema ~38, defaults ~90, `onSubmit` ~110, campo tras `location` ~187)

**Interfaces:**
- Consumes: `buildMapsHref` (Tarea 1) para validar, y los inputs tRPC de la Tarea 3.
- Produces: nada que consuman tareas posteriores.

Nota: `water-point-data-form.tsx` define un único fragmento `identityFields` que se renderiza dos veces (móvil línea ~235 y escritorio ~397). Añadir el campo **una sola vez** dentro de `identityFields`.

- [ ] **Step 1: Add the field to the edit form**

En `water-point-data-form.tsx`, importar el helper:

```ts
import { buildMapsHref } from '@/lib/maps-link'
```

Añadir al `formSchema`, tras `location: z.string(),`:

```ts
  mapsUrl: z
    .string()
    .optional()
    .refine((value) => !value?.trim() || buildMapsHref(value) !== null, {
      message: 'Pega un enlace de Google Maps (https://…) o coordenadas «lat,lng»'
    }),
```

En `defaultValues`, tras `location: '',`:

```ts
      mapsUrl: '',
```

En el `form.reset` del `useEffect`, tras `location: waterPoint.location || '',`:

```ts
        mapsUrl: waterPoint.mapsUrl || '',
```

En `onSubmit`, tras `location: values.location,`:

```ts
        mapsUrl: values.mapsUrl?.trim() ? values.mapsUrl.trim() : null,
```

Y dentro de `identityFields`, justo después del `FormField` de `location` (el que termina en la línea ~174):

```tsx
      <FormField
        control={form.control}
        name="mapsUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Enlace de Google Maps</FormLabel>
            <FormControl>
              <Input placeholder="https://maps.app.goo.gl/… o 42.2286,-8.4589" {...field} />
            </FormControl>
            <FormDescription>
              Abre el punto en Google Maps, comparte la ubicación y pega aquí el enlace.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
```

Si `FormDescription` no está importado en el fichero, añadirlo al import de `@/components/ui/form`.

- [ ] **Step 2: Add the field to the onboarding form**

En `water-point-onboarding-form.tsx`, importar `buildMapsHref` igual que arriba, añadir al `formSchema` tras `location: z.string(),` el mismo bloque `mapsUrl` con el mismo `refine` y mensaje, añadir `mapsUrl: ''` a `defaultValues` tras `location: '',`, y en `onSubmit` tras `location: values.location,`:

```ts
      mapsUrl: values.mapsUrl?.trim() || undefined,
```

Y el mismo `FormField` (mismo JSX, ajustando la indentación al bloque donde vive el campo `location`, línea ~187) justo después del campo `location`.

- [ ] **Step 3: Verify types and lint**

Run: `bun run typecheck && bun run check:errors`
Expected: ambos verdes. `typecheck` es la red de seguridad real aquí: no hay tests de componentes en el repo (no existe ningún `*.test.tsx`).

- [ ] **Step 4: Manual check**

Run: `bun run webapp` y abrir `http://localhost:3005/management/water-point-data`.
Expected: al editar una casa aparece "Enlace de Google Maps"; pegar `hola` muestra el error de validación; pegar `https://maps.app.goo.gl/aBc123` guarda sin error y al reabrir el formulario el valor sigue ahí.

- [ ] **Step 5: Commit**

```bash
git add "apps/webapp/src/app/(main)/management/water-point-data/_components/water-point-data-form.tsx" "apps/webapp/src/app/(main)/management/new-water-point/_components/water-point-onboarding-form.tsx"
git commit -m "feat(webapp): add a Google Maps link field to the water point forms"
```

---

### Task 5: Botón "Ver en Google Maps" en la ficha del contador

Sustituye el botón "Ver Punto", que enlaza a `/water-point/<id>`: esa ruta no existe en `apps/webapp/src/app` y no hay rewrites en `next.config.js`, así que hoy devuelve 404.

**Files:**
- Modify: `apps/webapp/src/app/(main)/water-meter/[id]/_components/water-point-section.tsx`
- Modify: `apps/webapp/src/app/(main)/water-meter/[id]/_components/meter-info-card.tsx:11-19` (tipo del prop `waterPoint`)
- Modify: `apps/webapp/src/app/(main)/water-meter/[id]/_components/water-meter-detail-skeleton.tsx:46` (comentario)

**Interfaces:**
- Consumes: `buildMapsHref` (Tarea 1) y `WaterMeterDisplayDto.waterPoint.mapsUrl` (Tarea 2).
- Produces: nada.

- [ ] **Step 1: Rewrite the section component**

Reemplazar el contenido completo de `water-point-section.tsx` por:

```tsx
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildMapsHref } from '@/lib/maps-link'

interface WaterPointSectionProps {
  waterPoint: {
    id: string
    name: string
    location: string
    connectionNumber?: string | null
    mapsUrl?: string | null
    fixedPopulation: number
    floatingPopulation: number
  }
  readOnly?: boolean
}

export function WaterPointSection({ waterPoint }: WaterPointSectionProps) {
  // Fall back to `location`: it predates mapsUrl and often already holds "lat,lng".
  const mapsHref = buildMapsHref(waterPoint.mapsUrl) ?? buildMapsHref(waterPoint.location)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Punto de Agua</h3>
      <div className="space-y-1">
        {waterPoint.connectionNumber && (
          <div className="text-sm font-semibold text-blue-700">
            Nº enganche: {waterPoint.connectionNumber}
          </div>
        )}
        <div className="font-medium">{waterPoint.name}</div>
        <div className="text-sm text-gray-600">{waterPoint.location}</div>
        <div className="text-sm text-gray-500">
          {waterPoint.fixedPopulation + waterPoint.floatingPopulation} personas
        </div>
      </div>
      {mapsHref && (
        <Button variant="outline" size="sm" asChild>
          <a href={mapsHref} target="_blank" rel="noopener noreferrer">
            <MapPin className="h-3 w-3 mr-1" />
            Ver en Google Maps
          </a>
        </Button>
      )}
    </div>
  )
}
```

`readOnly` se mantiene en el tipo de props porque `meter-info-card.tsx` lo pasa, pero ya no condiciona nada: quien lee contadores en campo es justo quien necesita el mapa. El prefijo `_` no se usa para no cambiar la llamada.

- [ ] **Step 2: Widen the card's prop type**

En `meter-info-card.tsx`, añadir al tipo inline de `waterPoint`, tras `connectionNumber?: string | null`:

```ts
    mapsUrl?: string | null
```

- [ ] **Step 3: Fix the stale skeleton comment**

En `water-meter-detail-skeleton.tsx:46`, cambiar `{/* Ver Punto button */}` por `{/* Ver en Google Maps button */}`.

- [ ] **Step 4: Verify types and lint**

Run: `bun run typecheck && bun run check:errors`
Expected: verde. Si `Link` de `next/link` queda sin usar en `water-point-section.tsx`, Biome lo marcaría: el import ya se eliminó en el paso 1.

- [ ] **Step 5: Manual check**

Run: `bun run webapp`, abrir un contador cuyo punto tenga `mapsUrl`.
Expected: el botón dice "Ver en Google Maps" y abre Google Maps en una pestaña nueva. En un punto sin `mapsUrl` y con `location` que no sean coordenadas, no aparece ningún botón (antes aparecía uno que daba 404).

- [ ] **Step 6: Commit**

```bash
git add "apps/webapp/src/app/(main)/water-meter/[id]/_components"
git commit -m "fix(webapp): replace the dead Ver Punto link with a Google Maps button"
```

---

### Task 6: Buscar desde el primer carácter

Dos capas bloquean hoy la búsqueda: el default `minChars = 3` de `SearchInput` (que ni propaga el `onChange`) y un guard `nameFilter.length >= 3` repetido en tres páginas de gestión. Con `minChars = 3`, ningún enganche por debajo de 100 es encontrable.

**Files:**
- Modify: `apps/webapp/src/components/ui/search-input.tsx:19`
- Modify: `apps/webapp/src/app/(main)/water-meter/page.tsx:53-58`
- Modify: `apps/webapp/src/app/(main)/water-meter/new/page.tsx:40-45`
- Modify: `apps/webapp/src/app/(main)/management/water-point-data/page.tsx:32` y `:66-71`
- Modify: `apps/webapp/src/app/(main)/management/owner-change/page.tsx:30` y `:76-80`
- Modify: `apps/webapp/src/app/(main)/management/meter-replacement/page.tsx:31` y `:80-84`
- Modify: `apps/webapp/src/app/(main)/management/edit-owner/page.tsx:70`
- Modify: `apps/webapp/src/app/(main)/fees/new/page.tsx:36`

**Interfaces:**
- Consumes: nada.
- Produces: `SearchInput` con `minChars` por defecto a 1. La Tarea 7 depende de este cambio para que buscar "42" llegue al filtro.

- [ ] **Step 1: Lower the component default**

En `apps/webapp/src/components/ui/search-input.tsx`, cambiar la línea del default y documentar el porqué:

```ts
export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  // 1, not 3: connection numbers are one or two digits for anything under 100,
  // and a 3-char floor made those meters impossible to find.
  minChars = 1,
  debounceMs = 300
}: SearchInputProps) {
```

- [ ] **Step 2: Drop every explicit minChars override**

Borrar la línea `minChars={3}` de `water-meter/page.tsx`, `water-meter/new/page.tsx`, `management/water-point-data/page.tsx`, `management/owner-change/page.tsx` y `management/meter-replacement/page.tsx`, y la línea `minChars={2}` de `management/edit-owner/page.tsx` y `fees/new/page.tsx`. Todas las búsquedas quedan con el default.

Run para comprobar que no queda ninguna: `grep -rn "minChars={" apps/webapp/src/app`
Expected: sin resultados.

- [ ] **Step 3: Drop the duplicated 3-char guards**

En `management/water-point-data/page.tsx`, `management/owner-change/page.tsx` y `management/meter-replacement/page.tsx`, cambiar el guard del filtro:

```ts
      if (nameFilter && nameFilter.length >= 3) {
```

por:

```ts
      if (nameFilter.trim()) {
```

Run para comprobar: `grep -rn "length >= 3" apps/webapp/src`
Expected: sin resultados.

- [ ] **Step 4: Fix the misleading placeholder**

En `water-meter/page.tsx`, cambiar `placeholder="Buscar por nombre o ubicación..."` por `placeholder="Buscar por nombre, nº enganche o ubicación..."` (el filtro ya buscaba por enganche). Hacer lo mismo en `management/owner-change/page.tsx` y `management/meter-replacement/page.tsx`, cuyos placeholders dicen `"Buscar por nombre o dirección..."` y cuyos filtros también incluyen `connectionNumber`: dejarlos en `"Buscar por nombre, nº enganche o dirección..."`.

- [ ] **Step 5: Verify types and lint**

Run: `bun run typecheck && bun run check:errors`
Expected: verde.

- [ ] **Step 6: Manual check**

Run: `bun run webapp`, abrir `http://localhost:3005/water-meter` y escribir `7` en la búsqueda.
Expected: la lista se filtra al pulsar la primera tecla (antes no hacía nada hasta el tercer carácter).

- [ ] **Step 7: Commit**

```bash
git add apps/webapp/src/components/ui/search-input.tsx "apps/webapp/src/app/(main)"
git commit -m "fix(webapp): search from the first character so low connection numbers are findable"
```

---

### Task 7: Coincidencia exacta de nº de enganche primero

Con el mínimo en 1 carácter, `includes()` hace que buscar `42` devuelva también 142, 420 y 342, y el enganche buscado puede quedar enterrado. Esta tarea extrae el filtro de la lista principal de contadores a un helper puro y pone delante la coincidencia exacta de enganche. Es una mejora aparte: se puede descartar en revisión sin tocar las tareas 1-6.

**Files:**
- Create: `apps/webapp/src/lib/water-meter-search.ts`
- Create: `apps/webapp/src/lib/water-meter-search.test.ts`
- Modify: `apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx:49-72`

**Interfaces:**
- Consumes: el default `minChars = 1` de la Tarea 6.
- Produces: `filterAndRankMeters<T extends SearchableMeter>(meters: T[], rawQuery: string): T[]`.

- [ ] **Step 1: Write the failing test**

Crear `apps/webapp/src/lib/water-meter-search.test.ts`:

```ts
import { describe, expect, it } from 'bun:test'
import { filterAndRankMeters } from './water-meter-search'

const meter = (waterAccountName: string, connectionNumber: string | null, location = 'Mondariz') => ({
  waterAccountName,
  waterPoint: { name: `Casa ${waterAccountName}`, location, connectionNumber }
})

describe('filterAndRankMeters', () => {
  it('returns every meter when the query is empty', () => {
    const meters = [meter('Ana', '1'), meter('Bea', '2')]

    expect(filterAndRankMeters(meters, '   ')).toEqual(meters)
  })

  it('keeps partial matches on the connection number', () => {
    const meters = [meter('Ana', '142'), meter('Bea', '42')]

    expect(filterAndRankMeters(meters, '42')).toHaveLength(2)
  })

  it('puts the exact connection number first', () => {
    const meters = [meter('Ana', '142'), meter('Bea', '420'), meter('Cé', '42')]

    expect(filterAndRankMeters(meters, '42').map((m) => m.waterAccountName)).toEqual([
      'Cé',
      'Ana',
      'Bea'
    ])
  })

  it('matches the account name, the point name and the location, case-insensitively', () => {
    const meters = [meter('Ana', '1', 'Rúa do Muíño'), meter('Bea', '2', 'Landín')]

    expect(filterAndRankMeters(meters, 'muíÑo').map((m) => m.waterAccountName)).toEqual(['Ana'])
    expect(filterAndRankMeters(meters, 'bea').map((m) => m.waterAccountName)).toEqual(['Bea'])
    expect(filterAndRankMeters(meters, 'casa ana').map((m) => m.waterAccountName)).toEqual(['Ana'])
  })

  it('drops meters that match nothing', () => {
    expect(filterAndRankMeters([meter('Ana', '1')], 'zzz')).toEqual([])
  })

  it('tolerates a missing connection number', () => {
    expect(filterAndRankMeters([meter('Ana', null)], 'ana')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test apps/webapp/src/lib/water-meter-search.test.ts`
Expected: FAIL — no se resuelve `./water-meter-search`.

- [ ] **Step 3: Write the implementation**

Crear `apps/webapp/src/lib/water-meter-search.ts`:

```ts
export interface SearchableMeter {
  waterAccountName: string
  waterPoint: {
    name: string
    location: string
    connectionNumber?: string | null
  }
}

/**
 * Filters meters by a free-text query and floats an exact connection-number
 * match to the top. Searching "42" has to surface enganche 42 above 142 and
 * 420, otherwise a one- or two-digit search is useless in practice.
 */
export function filterAndRankMeters<T extends SearchableMeter>(meters: T[], rawQuery: string): T[] {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return meters

  const matches = meters.filter(
    (meter) =>
      meter.waterAccountName.toLowerCase().includes(query) ||
      meter.waterPoint.name.toLowerCase().includes(query) ||
      meter.waterPoint.location.toLowerCase().includes(query) ||
      meter.waterPoint.connectionNumber?.toLowerCase().includes(query)
  )

  const isExactConnectionNumber = (meter: T) =>
    meter.waterPoint.connectionNumber?.trim().toLowerCase() === query

  // Stable: Array.prototype.sort is stable, so non-exact matches keep the
  // order the query returned them in (oldest reading first).
  return [...matches].sort(
    (a, b) => Number(isExactConnectionNumber(b)) - Number(isExactConnectionNumber(a))
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test apps/webapp/src/lib/water-meter-search.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Use the helper in the meter list**

En `apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx`, importar el helper:

```ts
import { filterAndRankMeters } from '@/lib/water-meter-search'
```

y sustituir el `useMemo` (líneas 49-72) por:

```tsx
  const filteredWaterMeters = useMemo(() => {
    if (!waterMeters) return []

    const filtered = filterAndRankMeters(waterMeters, nameFilter)

    if (showOnlyExcess) {
      return filtered.filter((meter) => meter.lastReadingExcessConsumption === true)
    }

    return filtered
  }, [waterMeters, nameFilter, showOnlyExcess])
```

- [ ] **Step 6: Verify the whole suite**

Run: `bun run test:unit && bun run typecheck && bun run check:errors`
Expected: todo verde.

- [ ] **Step 7: Commit**

```bash
git add apps/webapp/src/lib/water-meter-search.ts apps/webapp/src/lib/water-meter-search.test.ts "apps/webapp/src/app/(main)/water-meter/_components/water-meter-list.tsx"
git commit -m "feat(webapp): rank exact connection-number matches first in the meter list"
```

---

### Task 8: Filtrar la exportación de lecturas por zona

Hoy `export/readings` solo ofrece "todos los contadores" o un contador concreto. Se añade un tercer alcance: una zona de la comunidad. El filtro real se aplica en el servidor, que ya carga las zonas de la comunidad para resolver el nombre de zona de cada fila.

**Files:**
- Modify: `apps/webapp/src/server/api/routers/water-account.ts:412-467` (`exportWaterMeterReadings`)
- Modify: `apps/webapp/src/app/(main)/export/readings/page.tsx`
- Modify: `apps/webapp/src/app/(main)/export/readings/results/page.tsx`
- Modify: `apps/webapp/src/app/(main)/export/_hooks/use-readings-pdf-generator.ts`
- Modify: `apps/webapp/src/app/(main)/export/_utils/generate-readings-pdf.tsx`
- Modify: `apps/webapp/src/app/(main)/export/_components/readings-pdf.tsx`
- Test: `apps/webapp/src/server/api/__tests__/water-account.test.ts`

**Interfaces:**
- Consumes: nada de tareas anteriores (es independiente de las tareas 1-7).
- Produces:
  - Input `communityZoneId?: string` en `waterAccount.exportWaterMeterReadings`.
  - Query param `communityZoneId` en `/export/readings/results`.
  - `useReadingsPDFGenerator({ startDate, endDate, communityId?, waterMeterId?, communityZoneId? })`.
  - `generateReadingsPDF({ data, startDate, endDate, generatedAt, waterMeterId?, zoneName? })`.
  - `<ReadingsPDF … zoneName?: string />`.

- [ ] **Step 1: Write the failing integration test**

Añadir a `apps/webapp/src/server/api/__tests__/water-account.test.ts` (el fichero ya llama a `setupTestDatabase()` en su `beforeAll`; añadir los imports de factorías que falten a la lista de `@pda/testing`):

```ts
describe('exportWaterMeterReadings zone filter', () => {
  const wholePeriod = { startDate: new Date('2020-01-01'), endDate: new Date('2030-01-01') }

  it('returns only the meters of the requested zone', async () => {
    // Arrange
    const { community, zone, meter } = await aCommunityWithFullSetup()
    const otherZone = await aCommunityZone({ communityId: community.id })
    const otherPoint = await aWaterPoint({ communityZoneId: otherZone.id })
    const otherAccount = await aWaterAccount()
    const otherMeter = await aWaterMeter({
      waterPointId: otherPoint.id,
      waterAccountId: otherAccount.id
    })
    const caller = createCaller(asManagerOf(community.id))

    // Act
    const result = await caller.waterAccount.exportWaterMeterReadings({
      ...wholePeriod,
      communityZoneId: zone.id
    })

    // Assert
    const ids = (result ?? []).map((row) => row.id)
    expect(ids).toContain(meter.id)
    expect(ids).not.toContain(otherMeter.id)
  })

  it('exports every zone when no zone is given', async () => {
    // Arrange
    const { community, zone, meter } = await aCommunityWithFullSetup()
    const otherZone = await aCommunityZone({ communityId: community.id })
    const otherPoint = await aWaterPoint({ communityZoneId: otherZone.id })
    const otherAccount = await aWaterAccount()
    const otherMeter = await aWaterMeter({
      waterPointId: otherPoint.id,
      waterAccountId: otherAccount.id
    })
    const caller = createCaller(asManagerOf(community.id))

    // Act
    const result = await caller.waterAccount.exportWaterMeterReadings(wholePeriod)

    // Assert
    const ids = (result ?? []).map((row) => row.id)
    expect(ids).toContain(meter.id)
    expect(ids).toContain(otherMeter.id)
    expect(zone.id).not.toBe(otherZone.id)
  })

  it('rejects a zone that belongs to another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expect(
      caller.waterAccount.exportWaterMeterReadings({
        ...wholePeriod,
        communityZoneId: b.zone.id
      })
    ).rejects.toThrow(/Zona no encontrada/)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `PDA_INTEGRATION=1 bun --env-file=.env.test test apps/webapp/src/server/api/__tests__/water-account.test.ts --concurrency 1`
Expected: FAIL — zod rechaza la clave `communityZoneId` desconocida.

- [ ] **Step 3: Filter by zone in the procedure**

En `apps/webapp/src/server/api/routers/water-account.ts`, `exportWaterMeterReadings`. Añadir al input, entre `communityId` y `waterMeterId`:

```ts
        communityId: z.string().optional(),
        communityZoneId: z.string().optional(),
        waterMeterId: z.string().optional()
```

Y sustituir las dos líneas que hoy calculan `zoneIds`:

```ts
        // Get all zones for this community
        const zones = await communityZoneRepo.findByCommunityId(communityId)
        const zoneIds = zones.map((zone) => zone.id)
```

por:

```ts
        // Get all zones for this community
        const zones = await communityZoneRepo.findByCommunityId(communityId)

        // Optional zone filter. Resolving it against this community's own zones
        // is also the scope guard: an id from another community finds nothing.
        const scopedZones = input.communityZoneId
          ? zones.filter((zone) => zone.id.toString() === input.communityZoneId)
          : zones
        if (input.communityZoneId && scopedZones.length === 0) {
          throw new Error('Zona no encontrada')
        }
        const zoneIds = scopedZones.map((zone) => zone.id)
```

`zones` se sigue usando más abajo (`zones.find(...)`) para resolver el nombre de zona de cada fila: no tocar esa línea.

- [ ] **Step 4: Run the test to verify it passes**

Run: `PDA_INTEGRATION=1 bun --env-file=.env.test test apps/webapp/src/server/api/__tests__/water-account.test.ts --concurrency 1`
Expected: PASS. Si Postgres no está arriba: `docker compose up -d`.

- [ ] **Step 5: Commit the server side**

```bash
git add apps/webapp/src/server/api/routers/water-account.ts apps/webapp/src/server/api/__tests__/water-account.test.ts
git commit -m "feat(api): filter the readings export by community zone"
```

- [ ] **Step 6: Add the scope selector to the filter page**

En `apps/webapp/src/app/(main)/export/readings/page.tsx`. Añadir los imports:

```ts
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
```

Añadir junto a `const ALL_METERS = '__all__'`:

```ts
type ExportScope = 'all' | 'meter' | 'zone'
```

Añadir el estado, junto a los `useState` existentes:

```ts
  const [scope, setScope] = useState<ExportScope>('all')
  const [communityZoneId, setCommunityZoneId] = useState('')
```

En `handleExport`, sustituir el bloque que añade `waterMeterId` a los params:

```ts
    if (waterMeterId && waterMeterId !== ALL_METERS) {
      params.set('waterMeterId', waterMeterId)
    }
```

por:

```ts
    // The three scopes are exclusive: only the selected one reaches the URL.
    if (scope === 'meter' && waterMeterId && waterMeterId !== ALL_METERS) {
      params.set('waterMeterId', waterMeterId)
    }
    if (scope === 'zone' && communityZoneId) {
      params.set('communityZoneId', communityZoneId)
    }
```

Sustituir el `<div className="space-y-2">` que hoy contiene el `Label htmlFor="meterSearch"`, el `Input` de búsqueda, el `Select` de contadores y su `<p>` explicativo, por este bloque (mantiene el buscador y el select de contador tal cual, solo los mete dentro del alcance "un contador"):

```tsx
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Alcance (opcional)</Label>
                <RadioGroup
                  value={scope}
                  onValueChange={(value) => setScope(value as ExportScope)}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="all" id="scope-all" />
                    <Label htmlFor="scope-all" className="font-normal">
                      Todos los contadores
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="meter" id="scope-meter" />
                    <Label htmlFor="scope-meter" className="font-normal">
                      Filtrar contador específico
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="zone" id="scope-zone" />
                    <Label htmlFor="scope-zone" className="font-normal">
                      Filtrar por zona
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {scope === 'meter' && (
                <div className="space-y-2">
                  <Label htmlFor="meterSearch">Contador</Label>
                  <Input
                    id="meterSearch"
                    placeholder="Buscar por titular, casa o nº enganche..."
                    value={meterSearch}
                    onChange={(e) => setMeterSearch(e.target.value)}
                  />
                  <Select value={waterMeterId} onValueChange={setWaterMeterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los contadores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_METERS}>Todos los contadores</SelectItem>
                      {filteredMeters.map((meter) => (
                        <SelectItem key={meter.id} value={meter.id}>
                          {[
                            meter.waterPoint.connectionNumber,
                            meter.waterPoint.name,
                            meter.waterAccountName
                          ]
                            .filter(Boolean)
                            .join(' — ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Si eliges un contador, el PDF listará todas sus lecturas del período con consumo
                    total y medio.
                  </p>
                </div>
              )}

              {scope === 'zone' && (
                <div className="space-y-2">
                  <Label htmlFor="communityZone">Zona</Label>
                  <Select value={communityZoneId} onValueChange={setCommunityZoneId}>
                    <SelectTrigger id="communityZone">
                      <SelectValue placeholder="Selecciona una zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {(zones as CommunityZoneDto[] | undefined)?.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    El PDF comunitario incluirá solo los contadores activos de esa zona.
                  </p>
                </div>
              )}
            </div>
```

Y en el subtítulo de la página, cambiar `Configura el período y, opcionalmente, un contador concreto` por `Configura el período y, opcionalmente, un contador concreto o una zona`.

- [ ] **Step 7: Block the export until the scope is complete**

En el mismo fichero, el botón "Generar Exportación" ya se deshabilita sin fechas. Añadir la condición de zona para que no se pueda exportar con el alcance "zona" sin haber elegido ninguna:

```tsx
          <Button
            onClick={handleExport}
            disabled={
              !startDate || !endDate || isNavigating || (scope === 'zone' && !communityZoneId)
            }
          >
```

- [ ] **Step 8: Read the param in the results page**

En `apps/webapp/src/app/(main)/export/readings/results/page.tsx`, tras `const waterMeterIdParam = ...`:

```ts
  const communityZoneIdParam = searchParams.get('communityZoneId') || ''
```

Pasarlo al hook:

```ts
  } = useReadingsPDFGenerator({
    startDate,
    endDate,
    waterMeterId: waterMeterIdParam || undefined,
    communityZoneId: communityZoneIdParam || undefined
  })
```

Y mostrar la zona en la cabecera de "Generar Exportación". Todas las filas de un export por zona comparten zona, así que el nombre sale del primer registro sin pedir nada más al servidor. Añadir junto a las demás derivaciones (por ejemplo tras `const singleMeter = ...`):

```ts
  const zoneName = communityZoneIdParam ? displayData[0]?.communityZone.name : undefined
```

y dentro del `<CardDescription>` de "Generar Exportación", después del bloque `{singleMeter && (…)}`:

```tsx
              {zoneName && (
                <>
                  {' · '}
                  Zona: {zoneName}
                </>
              )}
```

- [ ] **Step 9: Propagate the filter through the hook**

En `apps/webapp/src/app/(main)/export/_hooks/use-readings-pdf-generator.ts`, añadir a `UseReadingsPDFGeneratorProps`:

```ts
  communityZoneId?: string
```

Añadirlo a la desestructuración de los parámetros, al input de la query:

```ts
      communityId,
      communityZoneId: communityZoneId || undefined,
      waterMeterId: waterMeterId || undefined
```

y en `generatePDF`, pasar el nombre de zona y ajustar el nombre del fichero:

```ts
      const blob = await generateReadingsPDF({
        data: dataToUse,
        startDate,
        endDate,
        generatedAt,
        waterMeterId: waterMeterId || undefined,
        zoneName: communityZoneId ? dataToUse[0]?.communityZone.name : undefined
      })

      const today = new Date().toISOString().split('T')[0]
      const fileName = waterMeterId
        ? `lecturas-contador-${today}.pdf`
        : communityZoneId
          ? `lecturas-zona-${today}.pdf`
          : `lecturas-export-${today}.pdf`
```

- [ ] **Step 10: Show the zone in the PDF summary**

En `apps/webapp/src/app/(main)/export/_utils/generate-readings-pdf.tsx`, añadir `zoneName?: string` a `GenerateReadingsPDFProps`, a la desestructuración de la función, y pasarlo en la última llamada:

```tsx
  const blob = await pdf(
    <ReadingsPDF
      data={data}
      startDate={startDate}
      endDate={endDate}
      generatedAt={generatedAt}
      zoneName={zoneName}
    />
  ).toBlob()
```

En `apps/webapp/src/app/(main)/export/_components/readings-pdf.tsx`, añadir `zoneName?: string` a `ReadingsPDFProps`, aceptarlo en la firma (`export function ReadingsPDF({ data, startDate, endDate, generatedAt, zoneName }: ReadingsPDFProps)`) y añadir la fila al resumen, justo después de la fila de "Período:":

```tsx
          {zoneName && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Zona:</Text>
              <Text style={styles.summaryValue}>{zoneName}</Text>
            </View>
          )}
```

- [ ] **Step 11: Verify types, lint and the whole suite**

Run: `bun run typecheck && bun run check:errors && bun run test:unit`
Expected: todo verde.

- [ ] **Step 12: Manual check**

Run: `bun run webapp`, abrir `http://localhost:3005/export/readings`.
Expected: aparecen los tres radios; con "Filtrar por zona" sale el desplegable de zonas y el botón sigue deshabilitado hasta elegir una; al generar, la URL lleva `communityZoneId`, la vista previa solo muestra contadores de esa zona y el PDF descargado se llama `lecturas-zona-…​.pdf` y trae la fila "Zona:" en el resumen.

- [ ] **Step 13: Commit the client side**

```bash
git add "apps/webapp/src/app/(main)/export"
git commit -m "feat(webapp): let the readings export be filtered by community zone"
```

---

## Fuera de alcance (decidido, no olvidado)

- Columna `mapsUrl` en la tabla de administración (`apps/webapp/src/features/water-point/water-point-table.tsx`) y en `water-point-table-config.ts`: nadie la ha pedido.
- Botón de mapa en los listados de contadores: mete ruido en una lista que ya es densa. Solo en la ficha.
- Las otras tres proyecciones de `waterPoint` en `water-meter.prisma-repository.ts` (`findByWaterPointIdForDisplay`, `findByCommunityZonesIdOrderedByLastReading`, `findActiveByCommunityZonesIdOrderedByLastReading`): no alimentan la ficha, y `mapsUrl` es opcional en el schema, así que no rompen.
- Crear la ruta `/water-point/[id]` que falta: es una pantalla nueva, no una mejora de las pedidas. El botón roto se sustituye, no se arregla la ruta.
- Geocodificar direcciones de texto libre: requiere API key de Google y presupuesto. El usuario pega el enlace, que además es más preciso en el rural.
- Dar de alta "Val Oscuro" y "Landin": lo hace la comunidad desde `/management/deposits`. Si les redirige al inicio, su usuario necesita el rol `ADMIN` o `COMMUNITY_ADMIN` (`apps/webapp/src/lib/user-roles.ts:27`).
- Multiselección de zonas en el export, y filtro por depósito: se ha pedido una zona. El input del servidor acepta un solo `communityZoneId`; pasar a varios sería cambiarlo por un array.
- Filtro por zona en los exports de análisis e incidencias: solo se ha pedido en lecturas. Esos flujos tienen sus propias páginas (`export/analysis`, `export/incidents`) y no comparten el hook de lecturas.
- Filtro por zona combinado con contador concreto: son alcances excluyentes por diseño (un contador ya pertenece a una sola zona).
