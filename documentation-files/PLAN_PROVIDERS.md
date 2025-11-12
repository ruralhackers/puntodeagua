# Plan de Implementación: Módulo de Proveedores

## Resumen
Crear un nuevo bounded context para Proveedores con arquitectura DDD completa (capas de dominio, aplicación e infraestructura), UI CRUD completa en la webapp, tests comprehensivos y manejo de errores con traducciones.

## Características Clave
- Tipos de proveedor en inglés en el backend (plumbing, electricity, analysis, masonry, other)
- Traducciones al español en el frontend
- Errores con mensajes en inglés y español siguiendo el patrón del proyecto
- Tests comprehensivos para entidades y servicios
- Campo taxId opcional
- Soporte para tipo personalizado cuando se selecciona "other"

---

## Fase 1: Base de Datos y Dominio

### 1.1. Schema de Base de Datos
**Archivo:** `packages/database/prisma/schema.prisma`

Añadir el modelo Provider:
```prisma
model Provider {
  id          String  @id @default(cuid())
  companyName String  @map("company_name")
  taxId       String? @map("tax_id")

  // Contact information
  contactPerson  String  @map("contact_person")
  contactPhone   String  @map("contact_phone")
  contactEmail   String? @map("contact_email")
  secondaryPhone String? @map("secondary_phone")
  billingEmail   String? @map("billing_email")

  // Address
  address    String? @db.Text
  city       String?
  postalCode String? @map("postal_code")
  province   String?

  // Provider type (in English)
  providerType       String  @map("provider_type")
  customProviderType String? @map("custom_provider_type")

  // Operational details
  isActive           Boolean @default(true) @map("is_active")
  notes              String  @default("") @db.Text
  businessHours      String? @map("business_hours")
  emergencyAvailable Boolean @default(false) @map("emergency_available")
  emergencyPhone     String? @map("emergency_phone")

  // Administrative/Financial
  bankAccount  String? @map("bank_account")
  paymentTerms String? @map("payment_terms")
  website      String?

  // Relations
  communityId String?    @map("community_id")
  community   Community? @relation(fields: [communityId], references: [id])

  // Audit
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([communityId])
  @@index([providerType])
  @@index([isActive])
}
```

Añadir relación en Community:
```prisma
model Community {
  // ... campos existentes ...
  providers     Provider[]
}
```

**Ejecutar:** `bun run db:sync`

### 1.2. Value Objects
**Archivo:** `packages/providers/domain/value-objects/provider-type.ts`

```typescript
const providerTypes = ['plumbing', 'electricity', 'analysis', 'masonry', 'other'] as const

export class ProviderType {
  static readonly PLUMBING = ProviderType.fromString('plumbing')
  static readonly ELECTRICITY = ProviderType.fromString('electricity')
  static readonly ANALYSIS = ProviderType.fromString('analysis')
  static readonly MASONRY = ProviderType.fromString('masonry')
  static readonly OTHER = ProviderType.fromString('other')

  private constructor(private readonly value: string) {}

  static fromString(value: string): ProviderType {
    if (!ProviderType.isValidType(value)) {
      throw new Error(`Invalid provider type: ${value}`)
    }
    return new ProviderType(value)
  }

  static values(): readonly string[] {
    return providerTypes
  }

  static isValidType(value: string): boolean {
    return providerTypes.includes(value as (typeof providerTypes)[number])
  }

  equals(other: ProviderType): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }

  isOther(): boolean {
    return this.value === 'other'
  }
}
```

### 1.3. Domain Errors
**Archivo:** `packages/providers/domain/errors/provider-errors.ts`

```typescript
import { ForbiddenError, NotFoundError } from '@pda/common/domain'

export class ProviderNotFoundError extends NotFoundError {
  constructor(message: string = ProviderNotFoundError.defaultMessage) {
    super(message)
    this.name = 'ProviderNotFoundError'
  }

  static override defaultMessage = 'Provider not found'
  static override defaultMessageEs = 'Proveedor no encontrado'
}

export class CustomProviderTypeRequiredError extends ForbiddenError {
  constructor(message: string = CustomProviderTypeRequiredError.defaultMessage) {
    super(message)
    this.name = 'CustomProviderTypeRequiredError'
  }

  static override defaultMessage = 'Custom provider type is required when provider type is "other"'
  static override defaultMessageEs = 'El tipo de proveedor personalizado es requerido cuando el tipo es "otro"'
}

export class InvalidProviderTypeError extends ForbiddenError {
  constructor(message: string = InvalidProviderTypeError.defaultMessage) {
    super(message)
    this.name = 'InvalidProviderTypeError'
  }

  static override defaultMessage = 'Invalid provider type'
  static override defaultMessageEs = 'Tipo de proveedor inválido'
}
```

### 1.4. DTOs
**Archivo:** `packages/providers/domain/entities/provider.dto.ts`

```typescript
import { idSchema } from '@pda/common/domain'
import { z } from 'zod'
import { ProviderType } from '../value-objects/provider-type'

export type ProviderDto = z.infer<typeof providerSchema>

export const providerSchema = z
  .object({
    id: idSchema,
    companyName: z.string().min(1, 'Company name is required'),
    taxId: z.string().optional(),

    // Contact information
    contactPerson: z.string().min(1, 'Contact person is required'),
    contactPhone: z.string().min(1, 'Contact phone is required'),
    contactEmail: z.string().email().optional().or(z.literal('')),
    secondaryPhone: z.string().optional(),
    billingEmail: z.string().email().optional().or(z.literal('')),

    // Address
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    province: z.string().optional(),

    // Provider type (in English)
    providerType: z.enum(ProviderType.values() as [string, ...string[]]),
    customProviderType: z.string().optional(),

    // Operational details
    isActive: z.boolean().default(true),
    notes: z.string().optional(),
    businessHours: z.string().optional(),
    emergencyAvailable: z.boolean().default(false),
    emergencyPhone: z.string().optional(),

    // Administrative/Financial
    bankAccount: z.string().optional(),
    paymentTerms: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),

    // Relations
    communityId: idSchema.optional()
  })
  .refine(
    (data) => {
      // If providerType is "other", customProviderType is required
      if (data.providerType === 'other') {
        return data.customProviderType && data.customProviderType.trim().length > 0
      }
      return true
    },
    {
      message: 'Custom provider type is required when provider type is "other"',
      path: ['customProviderType']
    }
  )

export const providerUpdateSchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required'),
    taxId: z.string().optional(),
    contactPerson: z.string().min(1, 'Contact person is required'),
    contactPhone: z.string().min(1, 'Contact phone is required'),
    contactEmail: z.string().email().optional().or(z.literal('')),
    secondaryPhone: z.string().optional(),
    billingEmail: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    province: z.string().optional(),
    providerType: z.enum(ProviderType.values() as [string, ...string[]]),
    customProviderType: z.string().optional(),
    isActive: z.boolean(),
    notes: z.string().optional(),
    businessHours: z.string().optional(),
    emergencyAvailable: z.boolean(),
    emergencyPhone: z.string().optional(),
    bankAccount: z.string().optional(),
    paymentTerms: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    communityId: idSchema.optional()
  })
  .refine(
    (data) => {
      if (data.providerType === 'other') {
        return data.customProviderType && data.customProviderType.trim().length > 0
      }
      return true
    },
    {
      message: 'Custom provider type is required when provider type is "other"',
      path: ['customProviderType']
    }
  )

export type ProviderUpdateDto = z.infer<typeof providerUpdateSchema>
```

### 1.5. Entity
**Archivo:** `packages/providers/domain/entities/provider.ts`

Seguir el patrón de `incident.ts` con métodos:
- `static create(providerData: Omit<ProviderDto, 'id'>): Provider`
- `static fromDto(dto: ProviderDto): Provider`
- `update(providerData: ProviderUpdateDto): Provider`
- `toDto(): ProviderDto`
- `getDisplayType(): string` - retorna customProviderType si existe, sino el tipo traducido

### 1.6. Repository Interface
**Archivo:** `packages/providers/domain/repositories/provider.repository.ts`

```typescript
import type {
  Deletable,
  FindableAll,
  FindableByCommunityId,
  FindableById,
  FindableForTable,
  Id,
  Savable
} from '@pda/common/domain'
import type { Provider } from '../entities/provider'

export interface ProviderRepository
  extends FindableAll<Provider>,
    FindableById<Provider>,
    FindableByCommunityId<Provider>,
    FindableForTable<Provider>,
    Savable<Provider>,
    Deletable {
  findById(id: Id): Promise<Provider | undefined>
  findAll(): Promise<Provider[]>
  findByCommunityId(communityId: Id): Promise<Provider[]>
  save(provider: Provider): Promise<void>
  delete(id: Id): Promise<void>
}
```

### 1.7. Domain Index
**Archivo:** `packages/providers/domain/index.ts`

```typescript
export * from './entities/provider'
export * from './entities/provider.dto'
export * from './errors/provider-errors'
export * from './repositories/provider.repository'
export * from './value-objects/provider-type'
```

---

## Fase 2: Application Layer

### 2.1. Provider Creator Service
**Archivo:** `packages/providers/application/provider-creator.service.ts`

```typescript
import type { Provider } from '../domain/entities/provider'
import type { ProviderRepository } from '../domain/repositories/provider.repository'

export class ProviderCreator {
  constructor(private readonly providerRepository: ProviderRepository) {}

  async run(params: { provider: Provider }) {
    const { provider } = params
    await this.providerRepository.save(provider)
    return provider
  }
}
```

### 2.2. Provider Updater Service
**Archivo:** `packages/providers/application/provider-updater.service.ts`

```typescript
import { Id } from '@pda/common/domain'
import type { ProviderUpdateDto } from '../domain/entities/provider.dto'
import { ProviderNotFoundError } from '../domain/errors/provider-errors'
import type { ProviderRepository } from '../domain/repositories/provider.repository'

export class ProviderUpdater {
  constructor(private readonly providerRepository: ProviderRepository) {}

  async run(params: { id: Id; updatedProviderData: ProviderUpdateDto }) {
    const { id, updatedProviderData } = params

    const provider = await this.providerRepository.findById(id)
    if (!provider) {
      throw new ProviderNotFoundError()
    }

    provider.update(updatedProviderData)
    await this.providerRepository.save(provider)

    return provider
  }
}
```

---

## Fase 3: Infrastructure Layer

### 3.1. Prisma Repository
**Archivo:** `packages/providers/infrastructure/repositories/provider.prisma-repository.ts`

Seguir el patrón de `incident.prisma-repository.ts` con implementación completa de todos los métodos del repositorio.

### 3.2. Table Configuration
**Archivo:** `packages/providers/infrastructure/repositories/provider-table-config.ts`

```typescript
import type { TableConfig } from '@pda/common/domain'
import type { Provider } from '../../domain/entities/provider'

export const providerTableConfig: TableConfig<Provider> = {
  model: 'provider',
  columns: [
    {
      key: 'companyName',
      label: 'Company Name',
      sortable: true,
      searchable: true
    },
    {
      key: 'providerType',
      label: 'Type',
      sortable: true,
      searchable: true
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      sortable: true,
      searchable: true
    },
    {
      key: 'contactPhone',
      label: 'Phone',
      sortable: false,
      searchable: true
    },
    {
      key: 'isActive',
      label: 'Active',
      sortable: true,
      searchable: false
    }
  ],
  defaultSort: {
    field: 'companyName',
    direction: 'asc'
  },
  searchFields: ['companyName', 'contactPerson', 'contactPhone', 'contactEmail'],
  filters: [
    {
      key: 'providerType',
      label: 'Provider Type',
      type: 'select',
      options: [
        { value: 'plumbing', label: 'Plumbing' },
        { value: 'electricity', label: 'Electricity' },
        { value: 'analysis', label: 'Analysis' },
        { value: 'masonry', label: 'Masonry' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      key: 'isActive',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ]
}
```

### 3.3. Factory
**Archivo:** `packages/providers/infrastructure/factories/providers.factory.ts`

```typescript
import { client as prisma } from '@pda/database'
import { ProviderCreator } from '../../application/provider-creator.service'
import { ProviderUpdater } from '../../application/provider-updater.service'
import { ProviderPrismaRepository } from '../repositories/provider.prisma-repository'

export class ProvidersFactory {
  private static providerPrismaRepositoryInstance: ProviderPrismaRepository

  // SERVICES
  static providerCreatorService() {
    return new ProviderCreator(ProvidersFactory.providerPrismaRepository())
  }

  static providerUpdaterService() {
    return new ProviderUpdater(ProvidersFactory.providerPrismaRepository())
  }

  static providerPrismaRepository() {
    if (!ProvidersFactory.providerPrismaRepositoryInstance) {
      ProvidersFactory.providerPrismaRepositoryInstance = new ProviderPrismaRepository(prisma)
    }
    return ProvidersFactory.providerPrismaRepositoryInstance
  }
}
```

### 3.4. Infrastructure Index
**Archivo:** `packages/providers/infrastructure/index.ts`

```typescript
export * from './factories/providers.factory'
export * from './repositories/provider.prisma-repository'
export * from './repositories/provider-table-config'
```

---

## Fase 4: Package Configuration

### 4.1. Package.json
**Archivo:** `packages/providers/package.json`

```json
{
  "name": "@pda/providers",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "dependencies": {
    "@pda/common": "workspace:*",
    "@pda/database": "workspace:*",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

### 4.2. Main Index
**Archivo:** `packages/providers/index.ts`

```typescript
export * from './domain'
export * from './infrastructure'
```

---

## Fase 5: Tests

### 5.1. Test Mocks
**Archivo:** `packages/providers/tests/helpers/mocks.ts`

```typescript
import { mock } from 'bun:test'
import type { ProviderRepository } from '../../domain/repositories/provider.repository'

export const createMockProviderRepository = (): ProviderRepository => {
  return {
    findById: mock(),
    save: mock(),
    findAll: mock(),
    delete: mock(),
    findForTable: mock(),
    findByCommunityId: mock()
  } as unknown as ProviderRepository
}
```

### 5.2. Entity Tests
**Archivo:** `packages/providers/tests/entities/provider.test.ts`

Tests comprehensivos siguiendo el patrón de `analysis.test.ts`:

```typescript
import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { Provider } from '../../domain/entities/provider'
import type { ProviderDto } from '../../domain/entities/provider.dto'
import { CustomProviderTypeRequiredError } from '../../domain/errors/provider-errors'
import { ProviderType } from '../../domain/value-objects/provider-type'

describe('Provider', () => {
  const validCommunityId = 'clx12345678901234567890123'
  
  describe('create()', () => {
    it('should throw error when type is "other" without customProviderType', () => {
      // Test business rule
    })

    it('should create provider with all required fields', () => {
      // Test creation
    })

    it('should create provider with optional fields', () => {
      // Test optional fields
    })
  })

  describe('fromDto()', () => {
    // Test DTO conversion
  })

  describe('toDto()', () => {
    // Test DTO serialization
  })

  describe('update()', () => {
    // Test update logic
  })

  describe('getDisplayType()', () => {
    it('should return customProviderType when type is "other"', () => {
      // Test display logic
    })

    it('should return provider type when not "other"', () => {
      // Test display logic
    })
  })

  describe('data integrity', () => {
    // Test round-trip conversions
  })

  describe('edge cases', () => {
    // Test edge cases
  })
})
```

### 5.3. Service Tests
**Archivo:** `packages/providers/tests/application/provider-creator.service.test.ts`

```typescript
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { ProviderCreator } from '../../application/provider-creator.service'
import { Provider } from '../../domain/entities/provider'
import type { ProviderRepository } from '../../domain/repositories/provider.repository'
import { createMockProviderRepository } from '../helpers/mocks'

describe('ProviderCreator', () => {
  let service: ProviderCreator
  let mockProviderRepository: ProviderRepository

  beforeEach(() => {
    mockProviderRepository = createMockProviderRepository()
    service = new ProviderCreator(mockProviderRepository)
  })

  it('should create a provider successfully', async () => {
    // Test creation
  })

  // More tests...
})
```

**Archivo:** `packages/providers/tests/application/provider-updater.service.test.ts`

```typescript
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { ProviderUpdater } from '../../application/provider-updater.service'
import { Provider } from '../../domain/entities/provider'
import { ProviderNotFoundError } from '../../domain/errors/provider-errors'
import type { ProviderRepository } from '../../domain/repositories/provider.repository'
import { createMockProviderRepository } from '../helpers/mocks'

describe('ProviderUpdater', () => {
  let service: ProviderUpdater
  let mockProviderRepository: ProviderRepository

  beforeEach(() => {
    mockProviderRepository = createMockProviderRepository()
    service = new ProviderUpdater(mockProviderRepository)
  })

  it('should throw ProviderNotFoundError when provider does not exist', async () => {
    // Test error handling
  })

  it('should update provider successfully', async () => {
    // Test update
  })

  // More tests...
})
```

**Ejecutar tests:** `bun test packages/providers/tests/`

---

## Fase 6: Backend API (tRPC)

### 6.1. Router
**Archivo:** `apps/webapp/src/server/api/routers/provider.ts`

```typescript
import { Id } from '@pda/common/domain'
import { ProvidersFactory } from '@pda/providers'
import { Provider } from '@pda/providers/domain/entities/provider'
import { providerSchema } from '@pda/providers/domain/entities/provider.dto'
import { z } from 'zod'
import { handleDomainError } from '@/server/api/error-handler'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const providersRouter = createTRPCRouter({
  getProviders: protectedProcedure.query(async () => {
    const repo = ProvidersFactory.providerPrismaRepository()
    const providers = await repo.findAll()
    return providers.map((provider) => provider.toDto())
  }),

  getProvidersByCommunityId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = ProvidersFactory.providerPrismaRepository()
      const providers = await repo.findByCommunityId(Id.fromString(input.id))
      return providers.map((provider) => provider.toDto())
    }),

  getProviderById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = ProvidersFactory.providerPrismaRepository()
      const provider = await repo.findById(Id.fromString(input.id))
      return provider?.toDto()
    }),

  addProvider: protectedProcedure
    .input(providerSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      try {
        const service = ProvidersFactory.providerCreatorService()
        const provider = Provider.create(input)
        const savedProvider = await service.run({ provider })
        return savedProvider.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  updateProvider: protectedProcedure
    .input(providerSchema)
    .mutation(async ({ input }) => {
      try {
        const service = ProvidersFactory.providerUpdaterService()
        const { id, ...updateData } = input
        const savedProvider = await service.run({
          id: Id.fromString(id),
          updatedProviderData: updateData
        })
        return savedProvider.toDto()
      } catch (error) {
        handleDomainError(error)
      }
    }),

  deleteProvider: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const repo = ProvidersFactory.providerPrismaRepository()
      await repo.delete(Id.fromString(input.id))
      return { success: true }
    })
})
```

### 6.2. Update Root Router
**Archivo:** `apps/webapp/src/server/api/root.ts`

```typescript
import { providersRouter } from './routers/provider'

export const appRouter = createTRPCRouter({
  // ... existing routers
  providers: providersRouter,
})
```

---

## Fase 7: Frontend UI

### 7.1. Translation Helper
**Archivo:** `apps/webapp/src/app/(main)/provider/_components/provider-type-labels.ts`

```typescript
export const providerTypeLabels: Record<string, string> = {
  plumbing: 'Fontanería',
  electricity: 'Electricidad',
  analysis: 'Análisis',
  masonry: 'Albañilería',
  other: 'Otro'
}

export const getProviderTypeLabel = (type: string): string => {
  return providerTypeLabels[type] || type
}
```

### 7.2. Provider Type Badge
**Archivo:** `apps/webapp/src/app/(main)/provider/_components/provider-type-badge.tsx`

```typescript
import { Badge } from '@/components/ui/badge'
import { getProviderTypeLabel } from './provider-type-labels'

interface ProviderTypeBadgeProps {
  providerType: string
  customProviderType?: string
}

export default function ProviderTypeBadge({
  providerType,
  customProviderType
}: ProviderTypeBadgeProps) {
  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'plumbing':
        return 'default'
      case 'electricity':
        return 'secondary'
      case 'analysis':
        return 'outline'
      case 'masonry':
        return 'default'
      case 'other':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const displayLabel = providerType === 'other' && customProviderType 
    ? customProviderType 
    : getProviderTypeLabel(providerType)

  return (
    <Badge variant={getTypeVariant(providerType)}>
      {displayLabel}
    </Badge>
  )
}
```

### 7.3. Provider Card
**Archivo:** `apps/webapp/src/app/(main)/provider/_components/provider-card.tsx`

Componente para mostrar un proveedor en vista de tarjeta (grid view).

### 7.4. List Page
**Archivo:** `apps/webapp/src/app/(main)/provider/page.tsx`

Página principal con:
- Stats cards (Total, Activos, Inactivos)
- Grid de proveedores activos
- Grid de proveedores inactivos (si hay)
- Empty state
- Botón "Nuevo Proveedor"

### 7.5. Create Page
**Archivo:** `apps/webapp/src/app/(main)/provider/new/page.tsx`

Formulario con secciones:
- **Información Básica**: companyName, taxId, providerType (dropdown en español), customProviderType (si type = "other"), isActive
- **Información de Contacto**: contactPerson, contactPhone, contactEmail, secondaryPhone, billingEmail
- **Dirección**: address, city, postalCode, province
- **Detalles Operativos**: businessHours, emergencyAvailable, emergencyPhone
- **Información Administrativa**: bankAccount, paymentTerms, website
- **Notas**: notes

Dropdown de tipos en español:
```typescript
<Select value={formData.providerType} onValueChange={...}>
  <SelectContent>
    <SelectItem value="plumbing">Fontanería</SelectItem>
    <SelectItem value="electricity">Electricidad</SelectItem>
    <SelectItem value="analysis">Análisis</SelectItem>
    <SelectItem value="masonry">Albañilería</SelectItem>
    <SelectItem value="other">Otro</SelectItem>
  </SelectContent>
</Select>
```

### 7.6. Detail/Edit Page
**Archivo:** `apps/webapp/src/app/(main)/provider/[id]/page.tsx`

Página con dos modos:
- **Vista**: Mostrar todos los datos del proveedor organizados en cards
- **Edición**: Formulario inline para editar (mismo layout que create page)

Botones: Editar, Guardar, Cancelar, Eliminar

---

## Fase 8: Navigation

### 8.1. Update Sidebar
**Archivo:** `apps/webapp/src/navigation/sidebar/sidebar-items.ts`

```typescript
import { Building2 } from 'lucide-react'

// En el import:
import {
  // ... otros imports
  Building2,
}

// En el array de items de "Registros" (id: 2):
{
  id: 2,
  label: 'Registros',
  items: [
    // ... otros items
    {
      title: 'Proveedores',
      url: '/provider',
      icon: Building2
    },
    // ...
  ]
}
```

---

## Fase 9: Documentation

### 9.1. README
**Archivo:** `packages/providers/README.md`

Documentación completa siguiendo el patrón del README de registers, incluyendo:
- Descripción del paquete
- Arquitectura
- Servicios (ProviderCreator, ProviderUpdater)
- Entidades de dominio
- Value Objects (ProviderType)
- Repository interfaces
- Factory
- Usage examples
- Tests
- Dependencies

---

## Checklist de Implementación

### Fase 1: Base de Datos y Dominio
- [ ] 1.1. Schema de Base de Datos
- [ ] 1.2. Value Objects
- [ ] 1.3. Domain Errors
- [ ] 1.4. DTOs
- [ ] 1.5. Entity
- [ ] 1.6. Repository Interface
- [ ] 1.7. Domain Index

### Fase 2: Application Layer
- [ ] 2.1. Provider Creator Service
- [ ] 2.2. Provider Updater Service

### Fase 3: Infrastructure Layer
- [ ] 3.1. Prisma Repository
- [ ] 3.2. Table Configuration
- [ ] 3.3. Factory
- [ ] 3.4. Infrastructure Index

### Fase 4: Package Configuration
- [ ] 4.1. Package.json
- [ ] 4.2. Main Index

### Fase 5: Tests
- [ ] 5.1. Test Mocks
- [ ] 5.2. Entity Tests
- [ ] 5.3. Service Tests (Creator)
- [ ] 5.4. Service Tests (Updater)
- [ ] Ejecutar y verificar todos los tests pasan

### Fase 6: Backend API (tRPC)
- [ ] 6.1. Router
- [ ] 6.2. Update Root Router

### Fase 7: Frontend UI
- [ ] 7.1. Translation Helper
- [ ] 7.2. Provider Type Badge
- [ ] 7.3. Provider Card
- [ ] 7.4. List Page
- [ ] 7.5. Create Page
- [ ] 7.6. Detail/Edit Page

### Fase 8: Navigation
- [ ] 8.1. Update Sidebar

### Fase 9: Documentation
- [ ] 9.1. README

---

## Notas de Implementación

### Tipos de Proveedor
- **Backend**: Usar siempre inglés (plumbing, electricity, analysis, masonry, other)
- **Frontend**: Traducir a español en todos los componentes usando el helper `provider-type-labels.ts`
- **Base de datos**: Almacenar en inglés

### Errores
- Extender de `NotFoundError` o `ForbiddenError` de `@pda/common/domain`
- Incluir `defaultMessage` (inglés) y `defaultMessageEs` (español)
- Patrón:
  ```typescript
  export class MyError extends ForbiddenError {
    constructor(message: string = MyError.defaultMessage) {
      super(message)
      this.name = 'MyError'
    }
    
    static override defaultMessage = 'English message'
    static override defaultMessageEs = 'Mensaje en español'
  }
  ```

### Tests
- Seguir patrones de `analysis.test.ts` para entity tests
- Seguir patrones de `water-meter-reading-creator.service.test.ts` para service tests
- Crear mocks en `tests/helpers/mocks.ts`
- Ejecutar con: `bun test packages/providers/tests/`

### Validación Custom Type
- En Zod schema: usar `.refine()` para validar que cuando `providerType === 'other'`, `customProviderType` sea requerido
- En Entity: lanzar `CustomProviderTypeRequiredError` si la validación falla

### TaxId
- Campo **opcional** en todos lados
- En Prisma: `String?`
- En Zod: `.optional()`

### UI - Dropdown de Tipos
Siempre mostrar en español:
```tsx
<SelectItem value="plumbing">Fontanería</SelectItem>
<SelectItem value="electricity">Electricidad</SelectItem>
<SelectItem value="analysis">Análisis</SelectItem>
<SelectItem value="masonry">Albañilería</SelectItem>
<SelectItem value="other">Otro</SelectItem>
```

### Display de Tipo
Usar el método `getDisplayType()` de la entidad:
- Si `providerType === 'other'`: retornar `customProviderType`
- Sino: retornar el tipo traducido

---

## Comandos Útiles

```bash
# Sincronizar base de datos
bun run db:sync

# Ejecutar tests
bun test packages/providers/tests/

# Ejecutar tests específicos
bun test packages/providers/tests/entities/provider.test.ts

# Linter
bun run lint

# Dev server
bun run admin
```

---

## Referencias

- **Patrón de Entidades**: Ver `packages/registers/domain/entities/incident.ts` y `analysis.ts`
- **Patrón de Errores**: Ver `packages/registers/domain/errors/incident-errors.ts`
- **Patrón de Tests**: Ver `packages/registers/test/entities/analysis.test.ts`
- **Patrón de Servicios**: Ver `packages/registers/application/`
- **Patrón de Repositorio**: Ver `packages/registers/infrastructure/repositories/incident.prisma-repository.ts`
- **Patrón de Factory**: Ver `packages/registers/infrastructure/factories/registers.factory.ts`

