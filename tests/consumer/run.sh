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
#   * The packed app is served to Playwright's Chromium in five fresh browser
#     contexts, so React/Radix event ordering is tested outside jsdom.
#
# The app's dependencies are linked out of this repository's own node_modules,
# so the only package installed into the probe is the package under test.
# Playwright downloads its pinned Chromium build when the local cache is empty.
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
for dependency in react react-dom vite @vitejs/plugin-react @tailwindcss/vite tailwindcss playwright; do
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

export PLAYWRIGHT_BROWSERS_PATH="$ROOT/node_modules/.cache/ms-playwright"
echo "==> ensuring Playwright's Chromium build is installed"
node "$ROOT/node_modules/playwright/cli.js" install --only-shell chromium

# mktemp honors the caller's TMPDIR locally and on CI.
WORK="$(mktemp -d)"
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
for required in dist/react/index.js dist/lint/cli.js dist/color.js bin/design-lint.js tokens/schema.json voices/biomonitor.css tailwind.css; do
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
    --x-hero-readout: 7rem;
}

/* The documented hero readout (docs/ui-rules.md): the size is a project token
 * and a class, because an arbitrary value in a component is an L3 finding.
 * The empty scale is tuned here too — a schema token, set in the theme file,
 * which is the path design-lint allows and therefore the one worth proving. */
.hero-readout {
    font-size: var(--x-hero-readout);
    --numeric-empty-scale: 0.35;
}

.numeric-geometry-probe {
    font-size: var(--x-hero-readout);
}

.retone-dialog {
    --dialog-surface: var(--bg-muted);
}

@theme inline {
    --color-x-needle-tracker: var(--x-needle-tracker);
}
CSS

cat >"$APP/src/components/Status.tsx" <<'TSX'
import { Glass, BuildStamp, Button, Dialog, DialogBody, DialogContent, DialogTrigger, Numeric, Panel, RadioGroup, StatusPill, Switch, TooltipProvider } from "@ayaka/design-system/react";
import { useState } from "react";

export function Status() {
    const [source, setSource] = useState("one");

    return (
        <Panel title="Tracker" actions={<Button size="sm">Reset</Button>}>
            <Glass data-testid="glass" className="p-4">Floating material</Glass>
            <TooltipProvider>
                <StatusPill status="success" detail="Receiving samples">connected</StatusPill>
            </TooltipProvider>
            <Numeric unit="ms">42</Numeric>
            <Numeric unit="°">42</Numeric>
            <Numeric unit="%">42</Numeric>
            <Numeric value={null} unit="mm" precision={1} reservedChars={6} />
            <Numeric value={900} unit="ms" reservedUnitChars={3} />
            <div className="hero-readout">
                <Numeric value={null} unit="mm" precision={1} reservedChars={5} />
            </div>
            <div className="numeric-geometry-probe" data-numeric-probe="live">
                <Numeric value={123} reservedChars={5} />
            </div>
            <div className="numeric-geometry-probe" data-numeric-probe="empty">
                <Numeric value={null} reservedChars={5} emptyAlign="start" />
            </div>
            <Numeric value={null} unit="mm" precision={1} reservedChars={5} showUnitWhenEmpty />
            <Numeric value={null} unit="mm" reservedUnitChars={3} reserveUnitSlotWhenEmpty />
            <BuildStamp name="Probe" describe="v0.1.2-3-gabc" buildTime="2026-09-07T00:00:00Z" />
            <BuildStamp
                name="Probe"
                describe="v0.1.2-3-gabc"
                buildTime="2026-09-07T00:00:00Z"
                formatBuildTime={(iso) => `built ${iso.slice(0, 10)}`}
            />
            <BuildStamp
                name="Probe"
                describe="v0.1.2-3-gabc"
                buildTime="2026-09-07T00:00:00Z"
                onClick={() => {}}
                aria-label="Pin full build SHA"
            />
            <Switch aria-label="Follow live" />
            <output data-radio-value>{source}</output>
            <RadioGroup
                aria-label="Source"
                value={source}
                onValueChange={setSource}
                options={[
                    { value: "one", label: "One" },
                    { value: "two", label: "Two" },
                    { value: "three", label: "Three" },
                ]}
            />
            <Dialog>
                <DialogTrigger>Open re-toned dialog</DialogTrigger>
                <DialogContent title="Help" className="retone-dialog">
                    <DialogBody data-dialog-body>
                        {Array.from({ length: 100 }, (_, index) => (
                            <p key={index}>Scrollable help line {index + 1}</p>
                        ))}
                    </DialogBody>
                </DialogContent>
            </Dialog>
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
assert_css "viewport-bound dialog" 'max-height: *calc\(100svh'
assert_css "dialog scroll body" '\.overflow-y-auto'
assert_css "dialog surface default" -- '--dialog-surface: *var\(--bg-elevated\)'
assert_css "voice scrollbar" 'scrollbar-color: *var\(--text-secondary\) var\(--dialog-surface\)'
assert_css "touch scroll cue" '\.ds-dialog-body:{1,2}after'
assert_css "status motion guard" 'animation: *none;'
assert_css "unit case protection" '\.normal-case'
assert_css "build stamp plate" 'background-color: *var\(--bg-elevated\)'
assert_css "radio indicator" '\.size-2'
assert_css "numeric slot class" '\.ds-numeric-slot'
assert_css "numeric slot width" 'calc\(var\(--ds-numeric-chars\) \* 1ch\)'
assert_css "quiet empty readout" 'max\(calc\(var\(--numeric-empty-scale\) \* 1em\), *var\(--text-xs\)\)'
assert_css "the app's tuned empty scale" -- '--numeric-empty-scale: *0?\.35'

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

# The colour subpath, resolved by a stock `node` THROUGH the exports map — the
# only check that an entry point a consumer imports by name actually resolves.
# Importing dist/color.js by path would pass with the map broken.
echo "==> the colour subpath resolves and computes"
cat >"$APP/color-probe.mjs" <<'JS'
import assert from "node:assert/strict";
import { contrastRatio, oklchToSrgb, parseOklch } from "@ayaka/design-system/color";

const teal = parseOklch("oklch(0.66 0.12 178)");
assert.deepEqual(teal, { l: 0.66, c: 0.12, h: 178, alpha: 1 });

const rgb = oklchToSrgb(teal.l, teal.c, teal.h);
assert.equal(rgb.length, 3);
for (const channel of rgb) assert.ok(channel >= 0 && channel <= 1, `channel out of range: ${channel}`);

// White on black is 21:1 by definition; if the maths crossed the package
// boundary intact, this is exact.
assert.ok(Math.abs(contrastRatio("oklch(1 0 0)", "oklch(0 0 0)") - 21) < 0.01);
console.log("ok");
JS
if [ "$(cd "$APP" && node color-probe.mjs)" != "ok" ]; then
    echo "::error::@ayaka/design-system/color did not resolve or did not compute correctly from the packed tarball." >&2
    exit 1
fi
echo "    @ayaka/design-system/color resolves through the exports map"

echo "==> RadioGroup keyboard selection in five fresh Chromium contexts"
cat >"$APP/radio-browser-probe.mjs" <<'JS'
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { preview } from "vite";

const TRIALS = 5;
const server = await preview({
    root: ".",
    logLevel: "silent",
    preview: { host: "127.0.0.1", port: 0 },
});
const address = server.httpServer.address();
if (!address || typeof address === "string") throw new Error("Vite preview did not bind TCP");

const browser = await chromium.launch({ headless: true });
try {
    for (let trial = 1; trial <= TRIALS; trial += 1) {
        const context = await browser.newContext();
        try {
            const page = await context.newPage();
            await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: "networkidle" });
            const value = page.locator("[data-radio-value]");
            const one = page.getByRole("radio", { name: "One" });
            const two = page.getByRole("radio", { name: "Two" });
            const three = page.getByRole("radio", { name: "Three" });

            await one.focus();
            await one.press("ArrowDown");
            assert.equal(await value.textContent(), "two", `trial ${trial}: ArrowDown`);
            assert.equal(await two.getAttribute("aria-checked"), "true");

            await two.press("ArrowRight");
            assert.equal(await value.textContent(), "three", `trial ${trial}: ArrowRight`);
            await three.press("ArrowDown");
            assert.equal(
                await value.textContent(),
                "one",
                `trial ${trial}: ArrowDown after ArrowRight`,
            );

            await three.focus();
            await three.press(" ");
            assert.equal(await value.textContent(), "three", `trial ${trial}: Space`);
            assert.equal(await three.getAttribute("aria-checked"), "true");
        } finally {
            await context.close();
        }
    }
    console.log(`${TRIALS}/${TRIALS} fresh Chromium contexts selected on every key`);
} finally {
    await browser.close();
    await server.close();
}
JS
(cd "$APP" && node radio-browser-probe.mjs)

echo "==> Numeric empty glyph geometry in Chromium"
cat >"$APP/numeric-browser-probe.mjs" <<'JS'
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { preview } from "vite";

const EMPTY_SCALE = 0.25;
const MINIMUM_EMPTY_PX = 12;
const READOUT_SIZES_PX = [16, 24, 112];
const MAXIMUM_HEIGHT_ERROR_PX = 1;
const MAXIMUM_CENTRE_ERROR_PX = 2;

const server = await preview({
    root: ".",
    logLevel: "silent",
    preview: { host: "127.0.0.1", port: 0 },
});
const address = server.httpServer.address();
if (!address || typeof address === "string") throw new Error("Vite preview did not bind TCP");

const browser = await chromium.launch({ headless: true });
try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: "networkidle" });
    for (const readoutSize of READOUT_SIZES_PX) {
        const boxes = await page.evaluate((fontSize) => {
            const liveHost = document.querySelector('[data-numeric-probe="live"]');
            const emptyHost = document.querySelector('[data-numeric-probe="empty"]');
            const liveSlot = liveHost?.querySelector('[data-slot="value"]');
            const glyph = emptyHost?.querySelector(".ds-numeric-empty");
            if (!(liveHost instanceof HTMLElement) || !(emptyHost instanceof HTMLElement)) {
                throw new Error("Numeric probe hosts are missing");
            }
            if (!(liveSlot instanceof HTMLElement) || !(glyph instanceof HTMLElement)) {
                throw new Error("Numeric probe value or glyph is missing");
            }
            liveHost.style.fontSize = `${fontSize}px`;
            emptyHost.style.fontSize = `${fontSize}px`;
            const liveRange = document.createRange();
            liveRange.selectNodeContents(liveSlot);
            const digits = liveRange.getBoundingClientRect();
            const empty = glyph.getBoundingClientRect();
            const liveHostBox = liveHost.getBoundingClientRect();
            const emptyHostBox = emptyHost.getBoundingClientRect();
            return {
                digits: {
                    height: digits.height,
                    centre: digits.top - liveHostBox.top + digits.height / 2,
                },
                glyph: {
                    height: empty.height,
                    centre: empty.top - emptyHostBox.top + empty.height / 2,
                },
            };
        }, readoutSize);
        const requestedSize = Math.max(readoutSize * EMPTY_SCALE, MINIMUM_EMPTY_PX);
        const centreError = Math.abs(boxes.glyph.centre - boxes.digits.centre);
        console.log(
            `${readoutSize}px readout: digits ${boxes.digits.height}px high; glyph ${boxes.glyph.height}px high; centres differ by ${centreError}px`,
        );
        assert.ok(
            boxes.glyph.height <= requestedSize + MAXIMUM_HEIGHT_ERROR_PX,
            `${readoutSize}px readout: ${boxes.glyph.height}px glyph exceeds ${requestedSize}px requested size`,
        );
        assert.ok(
            centreError <= MAXIMUM_CENTRE_ERROR_PX,
            `${readoutSize}px readout: glyph centre differs from digits by ${centreError}px`,
        );
    }
} finally {
    await browser.close();
    await server.close();
}
JS
(cd "$APP" && node numeric-browser-probe.mjs)

echo "==> DialogBody fade matches a re-toned DialogContent screenshot pixel"
cat >"$APP/dialog-browser-probe.mjs" <<'JS'
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { preview } from "vite";

const server = await preview({
    root: ".",
    logLevel: "silent",
    preview: { host: "127.0.0.1", port: 0 },
});
const address = server.httpServer.address();
if (!address || typeof address === "string") throw new Error("Vite preview did not bind TCP");

const browser = await chromium.launch({ headless: true });
try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Open re-toned dialog" }).click();
    const content = page.getByRole("dialog", { name: "Help" });
    const body = page.locator("[data-dialog-body]");
    const contentBox = await content.boundingBox();
    const bodyBox = await body.boundingBox();
    if (!contentBox || !bodyBox) throw new Error("Dialog probe geometry is missing");

    const surfacePixel = await page.screenshot({
        clip: {
            x: Math.floor(contentBox.x + contentBox.width - 24),
            y: Math.floor(contentBox.y + 8),
            width: 1,
            height: 1,
        },
    });
    const fadeBottomPixel = await page.screenshot({
        clip: {
            x: Math.floor(bodyBox.x + bodyBox.width / 2),
            y: Math.floor(bodyBox.y + bodyBox.height - 1),
            width: 1,
            height: 1,
        },
    });
    assert.deepEqual(
        fadeBottomPixel,
        surfacePixel,
        "the fade's bottom screenshot pixel must equal the DialogContent background",
    );
    console.log("fade bottom pixel equals the re-toned dialog surface");
} finally {
    await browser.close();
    await server.close();
}
JS
(cd "$APP" && node dialog-browser-probe.mjs)

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


echo "==> verifying packed Glass material and transparency fallbacks in Chromium"
cat >"$APP/glass-browser-probe.mjs" <<'JS'
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { preview } from "vite";
const server = await preview({ root: ".", logLevel: "silent", preview: { host: "127.0.0.1", port: 0 } });
const address = server.httpServer.address();
if (!address || typeof address === "string") throw new Error("Vite preview did not bind TCP");
const browser = await chromium.launch({ headless: true });
try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: "networkidle" });
    const glass = page.getByTestId("glass");
    const material = () => glass.evaluate((element) => {
        const style = getComputedStyle(element);
        const probe = document.createElement("div");
        probe.style.background = "var(--bg-elevated)";
        element.append(probe);
        const opaque = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return { background: style.backgroundColor, opaque, blur: style.backdropFilter,
            radius: style.borderRadius, contain: style.contain, willChange: style.willChange,
            edge: getComputedStyle(element, "::before").maskComposite };
    });
    const normal = await material();
    assert.match(normal.blur, /blur\(10px\) saturate\(1.08\)/);
    assert.equal(normal.radius, "8px");
    assert.equal(normal.contain, "paint");
    assert.equal(normal.willChange, "auto");
    assert.ok(normal.edge.split(", ").every((operation) => operation === "exclude"));
    // Computed mask properties alone cannot prove the edge survived contain: paint.
    // Compare rendered pixels with and without the pseudo-element on the same surface.
    const withEdge = (await glass.screenshot()).toString("base64");
    const hideEdge = await page.addStyleTag({ content: ".ds-glass::before { visibility: hidden; }" });
    const withoutEdge = (await glass.screenshot()).toString("base64");
    await hideEdge.evaluate((element) => element.remove());
    const edgePixels = await page.evaluate(async ([withEdge, withoutEdge]) => {
        const pixels = async (source) => {
            const image = new Image();
            image.src = `data:image/png;base64,${source}`;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("No canvas context for glass edge probe");
            context.drawImage(image, 0, 0);
            return context.getImageData(0, 0, image.width, image.height);
        };
        const edge = await pixels(withEdge);
        const plain = await pixels(withoutEdge);
        const difference = (x, y) => {
            const i = (y * edge.width + x) * 4;
            return edge.data[i] + edge.data[i + 1] + edge.data[i + 2]
                - plain.data[i] - plain.data[i + 1] - plain.data[i + 2];
        };
        const CORNER_CLEARANCE = 16;
        const EDGE_INSET = 1;
        return {
            highlight: difference(CORNER_CLEARANCE, EDGE_INSET),
            shade: difference(edge.width - CORNER_CLEARANCE, edge.height - EDGE_INSET - 1),
            interior: difference(CORNER_CLEARANCE, CORNER_CLEARANCE),
        };
    }, [withEdge, withoutEdge]);
    assert.ok(edgePixels.highlight > 0, "top-left edge must visibly lighten the surface");
    assert.ok(edgePixels.shade < 0, "bottom-right edge must visibly shade the surface");
    assert.equal(edgePixels.interior, 0, "gradient must not cover the fill or text");
    await glass.evaluate((element) => element.classList.add("fixed"));
    assert.equal(await glass.evaluate((element) => getComputedStyle(element).position), "fixed");
    await glass.evaluate((element) => element.classList.remove("fixed"));
    await glass.evaluate((element) => element.dataset.glass = "strong");
    assert.notEqual((await material()).background, normal.background);
    await page.evaluate(() => document.documentElement.dataset.glass = "off");
    let off = await material();
    assert.equal(off.blur, "none");
    assert.equal(off.background, off.opaque);
    await page.evaluate(() => delete document.documentElement.dataset.glass);
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
    assert.equal(await page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches), true);
    off = await material();
    assert.equal(off.blur, "none");
    assert.equal(off.background, off.opaque);
    await session.send("Emulation.setEmulatedMedia", { features: [] });
    await glass.evaluate((element) => element.dataset.glass = "off");
    off = await material();
    assert.equal(off.blur, "none");
    assert.equal(off.background, off.opaque);
    console.log("Glass: packed CSS, 10px blur, edge, containment, strong fill, ancestor/local off and reduced transparency PASS");
} finally {
    await browser.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
}
JS
(cd "$APP" && node glass-browser-probe.mjs)
