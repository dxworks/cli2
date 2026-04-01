# @dxworks/cli

The main DXWorks command-line interface with built-in commands and a plugin system for extensibility.

## Installation

```bash
npm install -g @dxworks/cli
```

## CLI Commands

### Global Options

| Option          | Description                   |
| --------------- | ----------------------------- |
| `-v, --version` | Output the CLI version number |
| `-h, --help`    | Display help for any command  |

### `dxw plugin` - Plugin Management

Manages DXWorks CLI plugins.

| Command                             | Alias     | Description                       |
| ----------------------------------- | --------- | --------------------------------- |
| `dxw plugin list [options]`         | `ls`      | Lists installed plugins           |
| `dxw plugin install [plugins...]`   | `i`       | Installs DXWorks CLI plugins      |
| `dxw plugin update [plugins...]`    | `upgrade` | Updates DXWorks CLI plugins       |
| `dxw plugin outdated`               | -         | Lists outdated plugins            |
| `dxw plugin uninstall <plugins...>` | `remove`  | Uninstalls plugins                |
| `dxw plugin link [path]`            | `ln`      | Links a local project as a plugin |

**Examples:**

```bash
dxw plugin list                       # List installed plugins
dxw plugin list -a                    # List all available plugins
dxw plugin install @dxworks/depminer  # Install a plugin
dxw plugin update                     # Update all plugins
dxw plugin outdated                   # Check for outdated plugins
dxw plugin uninstall @dxworks/depminer  # Remove a plugin
```

### `dxw hub` - DXWorks Hub Management

Manages the local DXWorks Hub repository (located at `~/.dxw/hub`).

| Command           | Alias   | Description                           |
| ----------------- | ------- | ------------------------------------- |
| `dxw hub update`  | `pull`  | Updates the DXWorks Hub               |
| `dxw hub refresh` | `reset` | Removes and re-clones the DXWorks Hub |

**Examples:**

```bash
dxw hub update    # Pull latest changes
dxw hub refresh   # Fresh clone of the hub
```

### Plugin Commands

Plugin commands become available after installing the respective plugins via `dxw plugin install`. Run `dxw --help` to see all available commands including those from installed plugins.

#### `dxw depminer` - Dependency Analysis (from @dxworks/depminer)

Runs the Depminer tool for dependency analysis.

| Option                    | Description                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `-w, --working-directory` | Sets the working directory for Depminer (defaults to plugin install location; use flag to run in current directory) |

**Example:**

```bash
dxw depminer      # Run from default location
dxw depminer -w   # Run in current directory
```

#### `dxw insider` - Insider Analysis (from @dxworks/insider)

Runs Insider commands for code analysis.

**Example:**

```bash
dxw insider --help    # Show insider options
```

#### `dxw ig` - InspectorGit (from @dxworks/inspector-git)

Runs InspectorGit commands for Git repository analysis.

| Command        | Description                                      |
| -------------- | ------------------------------------------------ |
| `dxw ig iglog` | Extracts Iglog and gitlogs from Git repositories |
| `dxw ig chr`   | Processes iglogs and creates chronos size files  |

| Option                    | Description                            |
| ------------------------- | -------------------------------------- |
| `-V, --version`           | Output InspectorGit version number     |
| `-w, --working-directory` | Sets the working directory for results |

**Examples:**

```bash
dxw ig iglog    # Extract git logs
dxw ig chr      # Process iglogs
dxw ig -w       # Run in current directory
```

## Plugin System Architecture

The DXW CLI uses a plugin-based architecture that allows third-party packages to extend its functionality.

### How It Works

1. **Plugin Discovery**: On startup, the CLI reads `~/.dxw/plugins/package.json` to find installed plugins
2. **Command Loading**: For each plugin, it looks for `dxw.commands` in the plugin's `package.json`
3. **Command Registration**: Plugin commands are wrapped and registered with the main CLI

### Plugin Storage

Plugins are installed in the user's home directory:

```
~/.dxw/
  plugins/
    package.json          # Tracks installed plugins
    node_modules/         # Plugin packages
```

## Developing a DXW Plugin

### 1. Create Your Package

Create a new npm package with a Commander command:

```typescript
// src/commands/my-command.ts
import { Command } from 'commander';

export const myCommand = new Command('my-command')
  .description('Does something useful')
  .option('-f, --flag', 'An optional flag')
  .action((options) => {
    console.log('Hello from my plugin!');
  });
```

### 2. Declare Commands in package.json

Add a `dxw.commands` section to your `package.json`:

```json
{
  "name": "@my-org/dxw-plugin-example",
  "version": "1.0.0",
  "main": "dist/index.js",
  "dxw": {
    "commands": [
      {
        "command": "myCommand",
        "file": "dist/commands/my-command.js"
      }
    ]
  }
}
```

The `dxw.commands` array contains objects with:

- `command`: The exported name of the Commander Command instance
- `file`: Path to the file containing the command (relative to package root)

### 3. Publish and Install

```bash
# Publish your plugin
npm publish

# Users install it via
dxw plugin install @my-org/dxw-plugin-example
```

### Plugin Command Requirements

Your exported command must be a valid Commander `Command` instance with:

- A `name()` method returning the command name
- A `description()` method returning the command description
- Optional: `options` array, `_actionHandler`, `_allowUnknownOption`, `_allowExcessArguments`

## Building

```bash
nx build cli
```

## Testing

```bash
nx test cli
```
