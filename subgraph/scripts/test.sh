#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
SUBGRAPH_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MATCHSTICK_VERSION="0.6.0"

# The committed manifests reference ../abis/<hardhatNetwork>/, which is gitignored.
manifest_network() {
  sed -n 's|.*file: \.\./abis/\([A-Za-z0-9_-]*\)/.*|\1|p' "$1" | head -n 1
}

cd "$SUBGRAPH_DIR"

networks=$(printf '%s\n' "$(manifest_network core/subgraph.yaml)" "$(manifest_network dispute-template-registry/subgraph.yaml)" | sort -u)
# shellcheck disable=SC2086
./scripts/sync-abis.sh $networks

graph codegen --output-dir core/generated/ core/subgraph.yaml
graph codegen --output-dir dispute-template-registry/generated/ dispute-template-registry/subgraph.yaml

# -v skips the GitHub API "latest release" lookup; -r ignores stale compiled tests in tests/.bin.
graph test -v "$MATCHSTICK_VERSION" -r
(cd dispute-template-registry && graph test -v "$MATCHSTICK_VERSION" -r)
