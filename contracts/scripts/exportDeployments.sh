#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function exportJson() { #network
    network=$1
    echo "Exporting deployments for $network"
    yarn deploy --tags nop --network $network --export deployments/deployments.${network}.json --no-compile
}

exportJson arbitrumSepolia
exportJson arbitrumSepoliaDevnet
exportJson sepolia
exportJson sepoliaDevnet
exportJson chiado
exportJson chiadoDevnet
exportJson arbitrum
exportJson mainnet
