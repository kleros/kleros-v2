#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

deployment="$1"
shift
commands="$*"

if [[ -z "$deployment" ]]; then
    echo "usage: $(basename "$0") <local|devnet|devnet-neo|devnet-university|testnet|mainnet-neo>"
    exit 1
fi

valid_deployments=("local" "devnet" "devnet-neo" "devnet-university" "testnet" "mainnet-neo")
if [[ ! " ${valid_deployments[*]} " =~ ${deployment} ]]; then
    echo "Invalid deployment option. Please choose either: ${valid_deployments[*]}."
    exit 1
fi

function sourceEnvFile() { #envFile
    local envFile="$1"
    if [ -f "$envFile" ]; then
        echo -e "${GREEN}✔${NC} $(basename "$envFile")"
        # shellcheck source=SCRIPTDIR/../.env.devnet
        . "$envFile"
    else
        echo -e "${RED}✖${NC} $(basename "$envFile")"
    fi
}

envFile="$SCRIPT_DIR/../.env.${deployment}"
sourceEnvFile "$envFile.public"
sourceEnvFile "$envFile"

eval "$commands"
