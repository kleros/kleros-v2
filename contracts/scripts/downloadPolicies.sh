#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function download() #policies
{
    for p in $(cat ${policies}.json | jq -r .[].uri)
    do 
        wget -P $SCRIPT_DIR/../config/$policies https://ipfs.kleros.io${p}
    done
}

download policies.v1.mainnet
download policies.v1.gnosischain
