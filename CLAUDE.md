# DXWorks CLI - Nx Workspace

Modern Nx monorepo for DXWorks CLI tools.

## Tech Stack

- **Runtime**: Node.js 24+ LTS
- **Package Manager**: pnpm
- **Monorepo**: Nx 22.x
- **Testing**: Vitest 4.x
- **Linting**: ESLint v9 (flat config)
- **Language**: TypeScript 5.x (strict mode, ESM)

## Project Structure

```
packages/
  common/     # @dxworks/common - Shared utilities
  cli/        # @dxworks/cli - Main CLI application
  voyenv/     # @dxworks/voyenv - Voyager environment CLI
```

## Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
pnpm lint             # Lint code
pnpm lint:fix         # Fix lint issues
pnpm format           # Format with Prettier
```

## Package-Specific Commands

```bash
pnpm nx build common   # Build common package
pnpm nx build cli      # Build CLI package
pnpm nx build voyenv   # Build voyenv package
pnpm nx test cli       # Test CLI package only
```

## Development Notes

### File Structure Pattern

- Source files in `src/`
- Tests in `src/__tests__/` (colocated with source)
- Assets in `assets/` (copied to dist during build)

### Import Paths

- Use `.js` extensions in imports (ESM requirement)
- Use `@dxworks/common` for cross-package imports

### Testing

- Mock external dependencies (npm, git, GitHub API, filesystem)
- Use `vi.mock()` for module mocking
- Use `vi.spyOn()` for function spying

### Adding New Commands

1. Create command file in `src/commands/<group>/<command>.ts`
2. Export a Commander Command instance
3. Add tests in `src/__tests__/commands/<group>/<command>.test.ts`
4. Register command in main CLI entry point

## Configuration Files

- `eslint.config.js` - ESLint v9 flat config
- `tsconfig.base.json` - Base TypeScript config
- `vitest.config.ts` - Vitest configuration
- `nx.json` - Nx workspace configuration
