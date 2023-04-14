#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function generate() { #deploymentDir #explorerUrl
    deploymentDir=$1
    explorerUrl=$2
    for f in $(ls -1 $deploymentDir/*.json | grep -v "PNK.json\|MetaEvidence_*"); do
        contractName=$(basename $f .json)
        address=$(cat $f | jq -r .address)
        echo "- [$contractName]($explorerUrl$address)"
    done
}

echo "#### Chiado"
echo
generate "$SCRIPT_DIR/../deployments/chiado" "https://blockscout.com/gnosis/chiado/address/"
echo
echo "#### Goerli"
echo
echo "- [PNK](https://goerli.etherscan.io/token/0xA3B02bA6E10F55fb177637917B1b472da0110CcC)"
generate "$SCRIPT_DIR/../deployments/goerli" "https://goerli.etherscan.io/address/"
echo
echo "#### Arbitrum Goerli"
echo
echo "- [PNK](https://goerli.arbiscan.io/token/0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610/token-transfers)"
generate "$SCRIPT_DIR/../deployments/arbitrumGoerli" "https://goerli.arbiscan.io/address/"