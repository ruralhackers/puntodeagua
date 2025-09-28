# 💧 Punto de Agua

A water management system built with Domain-Driven Design principles and clean architecture. This platform enables communities to manage their water infrastructure, monitor consumption, and handle administrative tasks efficiently.

## 🏗️ Architecture

This project follows Domain-Driven Design (DDD) with a ports and adapters (hexagonal) architecture:

- **Bounded Contexts**: Organized in `packages/<bounded-context>`
- **Layered Architecture**: Application, Domain, and Infrastructure layers
- **Monorepo Structure**: Workspaces in `packages/*` and `apps/*`
- **Package Naming**: Follows `@pda/package-name` convention
- **Database**: PostgreSQL with Docker Compose configuration

### Project Structure

```
puntodeagua/
├── apps/
│   └── admin/          # NextJS 14 admin dashboard
├── packages/
│   ├── common/         # @pda/common - Shared domain utilities
│   ├── user/           # @pda/user - User management bounded context
│   ├── community/      # @pda/community - Community management
│   ├── water-account/  # @pda/water-account - Water infrastructure management
│   ├── registers/      # @pda/registers - Issue and analysis management
│   └── database/       # @pda/database - Database infrastructure
│       └── <bounded-context>/
│           ├── domain/
│           │   ├── entities/
│           │   ├── value-objects/
│           │   ├── repositories/
│           │   ├── services/
│           │   └── events/
│           ├── application/
│           └── infrastructure/
├── .github/           # GitHub workflows and configuration
└── docker-compose.yml  # Database services configuration
```

### Package Naming Convention

All packages follow the naming pattern: `@pda/<package-name>`

Examples:
- `@pda/common` - Common domain utilities and shared components
- `@pda/database` - Database infrastructure package
- `@pda/user` - User management bounded context
- `@pda/community` - Community management bounded context
- `@pda/water-account` - Water infrastructure and monitoring
- `@pda/registers` - Issue tracking and water analysis management

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

5. **Seed the database** (optional):
   ```bash
   bun run db:seed
   ```
   > Populates the database with sample communities and users

## 🎯 Available Applications

### Admin Dashboard
Water management admin interface built with NextJS 14 and shadcn/ui components. Allows communities to manage their water infrastructure, users, and monitor consumption.

```bash
bun run admin
```

## 🌊 Water Management Features

### Core Functionality

- **Community Management**: Multi-tenant system supporting multiple water communities
- **User Roles**: Super Admin, Community Admin, and Manager roles with granular permissions
- **Water Infrastructure**: Management of water points, zones, and meter readings
- **Consumption Monitoring**: Track water usage with configurable limits per community
- **Issue Tracking**: Report and manage water infrastructure issues
- **Provider Management**: Handle maintenance providers and services

### User Roles

- **SUPER_ADMIN**: System-wide administration across all communities
- **COMMUNITY_ADMIN**: Full administration within a specific community
- **MANAGER**: Operational management within a community

## 🛠️ Development

### Tech Stack

- **Runtime**: Bun
- **Frontend**: NextJS 14, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Architecture**: DDD + Hexagonal Architecture
- **Language**: TypeScript
- **Containerization**: Docker Compose

### GitHub Actions

This project includes automated workflows:

- **Tests**: Automated test execution on pull requests and pushes
- **Biome**: Code formatting and linting checks for code quality

### Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install all dependencies |
| `bun run dbs` | Start database services (PostgreSQL) |
| `bun run db:sync` | Synchronize database schema |
| `bun run db:seed` | Seed database with sample data |
| `bun run admin` | Start admin dashboard |

### Code Guidelines

- TypeScript with inferred return types
- No JSDoc comments required
- Domain-Driven Design patterns
- English language for all comments
- No getters/setters in classes
- Services start with public `run` method
- Package naming: `@pda/package-name`

## 📁 Domain Organization

### Bounded Contexts

#### Users (`@pda/user`)
User management, authentication, and role-based access control.

#### Communities (`@pda/community`)
Community management with configurable water usage rules and limits.

#### Water (`@pda/water-account`)
Water infrastructure management including:
- Water points and zones
- Meter readings and consumption tracking
- Provider management

#### Registers (`@pda/registers`)
Issue tracking and water analysis management including:
- Issue reporting and resolution tracking
- Water quality analysis and monitoring
- Service pattern implementations (Creator/Updater services)

### Domain Layer Structure
- **Entities**: Core business objects (User, Community, WaterPoint, etc.)
- **Value Objects**: Immutable domain concepts (Email, UserRole, WaterLimit, etc.)
- **Repositories**: Data access interfaces
- **Services**: Domain logic that doesn't fit in entities
- **Events**: Domain events for decoupling

### Application Layer
- **Use Cases**: Complete business operations
- **Services**: Orchestrate domain objects
- **Coordination**: Handle technical concerns like transactions

## 🤝 Contributing

This project follows strict Domain-Driven Design principles for water management systems. Please ensure:

1. New features respect the bounded context boundaries
2. Water-related domain logic stays in the appropriate domain layer
3. Infrastructure concerns are properly separated
4. Services follow single responsibility principle
5. Water management business rules are properly encapsulated

## 💧 About Punto de Agua

Punto de Agua is a comprehensive water management platform designed to help rural and urban communities efficiently manage their water resources, infrastructure, and consumption monitoring.



