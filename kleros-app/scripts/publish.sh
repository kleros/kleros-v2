#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

#--------------------------------------
# Error handling
#--------------------------------------

set -Ee
function _catch {
    # Don't propagate to outer shell
    exit 0
}
function _finally {
    # TODO: rollback version bump
    rm -rf $SCRIPT_DIR/../dist
}
trap _catch ERR
trap _finally EXIT

#--------------------------------------

# Check if any tracked files are currently changed, ignoring untracked files
if [ -n "$(git status --porcelain -uno)" ]; then
    echo "Error: There are uncommitted changes in tracked files. Please commit or stash them before publishing."
    exit 1
fi

yarn version $1

version=$(cat package.json | jq -r .version)
echo "Publishing version $version"

git add package.json
git commit -m "chore(kleros-app): release @kleros/kleros-app@$version"
git tag "@kleros/kleros-app@$version" -m "@kleros/kleros-app@$version"
git push
git push --tags

yarn clean
yarn build
yarn npm login
yarn npm publish
