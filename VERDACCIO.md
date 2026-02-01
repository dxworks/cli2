# Using Verdaccio for Local Package Development

Verdaccio is a lightweight private npm registry that allows you to publish and test packages locally without pushing to the public npm registry.

## Starting the Local Registry

Start Verdaccio using the Nx target:

```bash
pnpm nx local-registry
```

This starts Verdaccio on `http://localhost:4873` with the configuration from `.verdaccio/config.yml`.

## Configuration

The registry is configured with:

- **Storage**: `tmp/local-registry/storage` (gitignored)
- **Uplink**: Falls back to npmjs.org for packages not found locally
- **Access**: All users have full access (suitable for local development)
- **Max package size**: 50MB (to accommodate large packages)

## Publishing Packages to Local Registry

### 1. Point npm/pnpm to the local registry

For a single publish command:

```bash
npm publish --registry http://localhost:4873
```

Or set it temporarily for your shell session:

```bash
npm config set registry http://localhost:4873
```

### 2. Publish from another local repository

Navigate to your other project and publish:

```bash
cd /path/to/your/other-project

# Build the project first
npm run build

# Publish to local Verdaccio
npm publish --registry http://localhost:4873
```

For scoped packages (e.g., `@dxworks/plugin-name`):

```bash
npm publish --registry http://localhost:4873 --access public
```

### 3. Publish workspace packages from this monorepo

```bash
# Publish a specific package
cd packages/common
npm publish --registry http://localhost:4873

# Or publish all packages
pnpm nx run-many --target=publish --all -- --registry http://localhost:4873
```

## Installing Packages from Local Registry

### Using the CLI's plugin system

The DXW CLI installs plugins to `~/.dxw/plugins/`. To install from Verdaccio:

```bash
# Configure the CLI to use local registry
npm config set registry http://localhost:4873

# Then use the CLI to install plugins
dxw plugin install @dxworks/my-plugin
```

### Direct npm install

```bash
npm install @dxworks/my-plugin --registry http://localhost:4873
```

## Development Workflow

### Testing a plugin with the CLI

1. **Start Verdaccio** (in terminal 1):

   ```bash
   pnpm nx local-registry
   ```

2. **Publish your plugin** (in terminal 2):

   ```bash
   cd /path/to/my-plugin
   npm run build
   npm publish --registry http://localhost:4873
   ```

3. **Install and test with CLI** (in terminal 2):

   ```bash
   # Point npm to local registry
   npm config set registry http://localhost:4873

   # Install the plugin
   dxw plugin install @dxworks/my-plugin

   # Test it
   dxw my-plugin-command --help
   ```

4. **Reset registry when done**:
   ```bash
   npm config delete registry
   ```

### Iterative development

When making changes to a plugin:

```bash
# Bump version in package.json (Verdaccio won't overwrite existing versions)
npm version patch

# Rebuild and republish
npm run build
npm publish --registry http://localhost:4873

# Update in CLI
dxw plugin update @dxworks/my-plugin
```

## Viewing Published Packages

Open http://localhost:4873 in your browser to see all published packages and their versions.

## Clearing the Registry

To start fresh, delete the storage directory:

```bash
rm -rf tmp/local-registry/storage
```

## Troubleshooting

### "Package already exists" error

Verdaccio doesn't allow republishing the same version. Either:

- Bump the version number: `npm version patch`
- Delete the package from storage: `rm -rf tmp/local-registry/storage/@scope/package-name`

### Connection refused

Make sure Verdaccio is running: `pnpm nx local-registry`

### Package not found (falling back to npmjs)

Check that:

1. The package was published successfully
2. You're using the correct registry URL
3. The package name matches exactly (including scope)

### Large package upload fails

The config allows up to 50MB. For larger packages, increase `max_body_size` in `.verdaccio/config.yml`.
