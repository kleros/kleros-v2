#!/usr/bin/env bash

shopt -s extglob

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

#--------------------------------------
# Error handling
#--------------------------------------

set -Ee
function _catch {
    # Don't propagate to outer shell
    exit 0
}
function _finally {
    # TODO: rollback version bump
    rm -rf $SCRIPT_DIR/../dist
}
trap _catch ERR
trap _finally EXIT

#--------------------------------------

if [[ "$PWD" != */contracts ]]; then
    echo "Error: This script must be run from the contracts directory"
    exit 1
fi

# Bump the version
yarn version $1

# Recompile the contracts
yarn clean
yarn build

# Rebuild the typechain without mocks
rm -rf artifacts/src/**/*[mM]ock*
find artifacts/src -name "*.dbg.json" -type f -delete
rm -rf typechain-types
yarn typechain --out-dir typechain-types --glob 'artifacts/src/**/*.json' --target ethers-v6 --node16-modules

# Generate the viem artifacts
yarn viem:generate-devnet
yarn viem:generate-testnet
yarn viem:generate-mainnet

# Generate the Hardhat artifacts
yarn export:devnet
yarn export:testnet
yarn export:mainnet

# Build the dist
rm -rf dist
mkdir dist
yarn build:all

# Copy the README and contracts
cp -pr README.md src/ dist/

# Remove unwanted files
rm -rf dist/config
rm -rf dist/deploy
rm -rf dist/scripts
rm -rf dist/test
rm -rf dist/**/mock
rm -rf dist/**/*Mock*
rm -rf dist/hardhat.config*
rm -rf dist/deployments/**/solcInputs
rm -rf dist/deployments/localhost
rm -rf dist/deployments/hardhat
rm -rf dist/deployments/hardhat.viem.ts
jq 'del(.scripts.prepare)' package.json >dist/package.json

# Publish the package
cd dist
npm publish
cd -
