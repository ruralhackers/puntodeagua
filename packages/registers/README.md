# registers

This package contains the domain logic and application services for managing water system registers, including incident
s and analysis records.

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

### Incident
 Management

#### Incident
Creator Service
Creates new incident
s in the system.

**Pattern**: Pure persistence service
- Receives a pre-formed `Incident
` object
- Simply saves the incident
 to the repository
- Returns the saved incident


```typescript
const service = RegistersFactory.incident
CreatorService()
const incident
 = Incident
.create({...})
const savedIncident
 = await service.run({ incident
 })
```

#### Incident
Updater Service
Updates existing incident
s in the system.

**Pattern**: Hybrid update service
- Receives an `id` and a pre-formed `Incident
` object with updated values
- Fetches the existing incident
 from the repository
- Merges updated values with existing values (preserving unchanged fields)
- Saves the merged incident
 and returns it

```typescript
const service = RegistersFactory.incident
UpdaterService()
const updatedIncident
 = Incident
.fromDto({...})
const savedIncident
 = await service.run({ id: incident
Id, updatedIncident
 })
```

### Analysis Management

#### AnalysisCreator Service
Creates new analysis records in the system.

**Pattern**: Pure persistence service
- Receives a pre-formed `Analysis` object
- Simply saves the analysis to the repository
- Returns the saved analysis

```typescript
const service = RegistersFactory.analysisCreatorService()
const analysis = Analysis.create({...})
const savedAnalysis = await service.run({ analysis })
```

## Domain Entities

### Incident
 Entity
Represents a water system incident
 or problem report.

**Key Properties:**
- `id`: Unique identifier
- `title`: Incident
 title
- `reporterName`: Name of the person reporting the incident

- `startAt`: When the incident
 started
- `endAt`: When the incident
 was resolved (optional)
- `status`: Current status ('open' or 'closed')
- `communityId`: Associated community
- `waterZoneId`, `waterDepositId`, `waterPointId`: Associated water infrastructure (optional)
- `description`: Detailed description (optional)

**Business Rules:**
- Closed incident
s must have an end date
- End date cannot be before start date
- Description has length validation

### Analysis Entity
Represents water quality analysis results.

**Key Properties:**
- `id`: Unique identifier
- `type`: Analysis type (chlorine_ph, turbidity, hardness, complete)
- `communityId`: Associated community
- `waterZoneId`, `waterDepositId`, `waterPointId`: Associated water infrastructure (optional)
- `measurements`: Analysis measurements (ph, chlorine, turbidity, hardness)
- `description`: Additional notes (optional)
- `createdAt`: When the analysis was performed

**Business Rules:**
- Different analysis types require specific measurements
- All measurements must be valid numbers

## Repository Interfaces

### Incident
Repository
Extends common repository interfaces:
- `Savable<Incident
>`: Save incident
s
- `FindableAll<Incident
>`: Find all incident
s
- `Deletable<Incident
>`: Delete incident
s
- `FindableForTable<Incident
>`: Find incident
s for table display
- `findById(id: Id)`: Find incident
 by ID
- `findByCommunityId(communityId: Id)`: Find incident
s by community

### AnalysisRepository
Extends common repository interfaces:
- `Savable<Analysis>`: Save analyses
- `FindableAll<Analysis>`: Find all analyses
- `Deletable<Analysis>`: Delete analyses
- `FindableForTable<Analysis>`: Find analyses for table display

## Factory

### RegistersFactory
Provides singleton instances of services and repositories:

```typescript
// Services
const incident
Creator = RegistersFactory.incident
CreatorService()
const incident
Updater = RegistersFactory.incident
UpdaterService()
const analysisCreator = RegistersFactory.analysisCreatorService()

// Repositories
const incident
Repo = RegistersFactory.incident
PrismaRepository()
const analysisRepo = RegistersFactory.analysisPrismaRepository()
```

## Service Patterns

### Pure Persistence Pattern (Creators)
Used by `Incident
Creator` and `AnalysisCreator`:
- Receive pre-formed entity objects
- Perform simple persistence operations
- Minimal business logic
- High testability

### Hybrid Update Pattern (Updaters)
Used by `Incident
Updater`:
- Receive entity ID and updated entity object
- Handle fetch-and-merge logic internally
- Preserve business rules and validation
- Balance simplicity with necessary complexity

## Testing

The package includes comprehensive test coverage:

- **Entity Tests**: Domain logic and business rules
- **Service Tests**: Application logic and error handling
- **Integration Tests**: End-to-end functionality

Run tests with:
```bash
bun test packages/registers/test/
```

## Usage Examples

### Creating an Incident

```typescript
import { RegistersFactory } from '@pda/registers'
import { Incident
 } from '@pda/registers/domain/entities/incident
'

const incident
 = Incident
.create({
  title: 'Water leak in main pipe',
  reporterName: 'John Doe',
  startAt: new Date(),
  communityId: 'community-123',
  waterZoneId: 'zone-456',
  description: 'Significant leak detected',
  status: 'open'
})

const service = RegistersFactory.incident
CreatorService()
const savedIncident
 = await service.run({ incident
 })
```

### Updating an Incident

```typescript
import { Id } from '@pda/common/domain'

const existingIncident
 = await incident
Repo.findById(Id.fromString('incident
-123'))
const updatedIncident
 = Incident
.fromDto({
  ...existingIncident
.toDto(),
  status: 'closed',
  endAt: new Date()
})

const service = RegistersFactory.incident
UpdaterService()
const savedIncident
 = await service.run({ 
  id: Id.fromString('incident
-123'), 
  updatedIncident
 
})
```

### Creating an Analysis
```typescript
import { Analysis } from '@pda/registers/domain/entities/analysis'

const analysis = Analysis.create({
  type: 'chlorine_ph',
  communityId: 'community-123',
  waterZoneId: 'zone-456',
  measurements: {
    ph: 7.2,
    chlorine: 0.5
  },
  description: 'Routine monthly test'
})

const service = RegistersFactory.analysisCreatorService()
const savedAnalysis = await service.run({ analysis })
```

## Dependencies

- `@pda/common`: Common domain types and interfaces
- `@pda/database`: Database client and Prisma integration
- `zod`: Schema validation
- `bun:test`: Testing framework

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
