#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

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

yarn version $1

yarn viem:generate-devnet
yarn viem:generate-testnet
yarn viem:generate-mainnet
yarn export:devnet
yarn export:testnet
yarn export:mainnet

mkdir dist
cp -pr README.md deployments src/ dist/ 
rm -rf dist/test
rm -rf dist/deployments/**/solcInputs
rm -rf dist/deployments/localhost
rm -rf dist/deployments/hardhat
rm -rf dist/deployments/hardhat.viem.ts
jq 'del(.scripts.prepare)' package.json > dist/package.json

cd dist
npm publish
cd -
