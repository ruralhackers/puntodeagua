# registers

This package contains the domain logic and application services for managing water system registers, including issues and analysis records.

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

### Issue Management

#### IssueCreator Service
Creates new issues in the system.

**Pattern**: Pure persistence service
- Receives a pre-formed `Issue` object
- Simply saves the issue to the repository
- Returns the saved issue

```typescript
const service = RegistersFactory.issueCreatorService()
const issue = Issue.create({...})
const savedIssue = await service.run({ issue })
```

#### IssueUpdater Service
Updates existing issues in the system.

**Pattern**: Hybrid update service
- Receives an `id` and a pre-formed `Issue` object with updated values
- Fetches the existing issue from the repository
- Merges updated values with existing values (preserving unchanged fields)
- Saves the merged issue and returns it

```typescript
const service = RegistersFactory.issueUpdaterService()
const updatedIssue = Issue.fromDto({...})
const savedIssue = await service.run({ id: issueId, updatedIssue })
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

### Issue Entity
Represents a water system issue or problem report.

**Key Properties:**
- `id`: Unique identifier
- `title`: Issue title
- `reporterName`: Name of the person reporting the issue
- `startAt`: When the issue started
- `endAt`: When the issue was resolved (optional)
- `status`: Current status ('open' or 'closed')
- `communityId`: Associated community
- `waterZoneId`, `waterDepositId`, `waterPointId`: Associated water infrastructure (optional)
- `description`: Detailed description (optional)

**Business Rules:**
- Closed issues must have an end date
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

### IssueRepository
Extends common repository interfaces:
- `Savable<Issue>`: Save issues
- `FindableAll<Issue>`: Find all issues
- `Deletable<Issue>`: Delete issues
- `FindableForTable<Issue>`: Find issues for table display
- `findById(id: Id)`: Find issue by ID
- `findByCommunityId(communityId: Id)`: Find issues by community

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
const issueCreator = RegistersFactory.issueCreatorService()
const issueUpdater = RegistersFactory.issueUpdaterService()
const analysisCreator = RegistersFactory.analysisCreatorService()

// Repositories
const issueRepo = RegistersFactory.issuePrismaRepository()
const analysisRepo = RegistersFactory.analysisPrismaRepository()
```

## Service Patterns

### Pure Persistence Pattern (Creators)
Used by `IssueCreator` and `AnalysisCreator`:
- Receive pre-formed entity objects
- Perform simple persistence operations
- Minimal business logic
- High testability

### Hybrid Update Pattern (Updaters)
Used by `IssueUpdater`:
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

### Creating an Issue
```typescript
import { RegistersFactory } from '@pda/registers'
import { Issue } from '@pda/registers/domain/entities/issue'

const issue = Issue.create({
  title: 'Water leak in main pipe',
  reporterName: 'John Doe',
  startAt: new Date(),
  communityId: 'community-123',
  waterZoneId: 'zone-456',
  description: 'Significant leak detected',
  status: 'open'
})

const service = RegistersFactory.issueCreatorService()
const savedIssue = await service.run({ issue })
```

### Updating an Issue
```typescript
import { Id } from '@pda/common/domain'

const existingIssue = await issueRepo.findById(Id.fromString('issue-123'))
const updatedIssue = Issue.fromDto({
  ...existingIssue.toDto(),
  status: 'closed',
  endAt: new Date()
})

const service = RegistersFactory.issueUpdaterService()
const savedIssue = await service.run({ 
  id: Id.fromString('issue-123'), 
  updatedIssue 
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
