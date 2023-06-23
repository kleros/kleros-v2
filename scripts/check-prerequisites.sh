#!/usr/bin/env bash

status=0

function require() #cmd
{
  local cmd=$1
  if [ ! -x "$(command -v $cmd)" ]; then
    >&2 echo "error: $cmd not installed"
    status=1
  fi
}

# for the NPM and toolchain version management
require volta

# for the local subgraph node
require docker
require docker-compose

# for some contracts utilities
require cast
require forge

# for the subgraph and contracts utilities
require jq
require yq

# for the local testing of Github Actions
require act

exit $status
