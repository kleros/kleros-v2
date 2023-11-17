#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function update() #hardhatNetwork #graphNetwork #dataSourceIndex #contract
{
    local hardhatNetwork="$1"
    local graphNetwork="$2"
    local dataSourceIndex="$3"
    local contract="$4"
    local artifact="$SCRIPT_DIR/../../contracts/deployments/$hardhatNetwork/$contract.json"

    # Set the address
    address=$(cat "$artifact" | jq '.address')
    yq -i ".dataSources[$dataSourceIndex].source.address=$address" "$SCRIPT_DIR"/../subgraph.yaml
    
    # Set the start block
    blockNumber="$(cat "$artifact" | jq '.receipt.blockNumber')"
    yq -i ".dataSources[$dataSourceIndex].source.startBlock=$blockNumber" "$SCRIPT_DIR"/../subgraph.yaml

    # Set the Graph network
    graphNetwork=$graphNetwork yq -i  ".dataSources[$dataSourceIndex].network=env(graphNetwork)" "$SCRIPT_DIR"/../subgraph.yaml
    
    # Set the ABIs path for this Hardhat network
    abiIndex=0
    for f in $(yq e .dataSources[$dataSourceIndex].mapping.abis[].file subgraph.yaml -o json -I 0 | jq -sr '.[]')
    do
        f2=$(echo $f | sed "s|\(.*\/deployments\/\).*\/|\1$hardhatNetwork\/|")
        yq -i ".dataSources[$dataSourceIndex].mapping.abis[$abiIndex].file=\"$f2\"" "$SCRIPT_DIR"/../subgraph.yaml
        (( ++abiIndex ))
    done
}

# as per ../contracts/hardhat.config.js
hardhatNetwork=${1:-arbitrumSepolia}

# as per https://thegraph.com/docs/en/developing/supported-networks/
graphNetwork=${2:-arbitrum\-sepolia}
i=0

# backup
cp "$SCRIPT_DIR"/../subgraph.yaml "$SCRIPT_DIR"/../subgraph.yaml.bak.$(date +%s)

for contract in $(yq .dataSources[].name "$SCRIPT_DIR"/../subgraph.yaml)
do
    update $hardhatNetwork $graphNetwork $i $contract
    (( ++i ))
done
