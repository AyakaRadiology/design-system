# Glass floating surfaces

Import a voice as usual, then `Glass` from `@ayaka/design-system/react`:

```tsx
<Glass role="region" aria-label="Inputs" className="p-4">
    <h2>Inputs</h2>
    <p className="text-text-secondary">Plan dimensions</p>
</Glass>
<Glass data-glass="strong" className="p-4">Dense imagery behind this panel</Glass>
```

The component renders a div and forwards its native attributes, events and React
19 ref. `.ds-glass` uses exactly the same CSS on semantic HTML, `Button`, `Toolbar`
or `DialogContent`; keep their keyboard behavior, focus management and semantics.
Remove the old fill, border, radius, blur and shadow declarations when migrating.
Glass owns material, not padding, dimensions, placement or animations. Its default
relative position is in the components layer, so fixed/absolute utilities still
work. The material rules themselves are unlayered so ordinary control utilities
cannot accidentally replace the shared material.

The 1px gradient edge lights the top-left and shades the bottom-right. A masked,
noninteractive `::before` draws only the edge; it never paints a second opaque
background behind the fill. Glass reserves this pseudo-element. Inner and outer
shadows come from one token; all floating elements share one radius. No noise is
shipped: avoiding another raster layer is preferable at these fill densities.

[Open the six-frame demo](glass-demo.html) with `bunx vite --host 127.0.0.1` from
the repo root, then visit `/docs/glass-demo.html`. It uses the actual voice files,
a local high-frequency city-block SVG image (no remote asset), light/dark base,
biomonitor, normal/strong material, and interactive transparency reduction.
The static demo exercises the CSS contract; the packed consumer smoke also
renders the React primitive in Chromium.

## Transparency and GPU budget

The target budget is the Surface ARM Windows GPU: 10px blur by default, never
more than 12px in a shipped voice, and slight 1.08 saturation. `contain: paint`
bounds repainting. It also clips descendants and establishes a containing block:
keep menus/tooltips portaled, allow padding for focus rings, and apply Glass to
flat floating chrome rather than a preserve-3d scene or a full-screen canvas.
Avoid nested blur surfaces and full-screen blur. Hardware frame-time and Windows
WebView2 validation still belong to the consumer follow-up; Chromium checks are
not a Surface performance measurement.

No persistent `will-change` is set and Glass does not animate. If the caller
animates placement, set `will-change: transform` only for that animation and
remove it on completion **and cancellation**. Never animate blur radius.

`prefers-reduced-transparency: reduce` selects opaque `--bg-elevated` and removes
both prefixed and standard backdrop filters. `data-glass="off"` does the same on
a surface or ancestor, overriding even strong surfaces. Set it on `<html>` when
portals must inherit it. Browsers without backdrop-filter start opaque. Opaque
fallbacks keep the shared geometry and elevation, and their text pairs are also
gated. `data-glass="on"` cannot defeat an ancestor opt-out or OS preference.

## Contrast contract

Every voice/mode tests both fills under `--text` and `--text-secondary` over
sRGB black and white, including fill **and foreground** alpha via source-over
compositing in encoded sRGB before WCAG luminance calculation. Both extremes
must clear 4.5:1. Since every channel of an SDR backdrop lies between these
extremes and the chosen text stays on the opposite luminance side of both
composited fills, the extremes bound the worst case, including saturated imagery.
The current minimum ratios across both fills and both text levels are 5.466:1
(base light), 4.693:1 (base dark), and 5.028:1 (biomonitor). The gate also asserts
that text luminance never falls between the composited backdrop endpoints.
Blur is not credited with improving contrast. Do not reduce opacity on the
surface or its text; tertiary/decorative text, arbitrary foreground colors,
blend modes, HDR and consumer overrides are outside this contract.

The gate now renders every actual `StatusPill` tone and extracts its background
and foreground classes, testing success/success-subtle, warning/warning-subtle,
danger/danger-subtle, info/info-subtle and neutral text-secondary/bg-muted at
4.5:1. Existing solid-fill and text-on-tint tests remain. No existing status
palette values needed changing. New tests also enforce the blur cap, native ref
and semantics, schema ownership of x-glass tokens, and packed-browser strong,
local/ancestor opt-out and emulated reduced-transparency behavior. A screenshot
pixel comparison checks that paint containment preserves the top-left highlight
and bottom-right shade while leaving the interior untouched.

The requested `x-` names are retained as **required schema tokens**. L6 checks
schema membership before extension-prefix handling, so these cannot silently
become private component declarations. Voice validation requires all eight in
every voice and every color again in the dark palette; Tailwind maps all four
color tokens. Consumer theme overrides must rerun the same contrast contract.

## Token values

All color values below are CSS `oklch(...)`. The shadow values are complete CSS
box-shadow lists, including the inner shadow.

| Token | Base light | Base dark | Biomonitor |
|---|---|---|---|
| `--x-glass-fill` | `oklch(1 0 0 / 0.92)` | `oklch(0.31 0.007 265 / 0.96)` | `oklch(0.29 0.015 225 / 0.96)` |
| `--x-glass-fill-strong` | `oklch(1 0 0 / 0.97)` | `oklch(0.31 0.007 265 / 0.98)` | `oklch(0.29 0.015 225 / 0.98)` |
| `--x-glass-border` | `oklch(0 0 0 / 0.18)` | `oklch(0 0 0 / 0.4)` | `oklch(0 0 0 / 0.4)` |
| `--x-glass-highlight` | `oklch(1 0 0 / 0.85)` | `oklch(1 0 0 / 0.2)` | `oklch(0.94 0.008 100 / 0.18)` |
| `--x-glass-shadow` | `inset 0 1px 2px oklch(0 0 0 / 0.06), 0 8px 24px oklch(0 0 0 / 0.16)` | `inset 0 1px 2px oklch(0 0 0 / 0.06), 0 8px 24px oklch(0 0 0 / 0.32)` | `inset 0 1px 2px oklch(0 0 0 / 0.06), 0 8px 24px oklch(0 0 0 / 0.32)` |
| `--x-glass-blur` | `10px` | `10px` | `10px` |
| `--x-glass-saturate` | `1.08` | `1.08` | `1.08` |
| `--x-glass-radius` | `8px` | `8px` | `8px` |

## Consumer switch map — follow-up only

Read-only inspection of GitHub main on 2026-09-09: needle-guide
`61c93b3fb94870fda560b4e40fbc1007569ff3dd`; needle-simulator
`b504bf17c85708a4b193ebb5af3fa9c149d4d367`. The local `~/dev/needle-guide` checkout
was older, so the entries below refer to those remote snapshots. No consumer
files are changed by this PR. Selectors identify authored classes/JSX nodes,
not unstable compiled CSS-module hashes.

| Consumer surface | Exact source / selector to migrate |
|---|---|
| Guide inputs | `src/components/features/Calculation/CalculationInputPanel.tsx`: outer non-embedded `div`, currently `flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-bg/60 p-4 font-sans backdrop-blur-xs`. Replace material with `Glass`; preserve the embedded `contents` branch and layout. |
| Guide status cluster | `src/components/features/ConnectionToolbar/ConnectionToolbar.tsx`: `Toolbar[aria-label="Controls"]`, currently `fixed right-6 top-6 z-toast rounded-full border-border-strong bg-bg-elevated …`. Apply `.ds-glass` to Toolbar; retain inner StatusPill's opaque status tint. |
| Guide LASER LATERAL card | `src/components/features/Calculation/CalculationOutputPanel.tsx`: outer `div.flex.flex-col.gap-1` containing `[data-testid="laser-lateral-readout"]`. Convert that wrapper to Glass; keep Numeric and its measurement semantics. |
| Guide CALIBRATE | `src/components/features/Calculation/CalculationInputPanel.tsx`: Button with `styles.calibrateBtn`; `src/components/features/Calculation/CalculationPanel.module.css`: `.calibrateBtn`, `:hover`, `:active`. Apply `.ds-glass` on Button; remove its private transparent fill, 4px radius, success border and glow. Preserve disabled/event behavior; use shared text or a separately contrast-tested status label. Avoid a second nested blur: use local `data-glass="off"` when inside the Glass inputs surface. |
| Guide projector | `src/components/features/Projector/variations/DesignE.tsx`: right-hand readout wrapper `div.absolute.right-6.top-1/2…bg-bg.text-2xl.font-bold` containing `[data-testid="projector-readout"]`. Apply `.ds-glass` to that wrapper, keeping absolute positioning. Do not apply containment/blur to `[data-testid="projector-e"]`, the ruler, tolerance band or error bar. `DesignE.module.css`'s `.container::after` belongs to the scene, not this floating material. |
| Simulator dialogs | `apps/desktop/src/components/GravityCalibrationOverlay.tsx`: `DialogContent` currently `max-w-2xl rounded-none border-accent-subtle`. Apply `.ds-glass`, removing the local material overrides. Keep the portal, close control, DialogBody scrolling and focus trap. Put global `data-glass="off"` on html. The shared DialogBody fade is opaque at its bottom by design; validate the scroll cue visually when opting a dialog into transparency. |
| Simulator CT console cards | `apps/desktop/src/windows/CtConsoleWindow.tsx`: the `section.flex.flex-col.gap-2` nodes marked `CtConsoleSection` and `PatientSetupSection`; `apps/desktop/src/windows/ctConsole/NeedleSection.tsx`: outer `section.flex.flex-col.gap-2`. Apply `.ds-glass` to these semantic sections. `ctConsole/ConsoleParts.tsx` rows and `DistanceHero.tsx` remain content; keep their layout and numeric slots. |

After release-please tags the package, bump the dependency in each consumer and
remove the old material declarations in that same consumer PR. Check native
floating positioning, focus rings, scroll cues, bright imagery and the Surface
GPU with mocks where hardware is unavailable. Do not create tags or bump this
package's version manually.

## Six months later: what broke?

Manual steps: a dependency bump without migration leaves the old material in
place; the consumer bump PR must include the selector replacements above and
its own checks. One-way sync: copied CSS stops receiving fixes; consumers import
the packaged class, never copy it. Drift: an x-prefixed token or status class
changes unnoticed; schema/L6, rendered StatusPill pairs and per-voice compositing
gates catch it. Silent failure: packaging drops the CSS or a fallback leaves
blur active; the packed Chromium smoke checks the actual computed material and
both opt-outs. Consumer theme overrides and real GPU regressions remain outside
this package's test reach; the follow-up must run contrast against its resolved
theme and profile the target hardware before claiming that validation.
