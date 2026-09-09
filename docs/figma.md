# Figma adapter and designer handoff

**Provisioning status: blocked before file creation.** The intended file is
`AyakaRadiology Design System` in the owner's Drafts. No file URL exists yet;
no variables, components, or screen frames have been created in Figma by this
change. The authenticated account returned two teams, and the create-file MCP
contract requires a team selection. A selection request for **Harry Lab
(Education, Full seat)** is pending; the other team has a Starter/View seat.
Do not treat this document as a completed designer onboarding file.

The repository adapter is implemented and usable offline. Its current plan has
**116 variables**, in `base` (58, light/dark) and `biomonitor` (58, dark only).
The Figma scripts have contract tests, but have **not** been executed against a
Figma file. These counts describe the generated plan, not created objects.

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

Once the team selection is resolved, an engineer/agent should load the current
Figma `figma-create-new-file`, `figma-use`, `figma-generate-library`, and
`figma-generate-design` skills. Create one Design file in that team's Drafts,
inspect it, discover libraries and batch-search the required primitives before
building. Record the returned file URL here and the returned object IDs in a
local `mktemp` ledger.

Execute the generated `import.js` through `use_figma`. It creates the collections
and modes from the actual adapter JSON and sets values, descriptions, scopes
and WEB syntax. Rerunning a matching import is idempotent. It preflights all
existing collections before writing anything and refuses different values,
modes, duplicate names or unexpected variables. It never deletes an existing
variable. An interrupted, partially created variable may require explicit
repair after inspecting the returned IDs; it is not silently treated as valid.

### Component mapping still to provision

The following is the source-to-Figma mapping for the outstanding canvas work;
it does not claim that these components exist yet. Create native auto-layout
components and instances with text properties and variable bindings.

| React source (`src/react/`) | Figma component | Required states / details |
|---|---|---|
| `Glass.tsx` | Glass | `data-glass=on/strong/off`; variable fill, edge, radius, blur; opaque fallback |
| `Numeric.tsx` | Numeric | Value, empty, empty with muted unit, reserved empty unit slot; editable value/unit; em dash, fixed value reservation |
| `StatusPill.tsx` | StatusPill | Every exported `STATUS_STATES`: healthy/live; degraded/stale/lost; error/invalid/offline; connecting; unknown/loading; never blinking |
| `Dialog.tsx` | Dialog / DialogBody | Header and actions outside a scrolling body; matching surface/fade |
| `RadioGroup.tsx` | RadioGroup | Horizontal/vertical, checked/unchecked, disabled; visible labels |
| `IconButton.tsx` | IconButton | Existing button variants, focus/disabled states, editable icon instance and accessible-name documentation |
| `BuildStamp.tsx` | BuildStamp | Static/interactive, editable supplied metadata, opaque elevated plate |

Use the actual React/CSS implementation for property combinations and geometry.
Do not flatten components into captured images. Font stacks, multi-part shadows
and CSS saturation require native text/effect implementation or an explicitly
reported Figma limitation; the COLOR/FLOAT plan does not encode these effects.

### Consumer screens still to provision

Create one page per app, using instances of the components above. Capture a
running dev build with `generate_figma_design` for visual reference when
available, then assemble/tidy native content and remove reference captures.
Use the requested demonstration readings: target **40.0°**, needle **38.5°**,
laser lateral **−12.40 mm**. These are demonstration values, not patient data.

- **needle-guide:** full-window scene placeholder, PLAN box, LASER LATERAL card,
  CALIBRATE, floating status cluster, and a separate projector design G frame.
- **needle-simulator:** PLAN with AXIAL/SAGITTAL/CORONAL MPR panels, PHANTOM
  sidebar with SET TARGET / SET ENTRY / RESET and footer; OPERATION frame.

The readable consumer checkouts provide additional source truth: Guide uses the
shared Inter/JetBrains Mono stack, while Simulator overrides it with Barlow Semi
Condensed/Fragment Mono. Preserve those app-specific fonts when composing.
The inspected Guide `MainDisplay.tsx` currently uses an operational-quadrant
layout, and no projector design G implementation was found in its `src`/`docs`.
The requested one-screen/projector layout therefore needs reconciliation with
its actual source before it can be described as a current-screen capture.
No dev capture or visual verification has been performed in this change.

## What the designer edits, and how it returns

Once provisioned, the designer works inside this one file: duplicate the
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
comparison tolerates only 0.000001 channel storage noise; numeric edits are
compared exactly. Preserve the original baseline alongside the live export.

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
and the shipped voices diverging after a code release. Manual recollection is
not a gate: generate/import/export commands and diff exit status make the
comparison repeatable. One-way sync is addressed by extracting live values and
design context into a PR, followed by forward reconciliation. Drift is caught
by schema validation, exact roundtrip tests, and live diff comparison. Silent
failures are prevented by rejecting unsupported CSS, unresolved aliases,
missing modes and conflicting imports. There is no scheduled live-Figma drift
check yet: repository CI cannot inspect a private Figma file without an
explicit integration/credential decision. Until then, run the live comparison
as part of each requested sync; do not call repository CI proof of canvas parity.
