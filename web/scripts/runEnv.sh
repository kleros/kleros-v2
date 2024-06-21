#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

deployment="$1"
shift
commands="$@"

if [[ -z "$deployment" ]]; then
    echo "usage: $(basename $0) <local|devnet|devnet-neo|devnet-university|testnet|mainnet-neo>"
    exit 1
fi

valid_deployments=("local" "devnet" "devnet-neo" "devnet-university" "testnet" "mainnet-neo")
if [[ ! " ${valid_deployments[@]} " =~ " ${deployment} " ]]; then
    echo "Invalid deployment option. Please choose either: ${valid_deployments[@]}."
    exit 1
fi

envFile="$SCRIPT_DIR/../.env.${deployment}"
[ -f "$envFile.public" ] && . $envFile.public
[ -f "$envFile" ] && . $envFile

$SCRIPT_DIR/generateBuildInfo.sh

eval "$commands"
