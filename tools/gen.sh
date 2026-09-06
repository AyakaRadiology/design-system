#!/usr/bin/env bash
#
# Regenerate dist/ from src/.
#
# dist/ is a committed build output: consumers install this package straight
# from a git tag, with no publish step and no `prepare` script, so a dist/ that
# lags src/ ships behaviour nobody wrote. CI runs this and then diffs, which is
# why the emit must be a pure function of the sources (see tsconfig.build.json
# for the host-independence settings that make the diff meaningful).
#
# Run from anywhere: paths resolve against the repository root.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v bun >/dev/null 2>&1; then
    echo "tools/gen.sh needs \`bun\` on PATH and cannot find it." >&2
    exit 127
fi

echo "==> compiling src/ to dist/"
# Wipe first: tsc leaves behind the output of a file that has since been
# deleted or renamed, and a stale .js in dist/ is invisible to `git diff` once
# it has been committed.
rm -rf dist
bun run build

echo "==> done"
