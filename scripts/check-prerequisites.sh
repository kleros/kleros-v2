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

require docker
require docker-compose
require jq
require yq
require volta

exit $status
