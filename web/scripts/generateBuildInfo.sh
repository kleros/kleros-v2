#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

jq -n --arg primeUri "$DEPLOY_PRIME_URL" --arg uri "$URL" --arg deployUri "$DEPLOY_URL" '{ netlifyDeployPrimeUri: $primeUri, netlifyUri: $uri, netlifyDeployUri: $deployUri }' > src/generatedNetlifyInfo.json
node $SCRIPT_DIR/gitInfo.js