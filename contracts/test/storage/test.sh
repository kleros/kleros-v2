#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

changed=0
for contractDotFile in $(ls -1 $SCRIPT_DIR/*.dot | grep -v -- -old.dot)
do
    contract=$(basename $contractDotFile .dot)
    contractDotFileOld=${contractDotFile::-4}-old.dot

    echo "Checking storage change of $contract"
    [ -f "$contractDotFile" ] && mv "$contractDotFile" "$contractDotFileOld"
    yarn sol2uml storage ./ -c "$contract" -o "$contractDotFile" -f dot
    diff "$contractDotFileOld" "$contractDotFile"
    if [[ $? != "0" ]]
    then
        changed=1
    fi
done

exit $changed