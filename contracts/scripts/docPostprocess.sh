#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Forge doc assumes that the code is in the top-level folder. 
# We need to add contracts/ to the path
find $SCRIPT_DIR/../dist -type f \( -name "*.md" -o -name "*.html" \) \
  | xargs sed -i.bak 's|\(github.com/kleros/kleros-v2/.*\)\(/src\)|\1/contracts\2|g'

