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

echo "#### Goerli"
echo
echo "- [PNK](https://goerli.etherscan.io/token/0xA3B02bA6E10F55fb177637917B1b472da0110CcC)"
generate "$SCRIPT_DIR/../deployments/goerli" "https://goerli.etherscan.io/address/"
echo
echo "#### Arbitrum Goerli (Nitro)"
echo
echo "- [PNK](https://goerli-rollup-explorer.arbitrum.io/token/0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610/token-transfers)"
generate "$SCRIPT_DIR/../deployments/arbitrumGoerli" "https://goerli-rollup-explorer.arbitrum.io/address/"
echo
echo
echo "#### Rinkeby - DEPRECATED"
echo
echo "- [PNK](https://rinkeby.etherscan.io/token/0x14aba1fa8a31a8649e8098ad067b739cc5708f30)"
generate "$SCRIPT_DIR/../deployments/rinkeby" "https://rinkeby.etherscan.io/address/"
echo
echo "#### Arbitrum Rinkeby (Classic) - DEPRECATED"
echo
echo "- [PNK](https://testnet.arbiscan.io/token/0x364530164a2338cdba211f72c1438eb811b5c639)"
generate "$SCRIPT_DIR/../deployments/arbitrumRinkeby" "https://testnet.arbiscan.io/address/"