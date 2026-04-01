#!/bin/bash
# Manual test script for dxw CLI commands
# Run: chmod +x test-cli.sh && ./test-cli.sh
#
# Uses a temporary DXW_HOME so your real ~/.dxw is not affected.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Set up isolated test environment
export DXW_HOME="${SCRIPT_DIR}/.dxw-test"
echo "=== Using DXW_HOME=${DXW_HOME} ==="
rm -rf "$DXW_HOME"
mkdir -p "$DXW_HOME/hub" "$DXW_HOME/plugins" "$DXW_HOME/logs"

# Create a fake hub with a cli-plugins.json
cd "$DXW_HOME/hub"
git init -q
cat > cli-plugins.json <<'EOF'
{
  "plugins": [
    "@aspect-lang/cli-plugin",
    "@dxworks/voyenv"
  ]
}
EOF
git add . && git commit -q -m "init"
cd "$SCRIPT_DIR"

echo ""
echo "=== Building CLI ==="
pnpm build

echo ""
echo "=== Linking CLI globally ==="
cd packages/cli && npm link && cd "$SCRIPT_DIR"

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
echo "=== Installing Plugins ==="
echo "$ dxw plugin install @dxworks/insider"
dxw plugin install @dxworks/insider || echo "(plugin install insider failed)"

echo ""
echo "$ dxw plugin install @dxworks/depminer"
dxw plugin install @dxworks/depminer || echo "(plugin install depminer failed)"

echo ""
echo "$ dxw plugin install @dxworks/inspector-git"
dxw plugin install @dxworks/inspector-git || echo "(plugin install inspector-git failed)"

echo ""
echo "=== Verifying Plugin Commands ==="
echo "$ dxw insider --help"
dxw insider --help || echo "(insider command not available)"

echo ""
echo "$ dxw depminer --help"
dxw depminer --help || echo "(depminer command not available)"

echo ""
echo "$ dxw iglog --help"
dxw iglog --help || echo "(iglog command not available)"

echo ""
echo "=== Testing Hub Commands ==="
echo "$ dxw hub --help"
dxw hub --help

echo ""
echo "=== Testing Plugin List with Available Flag ==="
echo "$ dxw plugin list -a"
dxw plugin list -a || echo "(Expected: may fail if plugins in hub are not published to npm)"

echo ""
echo "=== All tests completed! ==="
echo ""
echo "Test environment: ${DXW_HOME}"
echo "To clean up: rm -rf ${DXW_HOME}"
echo ""
echo "Additional manual tests (run with DXW_HOME=${DXW_HOME}):"
echo "  dxw plugin install <plugin-name>    # Install a plugin"
echo "  dxw plugin install -a               # Install all plugins"
echo "  dxw plugin update                   # Update plugins"
echo "  dxw plugin update -l                # Update to latest"
echo "  dxw plugin uninstall <plugin-name>  # Remove a plugin"
echo "  dxw hub refresh                     # Re-clone hub"
