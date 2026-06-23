#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
SUBGRAPH_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

resolve_deployments_dir() {
  local network="$1"
  local monorepo_dir="$SUBGRAPH_DIR/../contracts/deployments/$network"
  local package_dirs=(
    "$SUBGRAPH_DIR/node_modules/@kleros/kleros-v2-contracts/deployments/$network"
    "$SUBGRAPH_DIR/../node_modules/@kleros/kleros-v2-contracts/deployments/$network"
  )

  # Local Hardhat networks are not published in the npm package.
  if [[ "$network" == "localhost" || "$network" == "hardhat" ]]; then
    if [[ ! -d "$monorepo_dir" ]]; then
      echo "Deployments directory not found for $network: $monorepo_dir" >&2
      exit 1
    fi
    echo "$monorepo_dir"
    return
  fi

  for package_dir in "${package_dirs[@]}"; do
    if [[ -d "$package_dir" ]]; then
      echo "$package_dir"
      return
    fi
  done

  echo "Deployments not found in @kleros/kleros-v2-contracts for network '$network'." >&2
  echo "Checked: ${package_dirs[*]}" >&2
  echo "Install the contracts package and ensure deployments/$network/ is present." >&2
  exit 1
}

sync_network() {
  local network="$1"
  local source_dir
  source_dir="$(resolve_deployments_dir "$network")"
  local target_dir="$SUBGRAPH_DIR/abis/$network"

  echo "Syncing ABIs for $network from $source_dir"
  rm -rf "$target_dir"
  mkdir -p "$target_dir"

  shopt -s nullglob
  local json_files=("$source_dir"/*.json)
  shopt -u nullglob

  if [[ ${#json_files[@]} -eq 0 ]]; then
    echo "No deployment artifacts found in $source_dir" >&2
    exit 1
  fi

  cp "${json_files[@]}" "$target_dir/"
}

if [[ $# -lt 1 ]]; then
  echo "Usage: $(basename "$0") <hardhatNetwork> [<hardhatNetwork> ...]" >&2
  exit 1
fi

for network in "$@"; do
  sync_network "$network"
done
