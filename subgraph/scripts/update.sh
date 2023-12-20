#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function update() #hardhatNetwork #graphNetwork #subgraphConfig #dataSourceIndex #contract
{
    local hardhatNetwork="$1"
    local graphNetwork="$2"
    local subgraphConfig="$3"
    local dataSourceIndex="$4"
    local contract="$5"
    local artifact="$SCRIPT_DIR/../../contracts/deployments/$hardhatNetwork/$contract.json"

    # Set the address
    address=$(cat "$artifact" | jq '.address')
    yq -i ".dataSources[$dataSourceIndex].source.address=$address" "$subgraphConfig"
    
    # Set the start block
    blockNumber="$(cat "$artifact" | jq '.receipt.blockNumber')"
    yq -i ".dataSources[$dataSourceIndex].source.startBlock=$blockNumber" "$subgraphConfig"

    # Set the Graph network
    graphNetwork=$graphNetwork yq -i  ".dataSources[$dataSourceIndex].network=env(graphNetwork)" "$subgraphConfig"
    
    # Set the ABIs path for this Hardhat network
    abiIndex=0
    for f in $(yq e .dataSources[$dataSourceIndex].mapping.abis[].file "$subgraphConfig" -o json -I 0 | jq -sr '.[]')
    do
        f2=$(echo $f | sed "s|\(.*\/deployments\/\).*\/|\1$hardhatNetwork\/|")
        yq -i ".dataSources[$dataSourceIndex].mapping.abis[$abiIndex].file=\"$f2\"" "$subgraphConfig"
        (( ++abiIndex ))
    done
}

# as per ../contracts/hardhat.config.js
hardhatNetwork=${1:-arbitrumSepolia}

# as per https://thegraph.com/docs/en/developing/supported-networks/
graphNetwork=${2:-arbitrum\-sepolia}

subgraphConfig="$SCRIPT_DIR/../${3:-core\/subgraph.yaml}"
echo "Updating $subgraphConfig"

# backup
cp "$subgraphConfig" "$subgraphConfig.bak.$(date +%s)"

i=0
for contract in $(yq .dataSources[].name "$subgraphConfig")
do
    update $hardhatNetwork $graphNetwork "$subgraphConfig" $i $contract
    (( ++i ))
done
