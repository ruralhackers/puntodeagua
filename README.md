# puntodeagua

To install dependencies:

```bash
bun install
```

# Setup

## Environment Configuration

Before starting the project, you need to set up the environment variables for both the API and webapp:

### 1. API Environment Setup
```bash
cd apps/api
cp .env.example .env.local
```
Edit `apps/api/.env.local` and configure:
- `DATABASE_URL`: Your database connection string (e.g., `postgresql://punto_de_agua_user:punto_de_agua_password@localhost:5555/punto_de_agua_local`)

### 2. Webapp Environment Setup
```bash
cd apps/webapp
cp .env.example .env.local
```
Edit `apps/webapp/.env.local` and configure:
- `NEXT_PUBLIC_API_URL`: The URL where your API is running (e.g., `http://localhost:4000/api`)

## Starting the Project

After setting up the environment files:

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development servers (run each in a separate terminal):
   
   **API:**
   ```bash
   bun -F api dev
   ```
   
   **Webapp:**
   ```bash
   bun -F webapp dev
   ```

# Architecture

This project follows a **Clean Architecture** pattern with **CQRS** (Command Query Responsibility Segregation) and **Dependency Inversion**, organized as a monorepo with shared packages.

## Project Structure

```
├── apps/
│   ├── api/          # Backend API (Elysia + Prisma)
│   ├── webapp/       # Frontend (Next.js)
│   └── mockup/       # Design mockups
├── packages/
│   ├── core/         # Shared abstractions and utilities for  all apps  or packages
│   ├── database/     # Prisma database layer
│   └── features/     # Shared domain entities and DTOs for all  apps
```

## Architectural Patterns

### Clean Architecture Layers

Both API and webapp follow the same layered structure:

- **Delivery Layer**: HTTP controllers (API) or React components (webapp)
- **Application Layer**: Use cases (Queries and Commands)
- **Infrastructure Layer**: Repository implementation 
- **Domain Layer**: Entities, business logic and repository interfaces

### CQRS Implementation

The project implements CQRS using:

- **Queries**: Read operations that return data (e.g., `GetWaterPointsQry`)
- **Commands**: Write operations that modify state
- **Use Case Service**: Executes queries and commands

### Dependency Injection

- **CoreContainer**: Base container with shared services
- **ApiContainer**: Extends CoreContainer with API-specific dependencies
- **WebappContainer**: Extends CoreContainer with webapp-specific dependencies

## Data Flow

### API Flow
1. **HTTP Request** → Elysia controller
2. **Controller** → UseCaseService.execute(Query)
3. **Query** → Repository (Prisma)
4. **Repository** → Database
5. **Domain Entity** → DTO → HTTP Response

### Webapp Flow
1. **React Component** → Container.get(Query)
2. **Query** → Repository (HTTP Client)
3. **Repository** → API call
4. **DTO** → Domain Entity → UI

## Key Components

### Repositories
- **WaterPointPrismaRepository**: Database access via Prisma (API)
- **WaterPointApiRestRepository**: HTTP API calls (Webapp)
- Both implement the same `WaterPointRepository` interface

### Use Cases (Queries)
- **GetWaterPointsQry**: Retrieves all water points
- May use repositories or call domain objects

### Domain Entities
- **WaterPoint**: Core domain entity with factory methods
- **WaterPointDto**: Data transfer object for serialized communication (API or NextJS)
- Entities include `toDto()` methods for serialization

### Shared Packages
- **core**: Base abstractions, DI container, HTTP client, types
- **database**: Prisma client and database configuration
- **features**: Domain entities, DTOs, and repository interfaces

This architecture enables:
- **Separation of concerns** across layers
- **Testability** through dependency injection
- **Code reuse** via shared packages
- **Scalability** with clean boundaries between components

# Todo

- [ ] Configurar Biome en pre commit
- [ ] Multitenant
- [ ] Middleware de gestión de errores
- [ ] Configuración PWA @victor
- [ ] Roles y permisos. Resolver a nivel de middleware con foco en permisos granulares @cesalberca
- [ ] Multiidoma con Next Intl
- [ ] Test con BunTest
- [ ] Test con Playwright
- [ ] Mover la creación de UUIDs en el back
