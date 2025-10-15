# Contributing to Punto de Agua

Thank you for your interest in contributing to Punto de Agua! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Community Guidelines](#community-guidelines)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime (latest version)
- [Docker](https://www.docker.com/) or [Podman](https://podman.io/)
- [Git](https://git-scm.com/)

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/puntodeagua.git
   cd puntodeagua
   ```

3. **Install dependencies**:
   ```bash
   bun install
   ```

4. **Start the database**:
   ```bash
   bun run dbs
   ```

5. **Sync the database**:
   ```bash
   bun run db:sync
   ```

6. **Start the development server**:
   ```bash
   bun run webapp
   ```

## How to Contribute

### 1. Find an Issue

- Look for issues labeled `good first issue` if you're new to the project
- Check issues labeled `help wanted` for areas needing attention
- Comment on issues you'd like to work on to avoid duplicate work

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Your Changes

- Follow the [Code Style Guidelines](#code-style-guidelines)
- Write tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run all tests
bun test

# Run linting and formatting
bun run check

# Test the webapp
bun run webapp
```

### 5. Commit Your Changes

Follow the [Commit Message Guidelines](#commit-message-guidelines).

### 6. Push and Create a Pull Request

```bash
git push origin your-branch-name
```

Then create a pull request on GitHub.

## Issue Guidelines

### Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) and include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, version)
- Screenshots if applicable

### Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml) and include:

- Problem statement
- Proposed solution
- Use case and benefits
- Priority level

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `priority: high/medium/low` - Priority levels

## Pull Request Process

1. **Use the PR template** - Fill out all relevant sections
2. **Link to issues** - Reference related issues using "Closes #123"
3. **Keep PRs focused** - One feature/fix per PR
4. **Write clear descriptions** - Explain what and why
5. **Add tests** - Include tests for new functionality
6. **Update documentation** - Update README, comments, etc.

### PR Review Process

- All PRs require review from maintainers
- Address feedback promptly
- Keep PRs up to date with main branch
- Squash commits before merging (if requested)

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript with strict mode
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Follow the existing code patterns
- No JSDoc comments required (TypeScript provides type safety)

### Domain-Driven Design

- Respect bounded context boundaries
- Keep domain logic in the domain layer
- Use proper entity and value object patterns
- Follow the existing architecture patterns

### File Organization

- Follow the monorepo structure
- Use the `@pda/package-name` naming convention
- Keep related files together
- Use descriptive file names

### Formatting

We use Biome for code formatting and linting:

```bash
# Format code
bun run format

# Check for issues
bun run check
```

## Testing

### Writing Tests

- Write unit tests for business logic
- Write integration tests for API endpoints
- Test error cases and edge cases
- Aim for good test coverage

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

## Commit Message Guidelines

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(water-points): add water consumption tracking
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
test(community): add unit tests for community service
```

## Community Guidelines

### Communication

- Be respectful and inclusive
- Use clear, constructive language
- Ask questions when unsure
- Help others when you can

### Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Join our community channels (if available)

### Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Release Process

1. Features are merged to `main`
2. Releases are tagged with semantic versioning
3. Release notes are generated from commits

## Water Management Domain

This project focuses on water management for rural communities. When contributing:

- Understand the water management domain
- Consider the needs of rural communities
- Think about scalability and reliability
- Consider data privacy and security

## Questions?

If you have questions about contributing:

1. Check this document first
2. Look at existing issues and discussions
3. Create a new issue with the `question` label
4. Contact maintainers directly (if urgent)

Thank you for contributing to Punto de Agua! 🌊
