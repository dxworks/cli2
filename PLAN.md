# Migration Plan: cli-old → Modern Nx Workspace

## Overview

This document outlines the complete migration strategy from the legacy lerna-based CLI (cli-old) to a modern Nx workspace with updated libraries, simplified configuration, and comprehensive tests.

**Old Stack:**

- Lerna monorepo
- Jest testing
- Node 14/16
- ESLint v8
- Outdated dependencies

**New Stack:**

- Nx workspace with build caching
- Vitest for faster testing
- Node 20+ LTS
- ESLint v9 flat config
- Modern, up-to-date dependencies
- Strict TypeScript mode
- Pre-commit hooks with husky

---

## Commit Process

**IMPORTANT:** Before every commit, follow these steps:

1. Run tests: `pnpm test`
2. Run lint: `pnpm lint`
3. Fix any linting errors: `pnpm lint:fix` (if needed)
4. Commit changes

This ensures the pre-commit hooks won't fail and maintains code quality.

---

## Phase 0: New Project Setup

### Step 0.1: Initialize Nx Workspace

- Create fresh Nx workspace with TypeScript preset
- Choose Node 24 LTS
- Configure pnpm as package manager
- Set up basic workspace structure

### Step 0.2: Configure Project Structure

- Create 3 library packages matching old structure:
  - `packages/common` - Shared utilities
  - `packages/cli` - Main CLI application
  - `packages/voyenv` - Voyenv CLI application
- Configure build targets and dependencies in project.json files

### Step 0.3: Setup Modern Tooling

- Configure Vitest (modern, faster than Jest)
- Setup ESLint v9 with flat config
- Configure Prettier
- Setup TypeScript strict mode
- Add lint-staged and husky for pre-commit hooks

**Commit:** `chore: initialize nx workspace with base configuration`

---

## Phase 1: Common Utilities Package

### Step 1.1: Setup Logging Infrastructure

- Migrate `logging.ts` with winston or modern alternative (pino)
- Add tests for logger initialization
- Test file logging to `~/.dxw/logs/dxw.log`

**Commit:** `feat(common): add logging infrastructure with tests`

### Step 1.2: OS Detection Utilities

- Migrate `os-utils.ts`
- Add comprehensive tests for platform detection
- Test on current OS

**Commit:** `feat(common): add OS detection utilities with tests`

### Step 1.3: File & Download Utilities

- Migrate download functionality from `utils.ts`
- Update axios to latest version
- Add progress tracking with modern library
- Add tests with mock downloads

**Commit:** `feat(common): add file download utilities with progress tracking`

### Step 1.4: Compression Utilities

- Migrate `compress-utils.ts`
- Update to modern unzip library (or use node:zlib)
- Add tests with sample zip files

**Commit:** `feat(common): add compression utilities with tests`

### Step 1.5: Git & Hub Management

- Migrate `dxworks-hub.ts`
- Update isomorphic-git to latest
- Add Octokit v3+ for GitHub API
- Add tests with mocked Git operations

**Commit:** `feat(common): add git and hub management with tests`

### Step 1.6: Common Utilities

- Migrate remaining `utils.ts` functions
- Semver parsing, file size formatting, etc.
- Comprehensive unit tests

**Commit:** `feat(common): add utility functions with tests`

---

## Phase 2: Main CLI Package

### Step 2.1: CLI Framework Setup

- Setup commander.js (latest)
- Setup chalk (v5+ ESM) or modern alternative
- Create main entry point with shebang
- Add basic `--version` and `--help`
- Add integration test

**Commit:** `feat(cli): initialize CLI framework with basic commands`

### Step 2.2: NPM Wrapper Module

- Migrate `npm.ts` functionality
- Use modern npm programmatic API or execa for npm commands
- Add tests with mocked npm operations

**Commit:** `feat(cli): add npm wrapper module with tests`

### Step 2.3: Plugin System Foundation

- Migrate plugin utilities from `utils.ts`
- Setup `~/.dxw/plugins/` directory structure
- Add plugin discovery logic
- Add tests for plugin path resolution

**Commit:** `feat(cli): add plugin system foundation with tests`

### Step 2.4: Plugin List Command

- Migrate `commands/plugin/list.ts`
- Add emoji support
- Add tests for listing plugins

**Commit:** `feat(cli): add plugin list command with tests`

### Step 2.5: Plugin Install Command

- Migrate `commands/plugin/install.ts`
- Support `-a/--all` and `-f/--force` flags
- Add tests with mocked npm install

**Commit:** `feat(cli): add plugin install command with tests`

### Step 2.6: Plugin Update Command

- Migrate `commands/plugin/update.ts`
- Support `-l/--latest` flag
- Add tests

**Commit:** `feat(cli): add plugin update command with tests`

### Step 2.7: Plugin Outdated Command

- Migrate `commands/plugin/outdated.ts`
- Add tests

**Commit:** `feat(cli): add plugin outdated command with tests`

### Step 2.8: Plugin Uninstall Command

- Migrate `commands/plugin/uninstall.ts`
- Add tests

**Commit:** `feat(cli): add plugin uninstall command with tests`

### Step 2.9: Plugin Link Command

- Migrate `commands/plugin/link.ts`
- Add tests

**Commit:** `feat(cli): add plugin link command with tests`

### Step 2.10: Hub Update Command

- Migrate `commands/hub/update.ts`
- Add tests with mocked git operations

**Commit:** `feat(cli): add hub update command with tests`

### Step 2.11: Hub Refresh Command

- Migrate `commands/hub/refresh.ts`
- Add tests

**Commit:** `feat(cli): add hub refresh command with tests`

### Step 2.12: Dynamic Plugin Loading

- Migrate plugin command loading from `index.ts`
- Test with sample plugin

**Commit:** `feat(cli): add dynamic plugin loading with tests`

---

## Phase 3: Voyenv Package

### Step 3.1: Voyenv CLI Setup

- Setup voyenv entry point
- Add commander.js configuration
- Add basic tests

**Commit:** `feat(voyenv): initialize voyenv CLI framework`

### Step 3.2: Data Models

- Migrate TypeScript interfaces from `model/voyenv.ts`
- Add validation tests

**Commit:** `feat(voyenv): add data models with tests`

### Step 3.3: Constants & Utilities

- Migrate `constants.ts` and `utils.ts`
- Add tests

**Commit:** `feat(voyenv): add constants and utilities with tests`

### Step 3.4: Voyager Service

- Migrate `services/voyager.service.ts`
- Update to latest GitHub API patterns
- Add progress bar support
- Add tests with mocked downloads

**Commit:** `feat(voyenv): add voyager service with tests`

### Step 3.5: Instrument Service

- Migrate `services/instrument.service.ts`
- Add multi-progress bar support
- Add tests

**Commit:** `feat(voyenv): add instrument service with tests`

### Step 3.6: Init Command

- Migrate `commands/init.ts`
- Copy YAML template assets
- Add tests for all template variations

**Commit:** `feat(voyenv): add init command with tests`

### Step 3.7: Install Command

- Migrate `commands/install.ts`
- Add tests with mocked downloads

**Commit:** `feat(voyenv): add install command with tests`

### Step 3.8: Instruments Command

- Migrate `commands/instruments.ts`
- Add tests

**Commit:** `feat(voyenv): add instruments command with tests`

---

## Phase 4: Integration & Polish

### Step 4.1: End-to-End Tests

- Add E2E tests for full CLI workflows
- Test plugin installation and loading
- Test voyenv workflow

**Commit:** `test: add end-to-end tests for CLI workflows`

### Step 4.2: Documentation

- Add README.md for each package
- Add main README with migration notes
- Document breaking changes from old CLI

**Commit:** `docs: add comprehensive documentation`

### Step 4.3: CI/CD Setup

- Add GitHub Actions workflow
- Run tests, linting, build
- Setup semantic versioning

**Commit:** `ci: add GitHub Actions workflow`

### Step 4.4: Publishing Configuration

- Configure package.json for publishing
- Setup changesets for version management
- Add publish scripts

**Commit:** `chore: configure package publishing`

---

## Modern Library Choices

| Category        | Old          | New                       | Reason                          |
| --------------- | ------------ | ------------------------- | ------------------------------- |
| Testing         | jest         | vitest                    | Faster, native ESM, better DX   |
| Monorepo        | lerna        | nx                        | Better monorepo tools, caching  |
| Linting         | eslint v8    | eslint v9 flat config     | Modern, simpler config          |
| CLI Colors      | chalk v4     | chalk v5 or picocolors    | ESM-first, smaller              |
| Node Version    | Node 14/16   | Node 24+ LTS              | Latest features, performance    |
| Package Manager | npm v9       | npm v11+                  | Latest package manager          |
| Logging         | winston      | winston v3+ or pino       | Faster, smaller (pino optional) |
| Progress Bars   | cli-progress | cli-progress v3+ or ora   | Modern alternatives             |
| File Operations | unzipper     | node-stream-zip or native | Better maintained               |

---

## Key Improvements

1. **Simplified Config**: Single eslint.config.js, unified tsconfig
2. **Better Testing**: Vitest with built-in coverage, faster execution
3. **Modern Build**: Nx caching, parallel builds
4. **Type Safety**: Strict TypeScript mode enabled
5. **Code Quality**: Pre-commit hooks with husky + lint-staged
6. **Better DX**: Hot reload during development, faster builds
7. **Up-to-date Dependencies**: All libraries on latest stable versions
8. **ESM Support**: Native ESM modules where applicable

---

## Package Structure

```
dxw-cli/
├── packages/
│   ├── common/           # @dxworks/common
│   │   ├── src/
│   │   │   ├── logging.ts
│   │   │   ├── os-utils.ts
│   │   │   ├── utils.ts
│   │   │   ├── compress-utils.ts
│   │   │   ├── dxworks-hub.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── project.json
│   │
│   ├── cli/              # @dxworks/cli
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── npm.ts
│   │   │   ├── utils.ts
│   │   │   └── commands/
│   │   │       ├── plugin/
│   │   │       │   ├── list.ts
│   │   │       │   ├── install.ts
│   │   │       │   ├── update.ts
│   │   │       │   ├── outdated.ts
│   │   │       │   ├── uninstall.ts
│   │   │       │   └── link.ts
│   │   │       └── hub/
│   │   │           ├── update.ts
│   │   │           └── refresh.ts
│   │   ├── assets/
│   │   ├── tests/
│   │   └── project.json
│   │
│   └── voyenv/           # @dxworks/voyenv
│       ├── src/
│       │   ├── index.ts
│       │   ├── voyenv.ts
│       │   ├── constants.ts
│       │   ├── utils.ts
│       │   ├── model/
│       │   │   └── voyenv.ts
│       │   ├── commands/
│       │   │   ├── init.ts
│       │   │   ├── install.ts
│       │   │   └── instruments.ts
│       │   └── services/
│       │       ├── voyager.service.ts
│       │       └── instrument.service.ts
│       ├── assets/
│       ├── tests/
│       └── project.json
├── nx.json
├── package.json
├── tsconfig.base.json
├── eslint.config.js
├── vitest.config.ts
└── PLAN.md (this file)
```

---

## Testing Strategy

### Unit Tests

- Every utility function has corresponding test
- Mock external dependencies (npm, git, GitHub API, file system)
- Aim for >80% code coverage

### Integration Tests

- Test command execution with mocked dependencies
- Test plugin system with sample plugins
- Test file operations with temp directories

### End-to-End Tests

- Test full CLI workflows from command line
- Test actual plugin installation (in isolated environment)
- Test voyenv workflow with real YAML files

---

## Migration Notes

### Breaking Changes

- New directory structure (Nx workspace vs Lerna)
- Updated Node.js requirement (20+ vs 14/16)
- ESM modules where applicable
- Updated CLI argument parsing (if needed)

### Backward Compatibility

- Maintain same CLI commands and arguments
- Preserve `~/.dxw/` directory structure
- Keep same plugin discovery mechanism
- Maintain compatibility with existing plugins

---

## Timeline Estimate

**Total Estimated Commits: ~40 incremental commits**

- Phase 0: 1-2 hours
- Phase 1: 4-6 hours
- Phase 2: 8-10 hours
- Phase 3: 6-8 hours
- Phase 4: 4-6 hours

**Total: ~25-30 hours of development time**

---

## Next Steps

1. Review and approve this plan
2. Create a new Git repository or branch
3. Begin Phase 0: Initialize Nx workspace
4. Follow the plan step-by-step, making incremental commits
5. Test each phase before moving to the next
6. Document any deviations from the plan

---

_Plan created: 2025-11-07_
_Target completion: [To be determined]_
