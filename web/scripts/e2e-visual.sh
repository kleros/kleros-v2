#!/usr/bin/env bash
# Runs the @visual Playwright project inside the official Linux image, where the committed baselines were rendered.
# Usage: scripts/e2e-visual.sh [--update-snapshots] [playwright args...]   (needs docker; builds dist-e2e if missing)
set -euo pipefail

cd "$(dirname "$0")/.."
[ -d dist-e2e ] || yarn e2e:build

root="$(git rev-parse --show-toplevel)"
version="$(node -p 'require("@playwright/test/package.json").version')"

# The container serves the prebuilt bundle itself: node_modules hold host-platform binaries, so vite cannot run there.
docker run --rm --ipc=host -v "$root":/repo -w /repo/web "mcr.microsoft.com/playwright:v${version}-noble" \
  bash -c 'python3 -m http.server 4173 -d dist-e2e >/dev/null 2>&1 &
    until python3 -c "import urllib.request; urllib.request.urlopen(\"http://localhost:4173\")" 2>/dev/null; do sleep 0.2; done
    npx playwright test --project=visual "$@"' -- "$@"
