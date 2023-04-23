#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Remove unsupported natspec tags
# Known issue: https://github.com/foundry-rs/foundry/issues/4118
for tag in authors reviewers auditors bounties deployments tools
do
    find $SCRIPT_DIR/../src/ -type f -name '*.sol' | xargs sed -i.bak "/^.*@$tag.*$/d"
done

echo "Use 'git restore src/ && rm src/**/*.sol.bak' to revert the changes"


