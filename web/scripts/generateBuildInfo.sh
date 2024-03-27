#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

jq -n --arg uri "$DEPLOY_PRIME_URL" '{ netlifyUri: $uri }' > src/generatedNetlifyInfo.json
node $SCRIPT_DIR/gitInfo.js