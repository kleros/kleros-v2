#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function exportJson() { #network
    network=$1
    echo "Exporting deployments for $network"
    yarn deploy --tags nop --network $network --export deployments.${network}.json --no-compile
}

exportJson arbitrumGoerli
exportJson goerli
exportJson chiado
exportJson arbitrum
exportJson mainnet
