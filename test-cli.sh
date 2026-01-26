#!/bin/bash
# Manual test script for dxw CLI commands
# Run: chmod +x test-cli.sh && ./test-cli.sh

set -e

echo "=== Building CLI ==="
pnpm build

echo ""
echo "=== Linking CLI globally ==="
cd packages/cli && npm link && cd ../..

echo ""
echo "=== Testing Basic Commands ==="
echo "$ dxw --version"
dxw --version

echo ""
echo "$ dxw --help"
dxw --help

echo ""
echo "=== Testing Plugin Commands ==="
echo "$ dxw plugin --help"
dxw plugin --help

echo ""
echo "$ dxw plugin list"
dxw plugin list || echo "(Expected: may show 'No plugins installed' on first run)"

echo ""
echo "$ dxw plugin outdated"
dxw plugin outdated || echo "(Expected: may show nothing if no plugins installed)"

echo ""
echo "=== Testing Hub Commands ==="
echo "$ dxw hub --help"
dxw hub --help

echo ""
echo "$ dxw hub update"
dxw hub update

echo ""
echo "=== Testing Plugin List with Available Flag ==="
echo "$ dxw plugin list -a"
dxw plugin list -a

echo ""
echo "=== All tests completed! ==="
echo ""
echo "Additional manual tests you can run:"
echo "  dxw plugin install <plugin-name>    # Install a plugin"
echo "  dxw plugin install -a               # Install all plugins"
echo "  dxw plugin update                   # Update plugins"
echo "  dxw plugin update -l                # Update to latest"
echo "  dxw plugin uninstall <plugin-name>  # Remove a plugin"
echo "  dxw hub refresh                     # Re-clone hub"
