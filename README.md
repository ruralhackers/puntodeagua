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

# Todo

- [ ] Prisma + Postgres @orlando
- [ ] Configurar Biome en pre commit
- [ ] Multitenant
- [ ] Middleware de gestión de errores
- [ ] Configuración PWA @victor
- [ ] Roles y permisos. Resolver a nivel de middleware con foco en permisos granulares @cesalberca
- [ ] Interfaz
- [ ] Multiidoma con Next Intl
- [ ] Test con BunTest
- [ ] Test con Playwright
- [ ] Documentar arquitectura @cesalberca
- [ ] Documentar setup @cesalberca
- [ ] Romper enrutado en varios ficheros @Orlando
