#! /usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

declare -A rpcUrls
rpcUrls["arbitrum"]=$(mesc url arbitrum_alchemy)
rpcUrls["arbitrumSepolia"]=$(mesc url arbitrumSepolia_alchemy)
rpcUrls["arbitrumSepoliaDevnet"]=$(mesc url arbitrumSepolia_alchemy)

# event Initialized(uint64 version);
eventTopic=0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2

for c in arbitrum arbitrumSepolia arbitrumSepoliaDevnet; do
    echo "--------------------------------"
    echo "$c"
    echo "--------------------------------"
    for f in "$SCRIPT_DIR"/../deployments/"$c"/*_Proxy.json; do
        address=$(jq -r .address "$f")
        block=$(jq -r .receipt.blockNumber "$f")
        basename "$f"
        results=$(cast logs --from-block "$block" --to-block latest $eventTopic --address "$address" --rpc-url "${rpcUrls[$c]}" --json | jq -r .[].data)
        initializer=$(cast --to-dec "$(echo "$results" | tail -n1)")
        version=$(cast call --rpc-url "${rpcUrls[$c]}" "$address" "version()(string)" --json 2>/dev/null | jq -r '.[0]')
        echo "$initializer" @v"$version"
        echo
    done
done
