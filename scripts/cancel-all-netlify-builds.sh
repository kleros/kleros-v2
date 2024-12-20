#!/usr/bin/env bash

function cancelSiteDeploy() #siteId
{
    local siteId=$1
    readarray -t builds < <(netlify api listSiteDeploys -d '{ "site_id": "'$siteId'", "state": "new"}' | jq --compact-output '.[]')
    for build in "${builds[@]}"
    do
        local name=$(jq -r .name <<< $build)
        local branch=$(jq -r .branch <<< $build)
        if ! [[ "$branch" =~ ^dependabot/ || "$branch" =~ ^renovate/ ]]; then
            continue;
        fi
        echo "Cancelling build for $name $branch"
        netlify api cancelSiteDeploy -d '{ "deploy_id": "'$(jq -r .id <<< $build)'"}' > /dev/null
    done
}

# netlify api listSites | jq '. | map([.name, .id])'
sites=(
  # v2Testnet
  "86d94ae8-f655-46a4-a859-d68696173f3a"
  # v2DevtoolsTestnet  
  "7b25b1a8-5fd4-41f7-8fd0-7fe4202229fb"
  # v2Uni
  "085e1305-e434-4d36-91a4-88e8cbc3aa46"
  # v2Neo
  "46f40014-ff00-4a9a-a1a2-4fefeeb1606a"
  # v2DevtoolsNeo
  "45cc81df-58a8-46cb-902f-1ccd3314ec70"
  # v2ContractsSite
  "dd8bc215-e054-407f-92ef-d61511720928"
)

for site in "${sites[@]}"; do
  cancelSiteDeploy $site
done
