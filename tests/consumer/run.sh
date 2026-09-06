#!/usr/bin/env bash
#
# The consumer smoke test.
#
# Every other suite in this repository runs against the SOURCE, so not one of
# them can see a broken `exports` map, a `files` list that forgot `dist/`, or a
# voice whose relative `@import` resolves in the working tree and nowhere else.
# This one packs the tarball a consumer's `bun install` of the git dependency
# actually materialises, and builds a real app against it.
#
# What it checks, and why in this shape:
#
#   * `bun pm pack`, then extract — not a `file:` dependency on the working
#     tree. A file: dep is a symlink to the whole repo, so it resolves paths
#     that `files` excludes, and a dist/ missing from `files` would pass.
#   * A real `vite build`, so the CSS is compiled by Tailwind through the
#     package's `exports` map: `@import "@ayaka/design-system/voices/..."`
#     resolving is the half of the contract no unit test touches.
#   * The built CSS is asserted on its CONTENT, not merely on building. A
#     stylesheet that emitted no `bg-bg` rule has technically built. The
#     assertions are written to survive the minifier's normalisation of colour
#     values (lightningcss rewrites `oklch(0.2 …)` to `oklch(20% …)`), so they
#     pin the shape of the contract rather than the spelling of one number.
#   * `design-lint` is run FROM THE TARBALL, by a stock `node`, on the app's
#     own source — which is how a consumer runs it in CI. It has to pass a
#     compliant app and then fail the same app with one colour literal added,
#     because a gate that only ever passes is indistinguishable from no gate.
#
# No network: every dependency is linked out of this repository's own
# node_modules, so the only thing installed is the package under test.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

for prerequisite in node bun tar; do
    if ! command -v "$prerequisite" >/dev/null 2>&1; then
        echo "tests/consumer/run.sh needs \`$prerequisite\` on PATH and cannot find it." >&2
        exit 127
    fi
done

# The probe app is built out of THIS repository's node_modules, so every
# package it needs has to be a declared devDependency here — not merely present
# on disk. Those two came apart once: a `bun add` was reverted by a later `git
# checkout`, the packages stayed installed locally, this script passed, and CI
# failed on `bun install --frozen-lockfile` with the package missing. Checking
# package.json rather than the directory is what makes a local run mean what a
# CI run means.
for dependency in react react-dom vite @vitejs/plugin-react @tailwindcss/vite tailwindcss; do
    if ! node -e "
        const pkg = require('$ROOT/package.json');
        const declared = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
        process.exit(declared['$dependency'] ? 0 : 1);
    "; then
        echo "::error::the probe app needs '$dependency', which is not declared in $ROOT/package.json. It may still be installed locally from an earlier \`bun add\`; CI installs with --frozen-lockfile and will not have it." >&2
        exit 1
    fi
    if [ ! -e "$ROOT/node_modules/$dependency" ]; then
        echo "::error::'$dependency' is declared but not installed. Run \`bun install\`." >&2
        exit 1
    fi
done

# $RUNNER_TEMP on a GitHub runner; the job's own scratch directory otherwise.
SCRATCH="${RUNNER_TEMP:-/home/harry/.claude/jobs/a2d2f00c/tmp}"
[ -d "$SCRATCH" ] || SCRATCH="${TMPDIR:-/tmp}"
WORK="$(mktemp -d -p "$SCRATCH" design-lint-consumer-XXXXXX)"
trap 'rm -rf "$WORK"' EXIT

echo "==> packing the tarball a consumer would install"
bun pm pack --destination "$WORK" >/dev/null
TARBALL="$(find "$WORK" -maxdepth 1 -name '*.tgz' -print -quit)"
if [ -z "$TARBALL" ]; then
    echo "::error::bun pm pack produced no tarball." >&2
    exit 1
fi

APP="$WORK/app"
PACKAGE="$APP/node_modules/@ayaka/design-system"
mkdir -p "$PACKAGE"
# The tarball's single top-level directory is `package/`; strip it.
tar -xzf "$TARBALL" -C "$PACKAGE" --strip-components=1

# The four files a consumer reaches for by name. Checked before anything is
# built, so a `files` list that dropped one fails with that sentence rather
# than with a resolution error thirty lines further down.
for required in dist/react/index.js dist/lint/cli.js bin/design-lint.js tokens/schema.json voices/biomonitor.css tailwind.css; do
    if [ ! -f "$PACKAGE/$required" ]; then
        echo "::error::the packed tarball has no $required — check \"files\" in package.json." >&2
        exit 1
    fi
done

echo "==> linking the app's other dependencies out of this repository"
# Symlinks, not copies. Node and Vite both resolve through them by realpath, so
# each linked package finds its own transitive dependencies back in this
# repository's node_modules, and nothing has to be downloaded.
for entry in "$ROOT"/node_modules/* "$ROOT"/node_modules/.bin; do
    name="$(basename "$entry")"
    [ "$name" = "@ayaka" ] && continue
    ln -sfn "$entry" "$APP/node_modules/$name"
done

cat >"$APP/package.json" <<'JSON'
{
    "name": "design-system-consumer-probe",
    "private": true,
    "version": "0.0.0",
    "type": "module"
}
JSON

cat >"$APP/vite.config.ts" <<'TS'
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [react(), tailwindcss()], build: { minify: false } });
TS

mkdir -p "$APP/src/styles" "$APP/src/components"

# Exactly the wiring the spec's §3.3 and the README tell a consumer to write.
cat >"$APP/src/styles/theme.css" <<'CSS'
@import "tailwindcss";
@import "@ayaka/design-system/voices/biomonitor.css";

:root {
    --accent: oklch(0.8 0.12 195);
    --x-needle-tracker: var(--chart-1);
}

@theme inline {
    --color-x-needle-tracker: var(--x-needle-tracker);
}
CSS

cat >"$APP/src/components/Status.tsx" <<'TSX'
import { Button, Numeric, Panel, StatusPill } from "@ayaka/design-system/react";

export function Status() {
    return (
        <Panel title="Tracker" actions={<Button size="sm">Reset</Button>}>
            <StatusPill status="success">connected</StatusPill>
            <Numeric unit="ms">42</Numeric>
        </Panel>
    );
}
TSX

cat >"$APP/src/main.tsx" <<'TSX'
import { createRoot } from "react-dom/client";
import { Status } from "./components/Status.js";
import "./styles/theme.css";

const host = document.getElementById("root");
if (host) createRoot(host).render(<Status />);
TSX

cat >"$APP/index.html" <<'HTML'
<!doctype html>
<html lang="en">
    <head><meta charset="utf-8" /><title>probe</title></head>
    <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
HTML

cat >"$APP/design-lint.json" <<'JSON'
{
    "include": ["src/**/*.{ts,tsx,css}"],
    "exclude": [],
    "themeFile": "src/styles/theme.css",
    "rules": { "L1": "error", "L2": "error", "L3": "error", "L4": "error", "L5": "error", "L6": "error", "L7": "error" },
    "allow": []
}
JSON

echo "==> building the app against the packed package"
(cd "$APP" && node node_modules/vite/bin/vite.js build --logLevel warn)

CSS_OUT="$(find "$APP/dist/assets" -name '*.css' -print -quit)"
if [ -z "$CSS_OUT" ]; then
    echo "::error::vite build emitted no stylesheet." >&2
    exit 1
fi

# Content, not merely existence. A stylesheet with none of these has built
# successfully and shipped nothing.
assert_css() {
    local label="$1" pattern="$2"
    if ! grep -qE -- "$pattern" "$CSS_OUT"; then
        echo "::error::the built stylesheet has no $label — it did not survive the package boundary." >&2
        exit 1
    fi
}

assert_css "voice surface value"      -- '--bg: *oklch\('
assert_css "Tailwind utility mapping" 'background-color: *var\(--bg\)'
assert_css "--x- extension token"     -- '--x-needle-tracker'

# The classes only the PRIMITIVES use. Tailwind's automatic source detection
# skips node_modules, so without the `@source` in tailwind.css a consumer gets
# the components and none of their styling — an unstyled control, with nothing
# anywhere to say why. This is the assertion that holds that line in place.
assert_css "the primitives' own utilities (is @source still in tailwind.css?)" '\.tabular-nums'
assert_css "the primitives' own utilities (is @source still in tailwind.css?)" '\.rounded-full'

# The consumer's override has to WIN, not merely be present: the voice sets
# --accent on hue 178 and theme.css re-sets it on 195, so the last declaration
# in the sheet is the one that decides what the app looks like.
LAST_ACCENT="$(grep -oE -- '--accent: *oklch\([^)]*\)' "$CSS_OUT" | tail -1)"
if ! printf '%s' "$LAST_ACCENT" | grep -q '195'; then
    echo "::error::the consumer's --accent override did not win; the last declaration is '$LAST_ACCENT'." >&2
    exit 1
fi
echo "    the voice, the utility mapping, the primitives' classes and the --x- extension all reached the built CSS"
echo "    the consumer's override wins: $LAST_ACCENT"

echo "==> the gate, run from the tarball by a stock node, on a compliant app"
if ! (cd "$APP" && node node_modules/@ayaka/design-system/bin/design-lint.js --config design-lint.json); then
    echo "::error::design-lint failed an app that follows the documented wiring." >&2
    exit 1
fi

echo "==> the same app, with one colour literal added"
printf '\n.legacy { color: #ffffff; }\n' >>"$APP/src/components/legacy.css"
set +e
(cd "$APP" && node node_modules/@ayaka/design-system/bin/design-lint.js --config design-lint.json >"$WORK/lint.out" 2>&1)
STATUS=$?
set -e
if [ "$STATUS" -ne 1 ]; then
    echo "::error::design-lint exited $STATUS on an app with a colour literal in it; expected 1. A gate that only ever passes is indistinguishable from no gate." >&2
    cat "$WORK/lint.out" >&2
    exit 1
fi
if ! grep -q 'L1 error' "$WORK/lint.out"; then
    echo "::error::design-lint exited 1 but reported no L1 finding:" >&2
    cat "$WORK/lint.out" >&2
    exit 1
fi
echo "    $(grep -c 'L1 error' "$WORK/lint.out") L1 finding(s), exit 1 as expected"

echo "==> a consumer can install this package, build with it, and be gated by it"
