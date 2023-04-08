#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $SCRIPT_DIR/..

version="court-v2@v$(cat package.json | jq -r .version)-$(git rev-parse --short HEAD)"
sentry-cli releases new "$version"
sentry-cli releases set-commits "$version" --auto

rm -rf dist/
yarn build
sentry-cli releases files $version upload-sourcemaps dist/

sentry-cli releases finalize "$version"

cd -
