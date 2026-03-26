# DXWorks CLI

The DXWorks CLI (`dxw`) is a command-line tool for managing DXWorks plugins and tools. It provides a plugin-based architecture that allows extending functionality through installable packages.

## Overview

This is an Nx monorepo containing the following packages:

| Package           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `@dxworks/cli`    | Main CLI application with plugin and hub commands        |
| `@dxworks/common` | Shared utilities (logging, downloads, git, compression)  |
| `@dxworks/voyenv` | Voyager environment CLI for managing instrument releases |

## DXW CLI Commands

The `dxw` CLI provides the following commands:

### Plugin Commands

| Command                             | Aliases         | Description                                                      |
| ----------------------------------- | --------------- | ---------------------------------------------------------------- |
| `dxw plugin list`                   | `ls`            | List installed plugins. Use `-a` to show all available plugins   |
| `dxw plugin install <plugins...>`   | `i`, `add`      | Install plugins. Use `-a` for all, `-f` to force unknown plugins |
| `dxw plugin update [plugins...]`    | `upgrade`, `up` | Update plugins. Use `-l` for latest versions                     |
| `dxw plugin outdated`               | -               | List outdated plugins                                            |
| `dxw plugin uninstall <plugins...>` | `remove`, `rm`  | Uninstall plugins                                                |
| `dxw plugin link [path]`            | `ln`            | Link a local project as a plugin                                 |

### Hub Commands

| Command           | Aliases                | Description                     |
| ----------------- | ---------------------- | ------------------------------- |
| `dxw hub update`  | `pull`, `fetch`, `get` | Update dxworks-hub data         |
| `dxw hub refresh` | `reset`, `rs`          | Remove and re-clone dxworks-hub |

---

## Running the CLI Locally

```bash
# Build the CLI
pnpm build

# Run directly
node packages/cli/dist/index.js --help

# Or link globally for development
cd packages/cli && npm link
dxw --help
```

---

## How to Add New Commands

To add a new command to the CLI:

1. **Create the command file** in `packages/cli/src/commands/<group>/<command>.ts`
2. **Export a Commander Command instance** with name, description, options, and action
3. **Register in the group index file** (e.g., `packages/cli/src/commands/plugin/index.ts`)
4. **If creating a new group**, register it in `packages/cli/src/index.ts`

### Example Command

```typescript
// packages/cli/src/commands/plugin/example.ts
import { Command } from 'commander';

export const pluginExample = new Command()
  .name('example')
  .alias('ex') // Optional alias
  .description('An example command')
  .argument('[name]', 'Optional argument') // Use <name> for required
  .option('-f, --flag', 'A boolean flag', false)
  .action(async (name: string | undefined, options: { flag: boolean }) => {
    console.log(`Hello ${name ?? 'world'}!`);
    if (options.flag) {
      console.log('Flag was set');
    }
  });
```

Then register it in the group index:

```typescript
// packages/cli/src/commands/plugin/index.ts
import { pluginExample } from './example.js';

export const pluginCommand = new Command()
  .name('plugin')
  .description('handles dxworks cli plugins')
  .addCommand(pluginExample); // Add new command here
```

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Common pnpm Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build all packages
pnpm test                 # Run all tests
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Run tests with coverage report
pnpm lint                 # Check for lint errors
pnpm lint:fix             # Auto-fix lint errors
pnpm format               # Format code with Prettier
```

### Package-Specific Commands

```bash
pnpm nx build cli         # Build only the CLI package
pnpm nx test common       # Test only the common package
pnpm nx lint voyenv       # Lint only the voyenv package
```

## Adding a New Library/Package

To add a new library to the workspace:

```bash
# Create a publishable library
npx nx g @nx/js:lib packages/my-lib --publishable --importPath=@dxworks/my-lib

# Create an internal library (not published)
npx nx g @nx/js:lib packages/my-lib --importPath=@dxworks/my-lib
```

After generating:

1. Update the `package.json` with appropriate dependencies
2. Configure exports in `package.json` if needed
3. Add the package to workspace dependencies where it's used

---

## Nx Workspace

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

This workspace is built with [Nx](https://nx.dev). Run `npx nx graph` to visually explore the project structure.

## Generate a library

```sh
npx nx g @nx/js:lib packages/pkg1 --publishable --importPath=@my-org/pkg1
```

## Run tasks

To build the library use:

```sh
npx nx build pkg1
```

To run any task with Nx use:

```sh
npx nx <target> <project-name>
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Versioning and releasing

To version and release the library use

```
npx nx release
```

Pass `--dry-run` to see what would happen without actually releasing the library.

[Learn more about Nx release &raquo;](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Keep TypeScript project references up to date

Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` or `require` statements). This sync is automatically done when running tasks such as `build` or `typecheck`, which require updated references to function correctly.

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
npx nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
