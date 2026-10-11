#!/usr/bin/env bash
# Builds the generated code that type checks, lint and tests read: contracts typechain + dist,
# kleros-app dist, kleros-sdk lib, web generatedGitInfo.json and web graphql/wagmi codegen.
# Usage: scripts/ci-prepare.sh [deployment]   (web deployment, default devnet; graphql codegen needs network)
set -euo pipefail

deployment="${1:-devnet}"
cd "$(git rev-parse --show-toplevel)"

yarn workspace @kleros/kleros-v2-contracts build
yarn workspace @kleros/kleros-v2-contracts build:cjs
yarn workspace @kleros/kleros-v2-contracts build:esm
yarn workspace @kleros/kleros-v2-contracts build:types
yarn workspace @kleros/kleros-app build
yarn workspace @kleros/kleros-sdk build
(cd web && node scripts/gitInfo.js && scripts/runEnv.sh "$deployment" 'yarn generate')
