#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $SCRIPT_DIR/..

VERSION=$(sentry-cli releases propose-version)
sentry-cli releases new "$VERSION"
sentry-cli releases set-commits "$VERSION" --auto

rm -rf dist/
yarn build
sentry-cli releases files $VERSION upload-sourcemaps dist/

sentry-cli releases finalize "$VERSION"

cd -
