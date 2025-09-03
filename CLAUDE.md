# Punto de Agua - Architecture Specifications

## Project Overview
Punto de Agua is a water management system built as a TypeScript monorepo using modern web technologies. The system tracks water points, meters, and readings across different communities and plans.

## Architecture Pattern
- **Monorepo Structure**: Uses Bun workspaces with apps and packages separation
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Full-Stack TypeScript**: Shared types and validation across frontend and backend

## Technology Stack

### Runtime & Package Management
- **Runtime**: Bun (for API and tooling)
- **Package Manager**: Bun with workspace support
- **Node Version**: Latest (for Next.js compatibility)

### Backend (API)
- **Framework**: Elysia.js (modern TypeScript-first web framework)
- **API Documentation**: Swagger via @elysiajs/swagger
- **Port**: 4000
- **Architecture**: Clean Architecture with UseCases and DI Container

### Frontend (WebApp)
- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Build Tool**: Turbopack (Next.js internal)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives + custom components
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Database
- **Database**: PostgreSQL 15
- **ORM**: Prisma with custom output directory
- **Connection**: Direct (relationMode: "prisma")
- **Development**: Docker Compose (port 5555)
- **Authentication**: NextAuth.js compatible schema

### Development Tools
- **Code Formatting**: Biome (replaces Prettier + ESLint)
- **Type Checking**: TypeScript 5 (strict mode)
- **Git Hooks**: Git integration enabled
- **Container**: Docker Compose for local PostgreSQL

## Monorepo Structure

```
puntodeagua/
├── apps/
│   ├── api/           # Elysia.js backend API
│   ├── webapp/        # Next.js frontend application  
│   └── mockup/        # Design mockups/prototypes
├── packages/
│   ├── core/          # Business logic and domain entities
│   ├── database/      # Prisma schema and client
│   ├── components/    # Shared UI components
│   └── features/      # Feature-specific logic
└── [config files]
```

## Domain Model

### Core Entities
- **Plan**: Top-level organization unit
- **Community**: Belongs to a Plan, contains multiple water points
- **WaterPoint**: Physical location with water infrastructure
- **WaterMeter**: Device that measures water usage at a point
- **Holder**: Entity responsible for a water meter
- **WaterMeterReading**: Timestamped measurement values

### Authentication
- **User**: Standard user with email, optional name, roles (JSON array)
- **Account**: OAuth provider accounts (NextAuth pattern)
- **Session**: User sessions with expiration
- **VerificationToken**: Email verification tokens

## Key Configuration

### TypeScript
- Target: ESNext with React JSX support
- Module: Preserve (for better bundler compatibility)
- Strict mode enabled with additional safety checks
- No emit (bundler handles compilation)

### Code Style (Biome)
- Indent: 2 spaces
- Line width: 100 characters  
- Quotes: Single quotes (JS), double quotes (JSX)
- Semicolons: As needed
- Trailing commas: None

### Development Scripts
- `bun run format`: Format code with Biome
- `bun run compile`: Type check all packages
- `bun dbs`: Start local PostgreSQL container
- `bun run dev`: Start API in watch mode
- `next dev --turbopack`: Start webapp in dev mode

### Database Scripts
- `bun run generate`: Generate Prisma client
- `bun run db:push`: Push schema to database
- `bun run db:seed`: Seed database with initial data
- `bun run db:fresh`: Reset, push, and seed database

## Development Workflow
1. Use Docker Compose for local PostgreSQL
2. Prisma for database schema and migrations
3. Shared validation with Zod across frontend/backend
4. Clean Architecture with dependency injection in API
5. Component-driven development with Radix UI primitives
6. Type-safe development across the entire stack

## Environment Setup
- `.env.local`: Local development environment
- `.env.dev`: Development server environment  
- `.env`: Production environment
- Docker Compose handles local database setup

## Key Dependencies
- **Shared**: Zod (validation), TypeScript 5
- **API**: Elysia.js, dependency injection container
- **WebApp**: Next.js 15, React 19, Tailwind 4, Radix UI
- **Database**: Prisma, PostgreSQL client
- **Dev Tools**: Biome, Bun, Docker