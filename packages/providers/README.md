# providers

This package contains the domain logic and application services for managing service providers for water communities.

To install dependencies:

```bash
bun install
```

To run tests:

```bash
bun test
```

## Architecture

The package follows a clean architecture pattern with clear separation of concerns:

- **Domain Layer**: Entities, value objects, and repository interfaces
- **Application Layer**: Use cases and business logic services
- **Infrastructure Layer**: Repository implementations and factories

## Services

### Provider Management

#### ProviderCreator Service
Creates new providers in the system.

**Pattern**: Pure persistence service
- Receives a pre-formed `Provider` object
- Simply saves the provider to the repository
- Returns the saved provider

```typescript
const service = ProvidersFactory.providerCreatorService()
const provider = Provider.create({...})
const savedProvider = await service.run({ provider })
```

#### ProviderUpdater Service
Updates existing providers in the system.

**Pattern**: Fetch-and-update service
- Receives a provider `id` and `ProviderUpdateDto` with updated values
- Fetches the existing provider from the repository
- Applies updates to the provider entity
- Validates business rules
- Saves the updated provider and returns it

```typescript
const service = ProvidersFactory.providerUpdaterService()
const savedProvider = await service.run({ 
  id: Id.fromString('provider-123'), 
  updatedProviderData: {
    companyName: 'Updated Name',
    isActive: false,
    // ... other fields
  }
})
```

## Domain Entities

### Provider Entity
Represents a service provider for the water community.

**Key Properties:**
- `id`: Unique identifier
- `companyName`: Company or business name
- `taxId`: Tax identification number (optional)
- `contactPerson`: Primary contact person
- `contactPhone`: Primary contact phone
- `contactEmail`: Contact email (optional)
- `secondaryPhone`: Secondary phone (optional)
- `billingEmail`: Billing email (optional)
- `address`, `city`, `postalCode`, `province`: Address information (optional)
- `providerType`: Type of service (ProviderType value object)
- `isActive`: Whether the provider is active
- `notes`: Additional notes (optional)
- `businessHours`: Business hours description (optional)
- `emergencyAvailable`: 24/7 emergency availability flag
- `emergencyPhone`: Emergency contact phone (optional)
- `bankAccount`: Bank account information (optional)
- `paymentTerms`: Payment terms description (optional)
- `website`: Provider website URL (optional)
- `communityId`: Associated community

**Business Rules:**
- Company name and contact person are required
- Contact phone is required
- Email addresses must be valid when provided
- Website must be a valid URL when provided

## Value Objects

### ProviderType
Represents the type of service a provider offers.

**Supported Types:**
- `plumbing`: Fontanería (Plumbing services)
- `electricity`: Electricidad (Electrical services)
- `analysis`: Análisis (Water analysis services)
- `masonry`: Albañilería (Masonry services)

**Methods:**
- `fromString(value: string)`: Create from string
- `toString()`: Convert to string
- `values()`: Get all valid types
- `isValidType(value: string)`: Validate type

**Usage:**
```typescript
const type = ProviderType.fromString('plumbing')
```

## Domain Errors

### ProviderNotFoundError
Thrown when a requested provider doesn't exist.
- Extends: `NotFoundError`
- English: "Provider not found"
- Spanish: "Proveedor no encontrado"

### InvalidProviderTypeError
Thrown when an invalid provider type is specified.
- Extends: `ForbiddenError`
- English: "Invalid provider type"
- Spanish: "Tipo de proveedor inválido"

## Repository Interfaces

### ProviderRepository
Extends common repository interfaces:
- `Savable<Provider>`: Save providers
- `FindableAll<Provider>`: Find all providers
- `FindableById<Provider>`: Find provider by ID
- `FindableByCommunityId<Provider>`: Find providers by community
- `FindableForTable<Provider>`: Find providers for table display
- `Deletable`: Delete providers

## Factory

### ProvidersFactory
Provides singleton instances of services and repositories:

```typescript
// Services
const providerCreator = ProvidersFactory.providerCreatorService()
const providerUpdater = ProvidersFactory.providerUpdaterService()

// Repositories
const providerRepo = ProvidersFactory.providerPrismaRepository()
```

## Service Patterns

### Pure Persistence Pattern (Creator)
Used by `ProviderCreator`:
- Receives pre-formed entity objects
- Performs simple persistence operations
- Minimal business logic
- High testability

### Fetch-and-Update Pattern (Updater)
Used by `ProviderUpdater`:
- Fetches existing entity
- Applies updates through entity methods
- Validates business rules
- Saves updated entity

## Testing

The package includes comprehensive test coverage:

- **Entity Tests**: Domain logic and business rules
- **Service Tests**: Application logic and error handling
- **Value Object Tests**: ProviderType validation

Run tests with:
```bash
bun test packages/providers/tests/
```

## Usage Examples

### Creating a Provider

```typescript
import { ProvidersFactory } from '@pda/providers'
import { Provider } from '@pda/providers/domain/entities/provider'

const provider = Provider.create({
  companyName: 'Fontanería García',
  taxId: 'B12345678',
  contactPerson: 'Juan García',
  contactPhone: '600123456',
  contactEmail: 'contacto@fontaneria-garcia.com',
  providerType: 'plumbing',
  isActive: true,
  emergencyAvailable: true,
  emergencyPhone: '600999888',
  communityId: 'community-123'
})

const service = ProvidersFactory.providerCreatorService()
const savedProvider = await service.run({ provider })
```

### Updating a Provider

```typescript
import { Id } from '@pda/common/domain'

const service = ProvidersFactory.providerUpdaterService()
const updatedProvider = await service.run({ 
  id: Id.fromString('provider-123'), 
  updatedProviderData: {
    companyName: 'Fontanería García S.L.',
    contactPerson: 'Juan García',
    contactPhone: '600123456',
    contactEmail: 'info@fontaneria-garcia.com',
    providerType: 'plumbing',
    isActive: false,
    notes: 'Provider retired',
    emergencyAvailable: false
  }
})
```

### Querying Providers

```typescript
const repo = ProvidersFactory.providerPrismaRepository()

// Find all providers
const allProviders = await repo.findAll()

// Find by community
const communityProviders = await repo.findByCommunityId(
  Id.fromString('community-123')
)

// Find by ID
const provider = await repo.findById(Id.fromString('provider-123'))
```

## Frontend Integration

The provider types are stored in English in the backend but displayed in Spanish in the frontend:

### Translation Helper
```typescript
import { getProviderTypeLabel } from '@/app/(main)/provider/_components/provider-type-labels'

const label = getProviderTypeLabel('plumbing') // Returns: 'Fontanería'
```

### Provider Type Badge Component
```tsx
<ProviderTypeBadge providerType="plumbing" />
// Displays badge with "Fontanería"

<ProviderTypeBadge providerType="electricity" />
// Displays badge with "Electricidad"
```

## Dependencies

- `@pda/common`: Common domain types and interfaces
- `@pda/database`: Database client and Prisma integration
- `zod`: Schema validation
- `bun:test`: Testing framework

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

