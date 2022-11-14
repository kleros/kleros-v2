#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function update() #file #dataSourceIndex
{
    local f="$1"
    local dataSourceIndex="$2"
    
    address=$(cat $f | jq '.address')
    yq -i  ".dataSources[$dataSourceIndex].source.address=$address" $SCRIPT_DIR/../subgraph.yaml
    
    blockNumber="$(cat $f | jq '.receipt.blockNumber')"
    yq -i  ".dataSources[$dataSourceIndex].source.startBlock=$blockNumber" $SCRIPT_DIR/../subgraph.yaml
}

update "$SCRIPT_DIR/../../contracts/deployments/arbitrumGoerli/KlerosCore.json" 0
update "$SCRIPT_DIR/../../contracts/deployments/arbitrumGoerli/HomeGatewayToEthereum.json" 1
update "$SCRIPT_DIR/../../contracts/deployments/arbitrumGoerli/FastBridgeSender.json" 2
