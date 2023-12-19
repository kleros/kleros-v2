#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function generate() { #deploymentDir #explorerUrl
    deploymentDir=$1
    explorerUrl=$2
    for f in $(ls -1 $deploymentDir/*.json 2>/dev/null | grep -v "PNK.json\|MetaEvidence_*\|CREATE3Factory.json\|_Proxy.json\|_Implementation.json" | sort); do
        contractName=$(basename $f .json)
        address=$(cat $f | jq -r .address)
        implementation=$(cat $f | jq -r .implementation)
        
        if [ "$implementation" != "null" ]; then
            echo "- [$contractName: proxy]($explorerUrl$address), [implementation]($explorerUrl$implementation)"
        else
            echo "- [$contractName]($explorerUrl$address)"
        fi
    done
}

echo "### Official Testnet"
echo "#### Chiado"
echo
generate "$SCRIPT_DIR/../deployments/chiado" "https://gnosis-chiado.blockscout.com/address/"
echo
echo "#### Sepolia"
echo
generate "$SCRIPT_DIR/../deployments/goerli" "https://goerli.etherscan.io/address/"
echo
echo "#### Arbitrum Sepolia"
echo
echo "- [PNK](https://goerli.arbiscan.io/token/0x3483FA1b87792cd5BE4100822C4eCEC8D3E531ee)"
generate "$SCRIPT_DIR/../deployments/arbitrumSepolia" "https://goerli.arbiscan.io/address/"
echo
echo "### Devnet"
echo "#### Chiado"
echo
generate "$SCRIPT_DIR/../deployments/chiadoDevnet" "https://gnosis-chiado.blockscout.com/address/"
echo
echo "#### Sepolia"
echo
generate "$SCRIPT_DIR/../deployments/goerliDevnet" "https://goerli.etherscan.io/address/"
echo
echo "#### Arbitrum Sepolia"
echo
echo "- [PNK](https://goerli.arbiscan.io/token/0x3483FA1b87792cd5BE4100822C4eCEC8D3E531ee)"
generate "$SCRIPT_DIR/../deployments/arbitrumSepoliaDevnet" "https://goerli.arbiscan.io/address/"