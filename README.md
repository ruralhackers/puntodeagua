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
│   ├── webapp/         # NextJS admin & management dashboard
│   └── seed-data/      # Data import and seeding tooling
├── packages/
│   ├── common/         # @pda/common - Shared domain utilities
│   ├── user/           # @pda/user - User management bounded context
│   ├── community/      # @pda/community - Community management
│   ├── water-account/  # @pda/water-account - Water infrastructure management
│   ├── registers/      # @pda/registers - Incident and analysis management
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
- `@pda/registers` - Incident tracking and water analysis management
- `@pda/fees` - Community fee configuration and payments
- `@pda/providers` - Maintenance provider management
- `@pda/storage` - File storage infrastructure
- `@pda/testing` - Test harness for integration tests

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
   bun run -F @pda/database db:seed
   ```
   > Populates the database with sample communities and users

## 🎯 Available Applications

### Webapp
Water management admin interface built with NextJS 14 and shadcn/ui components. Allows communities to manage their water infrastructure, users, and monitor consumption.

```bash
bun run webapp
```

## 🌊 Water Management Features

### Core Functionality

- **Community Management**: Multi-tenant system supporting multiple water communities
- **User Roles**: Super Admin, Community Admin, and Manager roles with granular permissions
- **Water Infrastructure**: Management of water points, zones, and meter readings
- **Consumption Monitoring**: Track water usage with configurable limits per community
- **Incident Tracking**: Report and manage water infrastructure incidents
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
| `bun run -F @pda/database db:seed` | Seed database with sample data |
| `bun run webapp` | Start the webapp |

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
Incident tracking and water analysis management including:
- Incident reporting and resolution tracking
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

We welcome contributions to Punto de Agua! This project follows strict Domain-Driven Design principles for water management systems.

### Quick Start for Contributors

1. **Read our [Contributing Guidelines](CONTRIBUTING.md)** - Complete guide for contributors
2. **Check our [Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards and expectations
3. **Look for issues** labeled `good first issue` or `help wanted`
4. **Fork, branch, and submit a PR** following our guidelines

### Development Principles

When contributing, please ensure:

1. New features respect the bounded context boundaries
2. Water-related domain logic stays in the appropriate domain layer
3. Infrastructure concerns are properly separated
4. Services follow single responsibility principle
5. Water management business rules are properly encapsulated

### Getting Help

- 📖 [Contributing Guide](CONTRIBUTING.md) - Detailed contribution instructions
- 💬 [GitHub Discussions](https://github.com/ruralhackers/puntodeagua/discussions) - Ask questions and discuss ideas
- 🐛 [Report Issues](https://github.com/ruralhackers/puntodeagua/issues) - Bug reports and feature requests
- 🔒 [Security Issues](SECURITY.md) - Report security vulnerabilities privately

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### What this means:

- ✅ **Commercial use allowed**: You can use this software for commercial purposes
- ✅ **Modification allowed**: You can modify the code to fit your needs
- ✅ **Distribution allowed**: You can share the software with others
- 🔒 **Copyleft protection**: If you modify and distribute the software, you must share your changes under the same license
- 🌐 **Network use protection**: If you run a modified version as a web service, you must make the source code available to users

### Key benefits for the community:

- **Prevents proprietary forks**: No one can take this code, close it, and sell it without sharing improvements
- **Ensures continued openness**: All improvements benefit the entire community
- **Protects the social mission**: Maintains the open, community-focused nature of water management

For the full license text, see [LICENSE](LICENSE) file.

## 💧 About Punto de Agua

Punto de Agua is a comprehensive water management platform designed to help rural and urban communities efficiently manage their water resources, infrastructure, and consumption monitoring.



