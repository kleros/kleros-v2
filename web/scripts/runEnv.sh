#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

deployment="$1"
shift
commands="$@"

if [[ -z "$deployment" ]]; then
    echo "usage: $(basename $0) <local|devnet|testnet|mainnet>"
    exit 1
fi

valid_deployments=("local" "devnet" "testnet" "mainnet")
if [[ ! " ${valid_deployments[@]} " =~ " ${deployment} " ]]; then
    echo "Invalid deployment option. Please choose either: ${valid_deployments[@]}."
    exit 1
fi

. $SCRIPT_DIR/../.env.${deployment}.public
. $SCRIPT_DIR/../.env.${deployment}
eval "$commands"
