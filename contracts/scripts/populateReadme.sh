#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

if [ ! -x "$(command -v envsubst)" ]; then
    echo >&2 "error: envsubst not installed"
    exit 1
fi

deployments="$($SCRIPT_DIR/generateDeploymentsMarkdown.sh)" \
  envsubst '$deployments' \
  < README.md.template \
  > README.md
