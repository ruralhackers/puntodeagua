# Development Guidelines

## Code Style and Structure

- Write concise, best practises code with accurate examples. Follow Code Craftmanship patterns
- Follow the NextJS framework as this is a NextJS project.
- Favor object-oriented programming (OOP) and declarative programming patterns.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Prefer one export per file.
- Ensure a clear separation between UI, state management, and business logic to maintain a clean architecture.
- Follow NextJS official documentation for setting up and configuring your projects: https://nextjs.org/.
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Always use named exports for consistency and maintainability.
- Use npm as the package manager and lock versions using package-lock.json for consistency.
- Use ?? instead of || for nullish coalescing.
- Use conventional commit messages (feat:, fix:, chore:, etc.).
- Ensure all code changes include relevant test cases.
- Use declarative JSX.
- Use BiomeJS with project-specific settings enforced via Lefthook.

## TypeScript Usage

- Use TypeScript for all code.
- Prefer interfaces over types, except for utility types or mapped types.
- Avoid enums due to runtime overhead; prefer object maps or union types instead.
- Use strict mode in TypeScript for better type safety.

## UI and Styling

- Use Tailwind 4 for styling.
- Use Shadcn components.
- Favor Tailwind utility classes over inline styles or unnecessary CSS files.
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
- Avoid hardcoding padding or margins. Use Tailwind theme configuration for spacing.
- Implement proper keyboard handling.
- Use CSS variables for theming when necessary.

## Performance Optimization

- Minimize the use of useState and useEffect.
- Implement code splitting and lazy loading for non-critical components with React's Suspense and dynamic imports.
- Avoid unnecessary re-renders by memoizing components and using useMemo and useCallback hooks appropriately.
- Minimize unnecessary API requests by leveraging caching and revalidation strategies.

## Navigation

- Use Next router for routing and navigation.
- Use nested routing for better component structure and progressive enhancement.
- Use custom Link instead of importing from next/link.

## State Management

- Minimize use of client-side state and favor server-side state where possible.
- Use React Context sparingly to avoid unnecessary re-renders.

## Error Handling and Validation

- Handle errors at the beginning of functions.
- Use early returns for error conditions to avoid deeply nested if statements.
- Avoid unnecessary else statements; use the if-return pattern instead.
- Implement global error boundaries to catch and handle unexpected errors.
- Use domain errors to handle errors in the domain layer.
- Use NextJS's ErrorBoundary components for error handling at the route level.

## Testing

- Write unit tests using Vitest.
- Implement integration tests for critical user flows using Playwright.
- Write test cases for both success and failure scenarios.

## Security

- Sanitize user inputs to prevent XSS attacks.
- Ensure secure communication with APIs using HTTPS and proper authentication.
- Implement Content Security Policy (CSP) headers to prevent cross-site scripting (XSS) attacks.
- Use secure, HttpOnly, and same-site cookies for session management.

## React Components

- Use a variable (const) for the components.
- Use FC to type the variable.
- If a component has children, use PropsWithChildren to type the component.
- Props should be typed within the component's type definition.

## API Documentation

- Use TypeScript doc comments for complex functions and APIs.
- Keep API documentation up-to-date when modifying code.

## Architecture

This project follows Clean Architecture principles with CQRS (Command Query Responsibility Segregation) and Dependency Injection patterns.

### Clean Architecture Layers

The application is organized into distinct layers with clear separation of concerns:

- Domain Layer: Core business entities and repository interfaces (e.g., WaterPoint entity, WaterPointRepository interface)
- Application Layer: Use cases that orchestrate business logic (e.g., GetWaterPointsQry)
- Infrastructure Layer: Implementation of external concerns (e.g., WaterPointApiRestRepository, database access)
- Delivery Layer: Controllers and UI components that handle user interaction

### Use Cases Pattern

Use cases represent application-specific business rules and orchestrate the flow of data between entities and repositories.

Structure:
- Implement the UseCase<In, Out> or Query<Out> interface
- Include a static ID property for dependency injection registration
- Use constructor injection to receive dependencies (repositories, services)
- Implement the handle() method containing application logic. If needed it will call necessary business logic from the domain layer.

Example:
```typescript
export class GetWaterPointsQry implements Query<WaterPoint[]> {
    static readonly ID = "GetWaterPointsQry";
    
    constructor(
        private readonly waterPointRepository: WaterPointRepository,
    ) {}
    
    async handle(): Promise<WaterPoint[]> {
        return await this.waterPointRepository.findAll();
    }
}
```

### Repository Pattern

Repositories provide an abstraction layer over data access, allowing the application to work with domain entities without knowing the underlying data storage mechanism.

Structure:
- Define repository interfaces in the domain layer
- Implement concrete repositories in the infrastructure layer
- Use dependency injection to provide different implementations (API, database, mock)
- Repository methods should work with domain entities, not DTOs

Example interface:
```typescript
export interface WaterPointRepository {
    findAll(): Promise<WaterPoint[]>;
    findById(id: Id): Promise<WaterPoint | null>;
    save(waterPoint: WaterPoint): Promise<void>;
    delete(id: Id): Promise<void>;
}
```

Example implementation:
```typescript
export class WaterPointApiRestRepository implements WaterPointRepository {
    constructor(private readonly httpClient: HttpClient) {}
    
    async findAll(): Promise<WaterPoint[]> {
        const waterPointDtos = await this.httpClient.get<WaterPointDto[]>("water-points");
        return waterPointDtos.data.map(WaterPoint.create);
    }
    
    // ... other methods
}
```

### Dependency Injection

- Register use cases and repositories in container classes (ApiContainer, WebappContainer)
- Use static ID properties for service registration and resolution
- Inject repositories into use cases through constructor parameters
- Keep dependencies flowing inward (infrastructure → application → domain)

Integration Example:
```typescript
// In container
const waterPointRepository = new WaterPointApiRestRepository(httpClient);
const getWaterPointsQry = new GetWaterPointsQry(waterPointRepository);
this.register(GetWaterPointsQry.ID, getWaterPointsQry);

// In usage
const waterPoints = await useCaseService.execute(GetWaterPointsQry);
```
