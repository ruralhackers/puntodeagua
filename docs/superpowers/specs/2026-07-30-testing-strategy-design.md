# Estrategia de tests — Fase 2a: tenancy y autorización

**Fecha:** 2026-07-30
**Estado:** diseño aprobado, pendiente de plan de implementación
**Alcance de este spec:** solo Fase 2a. Las fases 2b (repositorios) y 2c (casos de uso huérfanos) tendrán su propio spec, pero la infraestructura que se construye acá está diseñada para servirles.

---

## Contexto y problema

El sistema tiene 3 clientes en producción y 281 tests que pasan. La intuición inicial era "hay muy pocos tests"; la medición dice otra cosa: **los tests están en el lugar equivocado**.

| Capa | Cobertura medida |
|---|---|
| Dominio (entidades, VOs) | Bien cubierto (`Decimal` 98%, `WaterPoint` 100%) |
| Aplicación (29 servicios) | 19 con test real, 10 sin |
| Repositorios Prisma (10) | 0–11% de líneas |
| `packages/storage` (3 servicios) | 0 tests: solo existen como mocks de otros paquetes |
| Capa tRPC: 12 routers + guards + proxy (**1890 LOC**) | **0 tests** |
| `apps/webapp/src/lib` | 2 tests, funciones puras |

Global de `packages/`: 72% funcs / 80% líneas — número que **excluye** los 1890 LOC de la capa servidor porque no entran en el reporte.

La capa sin cobertura es exactamente donde vive el riesgo de producción:

1. **Tenancy.** El review de backend identificó ~18 endpoints donde un `MANAGER`/`COMMUNITY_ADMIN` de la comunidad A puede leer o mutar recursos de la comunidad B pasando un id, más 4 endpoints que devuelven datos de todas las comunidades sin filtro. Los guards existen (`apps/webapp/src/server/api/guards/water-meter-community-guard.ts`) pero se invocan a mano y sólo bajo `if (isWaterMeterReaderOnly(roles))` — el rol más bajo es el único verificado. Cero tests.
2. **Integridad de datos.** Cálculo de exceso, reemplazo de contador y onboarding escriben varios agregados sin transacción, compensando a mano con `delete()` en `catch`.
3. **Refactors a ciegas.** La Fase 3 quiere romper el embebido `WaterMeter`→`WaterPoint` y meter transacciones. Ambas cosas tocan justo lo que no tiene red.

Este spec ataca el punto 1, que es el de mayor riesgo y menor coste, y de paso construye el harness que los otros dos necesitan.

## Objetivo

Una suite de tests de caso de uso que ejerza los procedures tRPC contra una base Postgres real, y que:

- Verifique que el aislamiento entre comunidades se cumple donde ya se cumple (evita regresiones).
- Documente de forma **ejecutable** los ~18 endpoints donde no se cumple, de modo que arreglarlos en la fase de seguridad consista en quitar una marca y ver el test pasar.
- Cubra la matriz de roles: `ADMIN`, `COMMUNITY_ADMIN`, `MANAGER`, `WATER_METER_READER`.

**Criterio de éxito:** `bun run test:integration` verde, con cada endpoint sensible del backend representado por al menos un test de tenancy, y cada agujero conocido marcado con `it.failing`.

## Restricciones técnicas descubiertas

Cuatro hechos verificados que condicionan el diseño:

1. **`createCaller` ya existe.** `apps/webapp/src/server/api/root.ts:39` exporta `createCaller = createCallerFactory(appRouter)`. Se puede invocar cualquier procedure en proceso con un contexto falso, sin HTTP ni Next levantado. Esto abarata radicalmente los tests de la capa tRPC.

2. **No se puede inyectar la base por contexto.** Los factories (`WaterAccountFactory`, `CommunityFactory`, …) importan `client as prisma` de `@pda/database` en tiempo de carga de módulo, y los routers ignoran `ctx.db` (sólo `auth.ts` lo usa). `packages/database/src/client.ts` construye `new PrismaClient()` leyendo `DATABASE_URL` del entorno en ese momento. **Consecuencia:** `DATABASE_URL` tiene que apuntar a la base de test antes de cualquier import, vía `bun --env-file=.env.test test`. No hay forma de redirigir la conexión desde el test.

3. **`prisma migrate diff` funciona sin conexión.** `bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` emite el SQL completo del schema sin tocar ninguna base. Esto resuelve que el repo **no tenga carpeta `migrations`** (usa `db push`): el harness genera el DDL desde el schema.

4. **`it.failing` tiene la semántica que queremos.** Verificado en bun 1.3.14: un `expect` que falla dentro de `it.failing` cuenta como **pass**; cuando el bug se arregla y el test empieza a pasar, `it.failing` se pone **rojo** y obliga a quitar la marca. El agujero queda documentado, ejecutable y auto-limpiante. CI fija bun 1.2.21 y local es 1.3.14: hay que alinear a 1.3.14.

## Decisiones tomadas

| Decisión | Elegido | Descartado y por qué |
|---|---|---|
| Substrato de la base | **Base separada `puntodeagua2_test` en el Postgres del `docker-compose`** | PGlite en proceso: viable (existe `pglite-prisma-adapter` v0.7.2 y el DDL se puede generar), pero es un adapter de terceros no oficial y exige habilitar `driverAdapters` en el `generator`, lo que cambia el cliente Prisma **que usa producción**. Con 3 clientes en prod, no vale el ahorro de evitar Docker, que ya está en el loop de desarrollo. |
| Rojo o verde | **Mixto**: caracterización verde + agujeros con `it.failing` | TDD puro (todo rojo hasta arreglar) bloquea otros merges. Caracterización pura cementaría el bug de tenancy como comportamiento esperado. |
| Ubicación de los helpers | **`packages/testing` como workspace** | Un `test/helpers/` en la raíz obligaría a imports relativos cruzando fronteras de paquete cuando la Fase 2b escriba tests dentro de `packages/*`. |
| Umbral de cobertura en CI | **Ninguno por ahora** | Un porcentaje global invita a escribir tests que suben el número en vez de tests que atrapan bugs. Se reevalúa cuando 2b y 2c estén hechas. |

## Arquitectura

Tres niveles, un solo runner (`bun test`). Sin HTTP, sin navegador, sin Next levantado.

| Nivel | Qué prueba | Substrato | Dónde vive |
|---|---|---|---|
| Unit (ya existe) | Entidades, VOs, servicios de aplicación con repos mockeados | Mocks | `packages/*/tests/` |
| **Caso de uso (este spec)** | Procedures tRPC vía `createCaller`: autorización, tenancy, casos de uso de los routers | Postgres `puntodeagua2_test` | `apps/webapp/src/server/api/__tests__/` |
| Integración de repositorio (Fase 2b) | Los 10 repos Prisma: `include`/mapeos y queries de scope | Postgres `puntodeagua2_test` | `packages/*/tests/integration/` |

### `packages/testing` — `@pda/testing`

Paquete privado, sólo para desarrollo. Cuatro responsabilidades, un archivo cada una:

**`db-harness.ts`** — ciclo de vida de la base de test.
- `ensureTestDatabase()`: conecta a la base `postgres` del mismo servidor y hace `CREATE DATABASE puntodeagua2_test` si no existe.
- `applySchema()`: ejecuta el DDL generado por `prisma migrate diff --from-empty --to-schema-datamodel --script`. El SQL se genera al vuelo en cada arranque, así que nunca se desincroniza del schema.
- `resetDatabase()`: `TRUNCATE <todas las tablas> RESTART IDENTITY CASCADE`. La lista de tablas se lee de `information_schema`, no se hardcodea.
- **Guarda de seguridad**: lanza si `DATABASE_URL` no termina en `_test`. Esto no es paranoia: la URL de producción vive comentada en `.env.local` a un carácter de distancia de estar activa, y `packages/database/package.json` tiene un `db:sync:force` que corre `prisma db push --force-reset`.

**`factories.ts`** — datos de prueba persistidos y encadenados. Cada factory acepta overrides parciales y devuelve la entidad ya escrita en la base, resolviendo sus dependencias:
- `aCommunity()`, `aCommunityZone({ communityId })`, `aWaterDeposit({ communityId })`
- `aWaterPoint({ communityZoneId })`, `aWaterAccount()`, `aWaterMeter({ waterPointId, waterAccountId })`, `aReading({ waterMeterId })`
- `anIncident({ communityId })`, `anAnalysis({ communityId })`, `aProvider({ communityId })`, `aFeePayment({ communityId, waterPointId })`
- `aUser({ communityId, roles })`
- Atajo de alto nivel: `aCommunityWithFullSetup()` → devuelve `{ community, zone, waterPoint, account, meter, reading }`, para que un test de tenancy sean 3 líneas y no 40.

**`session.ts`** — contextos tRPC falsos. La forma del usuario está fijada por `apps/webapp/src/server/auth/config.ts:11-18`: `user: { …, community: CommunityDto | null, roles: string[] }`.
- `asAdmin()`, `asCommunityAdminOf(communityId)`, `asManagerOf(communityId)`, `asReaderOf(communityId)`, `asAnonymous()`
- Cada uno devuelve el objeto de contexto completo que `createCaller` espera: `{ db, session, headers }`.

**`index.ts`** — barrel.

### Forma de los tests de tenancy

Un archivo por router, en `apps/webapp/src/server/api/__tests__/`. El patrón, para cada endpoint sensible, son dos tests: uno que confirma que el acceso legítimo funciona, y otro que confirma que el cruzado se rechaza.

```typescript
// Arrange: dos comunidades completas e independientes
const a = await aCommunityWithFullSetup()
const b = await aCommunityWithFullSetup()
const caller = createCaller(asManagerOf(a.community.id))

// Act & Assert: acceso legítimo
await expect(caller.waterAccount.getWaterMeterById({ id: a.meter.id })).resolves.toBeTruthy()

// Act & Assert: acceso cruzado — rechazado
await expect(caller.waterAccount.getWaterMeterById({ id: b.meter.id })).rejects.toThrow(/FORBIDDEN/)
```

Los endpoints hoy vulnerables llevan el mismo test con `it.failing` y un comentario que apunta al endpoint:

```typescript
// HOLE: staff de cualquier comunidad puede leer contadores de otra.
// El guard sólo corre bajo isWaterMeterReaderOnly(). Se arregla en Fase 2 de seguridad.
it.failing('should reject reading a water meter from another community', async () => { … })
```

### Aislamiento entre tests

`resetDatabase()` en un **`beforeAll`** por archivo, no en un `beforeEach`: truncar una vez por archivo es un orden de magnitud más rápido que por test, y es suficiente porque cada test crea sus propias comunidades con ids únicos y afirma sólo sobre lo que él creó. Los tests de integración corren en serie (`--concurrency 1`) para que dos archivos no truncen la base a la vez; los unit tests siguen en paralelo.

### Configuración

- **`.env.test`** (commiteado, sin secretos): `DATABASE_URL=postgresql://puntodeagua2_user:puntodeagua2_password@localhost:5559/puntodeagua2_test`. Son las credenciales del `docker-compose` local, que ya están en claro en el repo.
- `apps/webapp/package.json` añade `"@pda/testing": "workspace:*"` como **devDependency** (en Fase 2b lo añadirán también los paquetes que escriban tests de repositorio).
- Scripts nuevos en `package.json` de la raíz:
  - `test:unit`: `bun test packages` (lo de siempre, sin base).
  - `test:integration`: `bun --env-file=.env.test test apps/webapp/src/server --concurrency 1`.
  - `test:all`: los dos en secuencia.

**Conflicto a resolver con el CI actual:** `.github/workflows/tests.yml` corre `bun test` a secas, sin ruta. En cuanto existan tests bajo `apps/webapp/src/server`, ese job los va a recoger **sin** `.env.test` y sin base, y va a fallar. El job existente tiene que pasar a `bun run test:unit` (más los 2 tests de `apps/webapp/src/lib`, que no necesitan base). Sin este cambio, el primer commit de esta fase rompe CI.

### CI

Un job nuevo `integration` en `.github/workflows/`, separado del `test` actual para que los unit tests sigan dando feedback en ~15s:

- `services: postgres:15` con las mismas credenciales que el `docker-compose`, health check antes de arrancar.
- `bun run -F @pda/database generate` (la carpeta `generated/` está en `.gitignore`).
- `bun run test:integration`.
- Alinear `bun-version` a `1.3.14` en los dos jobs — `it.failing` es requisito y CI fija 1.2.21.

## Manejo de errores

Los tests distinguen tres formas de rechazo, porque hoy el backend las mezcla y el test tiene que aceptar la que corresponde:

- `TRPCError` con `code: 'FORBIDDEN'` — lo que lanzan los guards.
- `TRPCError` con `code: 'UNAUTHORIZED'` — `protectedProcedure` sin sesión.
- `Error` genérico — varios routers hacen `throw new Error(error.message)` en vez de mapear (por ejemplo `community.ts:198`).

Las aserciones usan el código de tRPC cuando existe, y el mensaje sólo cuando no hay código. Donde el backend hoy lanza un `Error` genérico donde debería lanzar `FORBIDDEN`, el test lo documenta con un comentario `SMELL:` — no lo arregla, eso es Fase 2 de seguridad.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Un test apunta por error a la base de desarrollo o a producción | Guarda en `db-harness.ts`: aborta si `DATABASE_URL` no termina en `_test` |
| Los tests de integración hacen la suite lenta y la gente deja de correrla | Job y script separados; `test:unit` sigue en ~1s y es lo que se corre en el loop de desarrollo |
| El DDL generado se desincroniza del schema | Se genera al vuelo desde `schema.prisma` en cada arranque, no se commitea |
| `it.failing` se usa como alfombra para esconder tests que fallan por otras razones | Cada `it.failing` exige un comentario `HOLE:` que apunte al endpoint y a la fase que lo arregla. Cuando el bug se arregla el test se pone rojo solo |
| El harness se convierte en un monolito | Cuatro archivos con una responsabilidad cada uno; las factories no saben de tRPC y las sesiones no saben de la base |

## Fuera de alcance

- Tests de UI, de componentes React, y E2E de navegador.
- Fase 2b (repositorios) y 2c (casos de uso huérfanos): specs propios, reutilizando este harness.
- Arreglar los agujeros de tenancy. Este spec los **documenta**; cerrarlos es la Fase 2 de seguridad, cuyo enfoque ya está decidido (middleware `communityScopedProcedure` + guards explícitos).
- Unificar las carpetas `test/` vs `tests/` de los paquetes: cosmético, está en el backlog de Fase 1.
- Umbral de cobertura en CI.

## Fases siguientes que este trabajo habilita

1. **Fase 2 de seguridad**: cerrar los ~18 endpoints. Los `it.failing` de este spec son su especificación ejecutable y su criterio de aceptación.
2. **Fase 2b**: tests de repositorio, empezando por `WaterMeterPrismaRepository` (el del `WaterPoint` falso con `'Unknown'`) y `WaterPointPrismaRepository` (unicidad de `connectionNumber`).
3. **Fase 3**: refactors de arquitectura (transacciones, romper el embebido `WaterMeter`→`WaterPoint`), ahora con red.
