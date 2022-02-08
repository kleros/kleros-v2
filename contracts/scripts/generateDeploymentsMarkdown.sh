#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function generate() { #deploymentDir #explorerUrl
    deploymentDir=$1
    explorerUrl=$2
    for f in $(ls -1 $deploymentDir/*.json); do
        contractName=$(basename $f .json)
        address=$(cat $f | jq -r .address)
        echo "- [$contractName]($explorerUrl$address)"
    done
}

echo Rinkeby
generate "$SCRIPT_DIR/../deployments/rinkeby" "https://rinkeby.etherscan.io/address/"
echo
echo Arbitrum Rinkeby
generate "$SCRIPT_DIR/../deployments/arbitrumRinkeby" "https://testnet.arbiscan.io/address/"