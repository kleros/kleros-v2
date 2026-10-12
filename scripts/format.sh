#!/usr/bin/env bash
# Runs prettier over files git knows about (tracked + untracked-not-ignored), so every nested .gitignore applies.
# Usage: scripts/format.sh check|write
set -euo pipefail

mode="${1:-check}"
case "$mode" in
  check) flag="--check" ;;
  write) flag="--write" ;;
  *) echo "usage: $0 check|write" >&2; exit 2 ;;
esac

cd "$(git rev-parse --show-toplevel)"

# Prettier refuses symlinks passed explicitly; submodule paths would make it descend into vendored code.
git ls-files -z --cached --others --exclude-standard \
  | grep -zv -e '^contracts/lib/' -e '^\.claude/' \
  | while IFS= read -r -d '' f; do [ -L "$f" ] || printf '%s\0' "$f"; done \
  | xargs -0 yarn prettier "$flag" --ignore-unknown --log-level warn --config prettier-config/.prettierrc.js
