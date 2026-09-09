# Figma adapter and designer handoff

**Provisioning status (2026-09-09): variables, native library and four screens verified.**
[AyakaRadiology Design System](https://www.figma.com/design/TnTduN5Mm8cbxPtY3eZy9o)
is in the owner's selected **Harry Lab / Drafts** (Education plan). This run
reused the existing file and executed the adapter's generated Plugin API scripts.

| Object | Verified live inventory |
|---|---|
| Pages | 3: Components (`0:1`), needle-guide (`8:258`), needle-simulator (`8:259`) |
| Variable collections / variables | **2 / 116**: `base` 58 (light/dark), `biomonitor` 58 (dark only) |
| Native component definitions / component sets | **95 / 14**, including variants and supporting icons/scene components |
| Component instances | **102** |
| FRAME nodes / screen frames | **233 / 4**; FRAME count includes nested frames and instance descendants |
| Flattened image fills | **0**; final screens contain editable native objects |

`get_metadata` read back all three pages; `get_variable_defs` returned the
referenced subset of 24 variables. The complete inventory came from Plugin API
collection/variable enumeration and the generated export, rather than treating
that referenced subset as the whole library. The final plan/live diff was `[]`
(exit 0). A second guarded import created no variables, confirming idempotence
against real Figma storage. Names, descriptions, scopes and WEB syntax are
preserved. Biomonitor remains dark-only, as required by its source voice.

Final per-page counts (component definitions / sets / FRAME nodes / instances):
Components **88 / 13 / 105 / 38**, Guide **2 / 0 / 61 / 28**, Simulator
**5 / 1 / 67 / 36**. The native audit found every component using auto-layout,
no image fills, and no text outside its immediate container except the
deliberately clipped, vertically scrolling DialogBody content.

This continuation used **59 Figma MCP requests**, counting attempted requests,
skill/resource reads, capture requests and failures. This is not a billed/read-
quota count and excludes the earlier PR #38/#39 sessions. No file was created.

## Generate and validate

Run from the repository with Bun installed:

```sh
bun install --frozen-lockfile
work=$(mktemp -d)
bun scripts/figma/tokens-to-variables.ts > "$work/plan.json"
bun scripts/figma/plugin-scripts.ts import > "$work/import.js"
bun scripts/figma/plugin-scripts.ts export > "$work/export.js"
bun run check
```

`mktemp` respects `TMPDIR`. Keep the plan with the Figma export as the baseline
for the same revision. The adapter locates inputs relative to its own module,
so running it from another working directory produces identical output.
It adds no dependency, invokes no MCP tool, and changes no source tokens.
The existing typecheck and Vitest gates include `scripts/**/*.ts`.

`loadTokenSource()` produces token JSON from `tokens/schema.json`, the shared
`tokens/scales.css`, and every `voices/*.css`. This is the resolved schema-token
map per voice/mode, not a reconstruction of CSS comments or formatting.
Voice declarations override shared scales; `.dark` overrides `:root`. Unexpected
selectors, duplicate declarations, missing tokens and unsupported value syntax
fail explicitly. The adapter preserves biomonitor's dark-only contract.

## Token to variable mapping

Collections are named exactly after the source voice. Names retain the semantic
CSS token name without its leading `--`; WEB code syntax retains `var(--name)`.
Descriptions are `role: doc` from the schema. Glass is a shared material within
each voice, not an independent voice or a new palette.

| Source | Figma plan | Conversion |
|---|---|---|
| `--bg`, `--text`, `--accent`, status and series tokens | Same semantic name in each voice | OKLCH to sRGB RGBA, retaining alpha |
| `--text-sm`, paired line heights, container width | FLOAT, same name | rem × 16 → px |
| `--motion-fast`, `--motion-base` | FLOAT, same name | ms; seconds × 1000 |
| `--z-*`, `--numeric-empty-scale` | FLOAT, same name | Unitless integer/ratio |
| `--x-glass-fill`, `--x-glass-fill-strong`, `--x-glass-border`, `--x-glass-highlight` | COLOR, same name | Includes translucent alpha |
| `--x-glass-blur`, `--x-glass-radius` | FLOAT, same name | px |
| `--x-glass-saturate` | FLOAT, same name | Ratio |
| Font stacks, easing, Glass shadow, optional trace glow | `nonVariables` entries | Original CSS retained with explicit reason; not COLOR/FLOAT |

All variables have explicit scopes and code syntax. Numeric motion/stacking
values are hidden from unrelated property pickers. Typography, radius and color
scopes reflect their use. `x-glass-blur` is a length; consumers of the plan can
bind its value to the background-blur effect radius.

RGBA is rounded to eight decimal places to remove differences between Bun's
JavaScriptCore and Node's V8 math. Out-of-sRGB-gamut OKLCH uses the package's
existing clamped conversion. Original OKLCH, units, and non-variable CSS remain
in the plan: RGB cannot reconstruct the exact authored OKLCH after clipping.
`variablesToTokens()` verifies the complete projection before restoring this
source representation. **It rejects an edited plan rather than returning old
source values.** It is a lossless *unchanged-plan* roundtrip, not an automatic
inverse color editor. Tests also verify actual numeric/alpha conversions and
refuse changed, deleted, duplicate or invalid entries.

## Provisioning the file

For subsequent synchronization, load the
current `figma-use`, `figma-generate-library`, and `figma-generate-design` skills
and target file key `TnTduN5Mm8cbxPtY3eZy9o`. Inspect its current state first,
because the inventory above is a dated snapshot. Reuse the existing native
library. Keep returned object IDs in a local `mktemp` ledger.

Execute the generated `import.js` through `use_figma`. It creates the collections
and modes from the actual adapter JSON and sets values, descriptions, scopes
and WEB syntax. Rerunning a matching import is idempotent. It preflights all
existing collections before writing anything and refuses different values,
modes, duplicate names or unexpected variables. It never deletes an existing
variable. An interrupted, partially created variable may require explicit
repair after inspecting the returned IDs; it is not silently treated as valid.

### Provisioned components

The library uses native auto-layout components, instances, editable text and
variable bindings. Variant counts below count individual component definitions.

| React source (`src/react/`) | Figma component | Required states / details |
|---|---|---|
| `Glass.tsx` | Glass (`5:13`) | 3: on/strong/off; variable fill, gradient edge, radius and blur; opaque fallback |
| `Numeric.tsx` | Numeric (`5:49`) | 8: body/hero × value/empty/empty unit/empty reserved; editable value/unit, em dash, fixed reservation |
| `StatusPill.tsx` | StatusPill (`5:75`) | All 11 `STATUS_STATES`: healthy/live/degraded/stale/lost/error/invalid/offline/connecting/unknown/loading; native editable labels |
| `Dialog.tsx` | Dialog (`8:221`) / DialogBody (`8:193`) | 2 each: fit/scroll; header/actions outside the clipped scrolling body; variable-bound fade endpoint |
| `RadioGroup.tsx` | RadioGroup (`8:186`) | 8: horizontal/vertical × first/second selected × enabled/disabled; nested RadioOption components |
| `IconButton.tsx` | IconButton (`5:166`) | 16: secondary/primary/ghost/danger × default/hover/focus/disabled; native icon swap |
| `BuildStamp.tsx` | BuildStamp (`5:178`) | 2: static/interactive; editable supplied metadata, opaque elevated plate |

Supporting library components are Button (16), RadioOption (6), and two native
vector icons. Three Numeric consumer presets—GuideAngle, Laser and Plan—have
four states each. Their master geometry carries the source-sized value/unit
reservation because resizing nested frames in an instance was not retained by
Figma. This avoids detached numbers and keeps the source unit/empty-state model.

Glass has native inner/drop shadows and a variable-bound gradient border.
CSS backdrop saturation is **not encoded as a native effect**; its ratio remains
available as `x-glass-saturate`. Font stacks and multi-part shadows remain
`nonVariables` in the adapter, so native font/effect choices need reconciliation
when those source entries change. These are editable design states, not a
replacement for browser accessibility, keyboard, focus or backend behavior.

### Provisioned consumer screens

Each app has its own page; all four screen frames are 1440 × 900. Guide uses the
requested demonstration readings: target **40.0°**, needle **38.5°**, laser
lateral **−12.40 mm**. These are demonstration values, not patient data.

- **[needle-guide](https://www.figma.com/design/TnTduN5Mm8cbxPtY3eZy9o?node-id=14-109):** full-window scene placeholder; PLAN box with ENTRY LAT,
  ENTRY LONG, AZIMUTH and PLAN ANGLE; LASER LATERAL card; CALIBRATE; floating
  SOURCE/CASE/LINK/sound cluster. CASE reads SIMULATION; laser helper is SET ZERO.
- **[Projector / Design G](https://www.figma.com/design/TnTduN5Mm8cbxPtY3eZy9o?node-id=14-231):** native target/needle rays at 40.0°/38.5°, entry point, arc and editable readouts.
- **[Simulator / PLAN](https://www.figma.com/design/TnTduN5Mm8cbxPtY3eZy9o?node-id=16-158):** source-matched 2×2 layout with AXIAL/CORONAL/SAGITTAL panels and PHANTOM controls; SET TARGET / SET ENTRY / RESET and footer.
- **[Simulator / OPERATION](https://www.figma.com/design/TnTduN5Mm8cbxPtY3eZy9o?node-id=16-257):** five axial slots and footer in the pre-capture state.

The readable consumer checkouts provide additional source truth: Guide uses the
shared Inter/JetBrains Mono stack, while Simulator overrides it with Barlow Semi
Condensed/Fragment Mono. Preserve those app-specific fonts when composing.
The Guide dev build was captured successfully with `generate_figma_design`
through a temporary local proxy after resolving the app's hash-router conflict.
It provided a visual reference; raw captures were removed after native assembly.
The requested one-screen layout and projector Design G are deliberate owner-
requested compositions: the inspected Guide source uses an operational-quadrant
layout and no Design G implementation was found. They are not exact current-app
captures. All four final screens were screenshot-reviewed.

Simulator panels explicitly show unavailable/pre-capture states: no DICOM was
loaded, so populated CT imagery could not be produced. SET TARGET and SET ENTRY
remain visibly disabled in that state. Demo footer/build metadata and mock scene
geometry are canvas examples, not new product-copy or design-system rules.

## What the designer edits, and how it returns

The designer works inside this one file: duplicate the
consumer frames into clearly named working copies, retain instances, and edit
text, layout, variants and variable values there. Keep token names and
collection/mode identities stable. Canonical component changes and renamed or
new tokens need the same engineering PR as their code equivalents.

The engineer/agent retrieves the changed nodes using `get_design_context`
(after loading its design-to-code skill) and `get_variable_defs`. For a complete
variable comparison, execute the generated `export.js` via `use_figma` and save
the returned JSON directly as `live.json`; no hand-transcribed values.
The normalized export contains collection names, mode names, semantic variable
names, resolved types and values. Resolve aliases explicitly if introduced:
the exporter rejects them instead of choosing an arbitrary target/mode.

```sh
bun scripts/figma/diff-variables.ts "$work/plan.json" "$work/live.json" > "$work/diff.json"
```

Exit 0 means no differences; exit 1 with a JSON array means reviewable changes.
Malformed or unresolved data throws an error instead of producing a clean diff.
Added/deleted variables and modes appear with null before/after values. Color
comparison tolerates only 0.000001 channel storage noise. Numeric comparison
accepts the authored value or its exact Float32 storage representation, with no
general numeric epsilon: Figma returned `1.0800000429153442` for `1.08` in the
live import/export. Tests still reject small representable edits in both diff
and import preflight, including an adjacent Float32 value in the diff test.
Preserve the original baseline alongside the live export.

Use the extracted diff and design context to produce a source PR, retaining
unchanged authored OKLCH and applying reviewed changes in the voice/component
that owns them. The full contrast, schema, unit, browser and design-lint gates
must pass. Updating token source from a reviewed Figma color edit still requires
an engineer/agent to choose valid authored OKLCH; this change does not implement
automatic inverse color conversion or automatic component-code generation.
After merge, regenerate the plan and reconcile the Figma variables and
components with the merged revision. The importer deliberately refuses to
resolve conflicting live edits automatically. No manual copying between tools
is part of the workflow.

## Plan limits and six-month failure review

The owner's Education plan has Professional-level features, with approximately
200 MCP read calls/day and 10/minute. Figma's MCP rate-limit resource confirms
those Education limits and notes that certain write/identity tools are exempt.
Batch variable scripts and per-page operations; count requests separately from
billable/read-quota calls. Custom Code Connect publishing is unavailable on the
owner's Education plan: do not attempt it. Organization is the upgrade path for
custom Code Connect; verify current eligibility before changing plans.

**Six months from now, what broke?** The likely failure is a designer's file
and the shipped voices/components diverging after a code release, especially
native Numeric presets and effects that the variables plan does not generate.
For every requested sync, execute the generated export and diff against that
revision's plan, then inspect changed component geometry/effects and live
metadata. Manual recollection is not the variable gate: generated scripts and
the diff exit status make comparison repeatable. One-way sync is addressed by
extracting live values and design context into a PR, followed by forward
reconciliation. Drift is caught
by schema validation, exact roundtrip tests, and live diff comparison. Silent
failures are prevented by rejecting unsupported CSS, unresolved aliases,
missing modes and conflicting imports. There is no scheduled live-Figma drift
check yet: repository CI cannot inspect a private Figma file without an
explicit integration/credential decision. Until then, run the live comparison
as part of each requested sync; do not call repository CI proof of canvas parity.
