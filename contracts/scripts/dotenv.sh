#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

varKey=$1

if [ -z "$varKey" ]; then
  echo "Env variable name not provided. Exiting..." >&2
  exit 1
fi

node -e "
  require('dotenv').config({ path: '"$SCRIPT_DIR"/../.env' })
  console.log(process.env.$varKey)
" | sed 1d
