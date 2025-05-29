#! /usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

declare -A rpcUrls
rpcUrls["arbitrum"]=$(mesc url arbitrum_alchemy)
rpcUrls["arbitrumSepolia"]=$(mesc url arbitrumSepolia_alchemy)
rpcUrls["arbitrumSepoliaDevnet"]=$(mesc url arbitrumSepolia_alchemy)

for c in arbitrum arbitrumSepolia arbitrumSepoliaDevnet; do
    echo "$c"
    for f in "$SCRIPT_DIR"/../deployments/"$c"/*_Proxy.json; do
        address=$(jq -r .address "$f")
        block=$(jq -r .receipt.blockNumber "$f")
        basename "$f"
        results=$(cast logs --from-block "$block" --to-block latest 0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2 --address "$address" --rpc-url "${rpcUrls[$c]}" --json | jq -r .[].data)
        for result in $results; do
            cast --to-dec "$result"
        done
        echo
    done
    echo "--------------------------------"
done
