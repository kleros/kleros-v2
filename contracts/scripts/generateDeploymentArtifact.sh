#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [[ $# < 2 ]]
then
  echo "usage: $(basename $0) network address"
  exit 1
fi

network=$1
address=$2

# Limitation: proxy contracts will return the proxy's ABI, not its implementation's ABI.
# Workaround: query the address of the implementation, and manually change the address to the proxy's in the artifact.
# Example: WETH on Gnosis chain, https://gnosisscan.io/address/0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1#code

case $network in
gnosischain)
  url="https://api.gnosisscan.io"
  apiKey=$($SCRIPT_DIR/dotenv.sh GNOSISSCAN_API_KEY)
  ;;
chiado)
  # Warning: these are distinct instances!
  # https://blockscout.com/gnosis/chiado/api-docs
  # https://blockscout.chiadochain.net
  url="https://blockscout.com/gnosis/chiado"
  apiKey=""
  ;;
arbitrum)
  url="https://api.arbiscan.io"
  apiKey=$($SCRIPT_DIR/dotenv.sh ARBISCAN_API_KEY)
  ;;
arbitrumSepolia)
  url="https://api-sepolia.arbiscan.io"
  apiKey=$($SCRIPT_DIR/dotenv.sh ARBISCAN_API_KEY)
  ;;
mainnet)
  url="https://api.etherscan.io"
  apiKey=$($SCRIPT_DIR/dotenv.sh ETHERSCAN_API_KEY)
  ;;
sepolia)
  url="https://api-sepolia.etherscan.io"
  apiKey=$($SCRIPT_DIR/dotenv.sh ETHERSCAN_API_KEY)
  ;;
*)
  echo "error: unknown network $network"
  exit 1
esac

query="$url/api?module=contract&action=getabi&address=$address"
if [[ -n $apiKey ]]
then
  query="$query&apikey=$apiKey"
fi

result=$(curl -s "$query")
if [[ $(echo "$result" | jq -r .status) == 0 ]]
then
  echo "error: contract not verified or does not exist"
  abi="[]"
else
  abi=$(echo "$result" | jq -r .result)
fi

jq \
  --arg address "$address" \
  --argjson abi "$abi" \
  '{ "address": $address, "abi": $abi }' <<< '{}'


