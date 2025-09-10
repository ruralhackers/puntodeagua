# PromptHero

A modern monorepo containing all PromptHero applications and packages, built with Domain-Driven Design principles and a clean architecture approach.

## 🏗️ Architecture

This project follows Domain-Driven Design (DDD) with a ports and adapters (hexagonal) architecture:

- **Bounded Contexts**: Organized in `packages/<bounded-context>`
- **Layered Architecture**: Application, Domain, and Infrastructure layers
- **Monorepo Structure**: Workspaces in `packages/*` and `apps/*`

### Project Structure

```
prompthero/
├── apps/
│   ├── admin/          # NextJS 15 admin dashboard
│   └── app/            # Main application
├── packages/
│   └── <bounded-context>/
│       ├── domain/
│       │   ├── entities/
│       │   ├── valueObjects/
│       │   ├── repositories/
│       │   ├── services/
│       │   └── events/
│       ├── application/
│       └── infrastructure/
├── lib-docs/
│   └── legacy/         # Legacy documentation and guides
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime
- [Docker](https://www.docker.com/) or [Podman](https://podman.io/)

### Installation

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start the database**:
   ```bash
   bun run dbs
   ```
   > This runs `docker-compose -f docker-compose.yml up -d` to start PostgreSQL

4. **Sync the database**:
   ```bash
   bun run db:sync
   ```
   > Synchronizes the database schema with your models

## 🎯 Available Applications

### Admin Dashboard
Modern admin interface built with NextJS 14 and shadcn/ui components.

```bash
bun run admin
```

### Main Application
Core PromptHero application.

```bash
bun run app
```

## 🛠️ Development

### Tech Stack

- **Runtime**: Bun
- **Frontend**: NextJS 15, shadcn/ui
- **Database**: PostgreSQL
- **Architecture**: DDD + Hexagonal Architecture
- **Language**: TypeScript

### Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install all dependencies |
| `bun run dbs` | Start database services |
| `bun run db:sync` | Synchronize database schema |
| `bun run admin` | Start admin dashboard |
| `bun run app` | Start main application |

### Code Guidelines

- TypeScript with inferred return types
- No JSDoc comments required
- Domain-Driven Design patterns
- English language for all comments
- No getters/setters in classes
- Services start with public `run` method

## 📁 Domain Organization

### Domain Layer
- **Entities**: Core business objects
- **Value Objects**: Immutable domain concepts
- **Repositories**: Data access interfaces
- **Services**: Domain logic that doesn't fit in entities
- **Events**: Domain events for decoupling

### Application Layer
- **Use Cases**: Complete business operations
- **Services**: Orchestrate domain objects
- **Coordination**: Handle technical concerns

## 🤝 Contributing

This project follows strict Domain-Driven Design principles. Please ensure:

1. New features are properly bounded
2. Domain logic stays in the domain layer
3. Infrastructure concerns are separated
4. Services follow single responsibility principle

## � Documentation

Legacy documentation and migration guides can be found in `lib-docs/legacy/`. This includes historical implementation details and transition documentation from previous architectures.

## �📄 License

[Add your license information here]

