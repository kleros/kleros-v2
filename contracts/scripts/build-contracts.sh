#!/usr/bin/env bash
set -euo pipefail

mkdir -p contracts

for d in arbitration gateway governance kleros-v1 libraries proxy rng token utils; do
  rsync -a --delete --exclude='**/mock' --exclude='*Mock*' --exclude='*mock*' "src/$d/" "contracts/$d/"
done
