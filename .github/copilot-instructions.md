# Code Style Guidelines

- don't have to include jsdoc comments
- do avoid type assertions, only when is absolutely necessary
- Let TypeScript infer return types from function implementations, only explicitly declare return types in interfaces and abstract methods.
- Naming: Follow Domain-Driven Design patterns
- Architecture: Application, Domain, Infrastructure layers
- Packages: Monorepo with workspaces in packages/_ /apps/_
- Comments Language: Use always english language for comments

# Frontend

- is inside a bun monorepo
- the frontend folder is /apps/admin
- uses NextJs version 14
- uses shadcn for frontend components

# Organization

- this is code that follows domain driven design principles together with a ports and adapters structure
- it is structured in bounded context which live inside packages/<bounded-context>
- does not use getters and setters in classes

## Domain

- usually has the following folders
  - packages/domain/entities
  - packages/domain/value-objects
  - packages/domain/repositories
  - packages/domain/services
  - packages/domain/events

## Services

- both application and domain services should have a single responsibility
- services will always be started with a public run method

### Domain Services

- live in packages/<bounded-context>/domain/services/
- represent domain concepts and operations
- contain pure business logic
- express domain rules that don't fit in entities/value objects

### Application Services

- live in packages/<bounded-context>/application/<entity>/
- represent complete use cases
- orchestrate domain objects
- handle technical concerns like transactions
- coordinate multiple domain services/entities

## Infrastructure
