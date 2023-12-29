#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cmdPrefix="$1"
cmdPostfix="$2"
if [ -z "$cmdPrefix" ]
then
    echo "Usage: $(basename $0) <cmdPrefix> [<cmdPostfix>]"
    exit 1
fi

for subgraph in core drt
do
    echo "Running for $subgraph"
    yarn "${cmdPrefix}:${subgraph}${cmdPostfix:+:}${cmdPostfix}"
done
