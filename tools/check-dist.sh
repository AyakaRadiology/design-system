#!/usr/bin/env bash
#
# Fail if the committed dist/ drifted from src/.
#
# Two checks, because `git diff` alone cannot see the second one: a build that
# starts emitting a file nobody committed leaves that file untracked, and an
# untracked file has no diff.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! git diff --exit-code -- dist/; then
    echo "::error::dist/ is out of date with src/. Run \`bun run gen\` and commit the result. Never hand-edit a file under dist/ — the next build reverts it." >&2
    exit 1
fi

UNTRACKED="$(git ls-files --others --exclude-standard -- dist/)"
if [ -n "$UNTRACKED" ]; then
    echo "::error::tools/gen.sh produced files that are not committed:" >&2
    echo "$UNTRACKED" >&2
    exit 1
fi
