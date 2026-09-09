# @ayaka/design-system

One shared visual system for the fleet's tool UIs: the token **schema** (what
names exist), the **voices** (what values they take), the Tailwind mapping that
turns them into utilities, nine React **primitives**, and `design-lint` — the
gate that stops a consumer inventing its own colours, sizes and controls.

Three layers, and the split is not a judgement call — `AGENTS.md` carries the
procedure that decides where a token or a component belongs, and the parts that
can be checked are checked:

| Layer | Lives in | Answers |
|---|---|---|
| schema | this package (`tokens/schema.json`) | what a surface, a border, a text level, an accent, a status, a series, a type step, a z-layer, a motion duration *are* |
| voice | this package (`voices/*.css`) | what values they take |
| extension | the consuming repo (`src/styles/theme.css`) | what only that product knows — `--x-` prefixed |

## Figma

The [offline Figma adapter and handoff guide](docs/figma.md) cover variable
projection, roundtrip checks, and extracting designer edits into a PR. The guide
also records the outstanding Figma file provisioning work.

## Impeccable review context

[PRODUCT.md](PRODUCT.md) records the needle operator context;
[DESIGN.md](DESIGN.md) is generated from the house schema, biomonitor voice,
shared scales, UI rules and lockfile-pinned Tailwind spacing/radii. Reviews
must preserve these contracts. The base voice remains available unchanged.

```sh
bun run design:generate  # regenerate after changing a source
bun run design:check     # fail on missing or stale DESIGN.md
```

The existing CI **Quality Check** runs `design:check` through `bun run check`.
Generated output is never read back into tokens; edit its sources instead.
No `.impeccable/design.json` is maintained: the generated Markdown and its
frontmatter carry the context without a second token inventory.
The shared detector config ignores only `overused-font=Inter` (Brand font).
Run `npx impeccable detect --json .` for advisory findings; `design-lint`
and the existing contrast/voice gates remain mandatory.

Six months from now, a manually edited projection or forgotten regeneration
would drift: CI's byte comparison rejects both. Missing/malformed token sources
fail loudly. Product facts are a sourced snapshot, not a live cross-repo sync;
consumer specifications remain authoritative for consumer changes.

## Install

Distribution is by git tag, like `needle-protocol`: no registry account, and
`dist/` is committed so a consumer gets a built package straight from the tag.

```sh
bun add github:AyakaRadiology/design-system#v0.1.0
```

Pin a tag, never a branch. `main` moves.

## Wire it up

One file in the consumer may redefine schema tokens, and `design-lint` enforces
that it is the only one. Point `themeFile` in `design-lint.json` at it.

```css
/* src/styles/theme.css — the ONLY file that may redefine schema tokens */
@import "tailwindcss";
@import "@ayaka/design-system/voices/biomonitor.css"; /* pulls in scales + the Tailwind mapping */

:root {
  /* overrides (values only; each line carries a reason) */
  --accent: oklch(0.80 0.12 195); /* desktop keeps its cyan phosphor */

  /* extensions: domain tokens, --x- prefixed, derived from schema tokens where one exists */
  --x-dicom-crosshair: var(--accent);
  --x-needle-tracker: var(--chart-1);
  --x-needle-fused: var(--chart-2);
}

@theme inline {
  --color-x-dicom-crosshair: var(--x-dicom-crosshair);
  --color-x-needle-tracker: var(--x-needle-tracker);
  --color-x-needle-fused: var(--x-needle-fused);
}
```

Import that file from the app's CSS entry point, then use the utilities the
mapping generates — `bg-bg`, `bg-bg-subtle`, `bg-bg-elevated`, `text-text-secondary`,
`border-border`, `bg-accent text-accent-fg hover:bg-accent-hover`,
`bg-danger-subtle text-danger`, `text-chart-1`. No `dark:` twins: the voice
handles both modes once, which is why rule L4 rejects them.

### Voices

| Voice | Modes | For |
|---|---|---|
| `base` | light + dark | general tool UI, anything with a light mode |
| `biomonitor` | dark only | instrument surfaces — telemetry, monitors, dashboards. See `voices/biomonitor/VOICE.md`. |

Picking a voice is a values decision; a voice is not a starting point to edit.
More than about eight overrides in one `theme.css` means the product wants a
new voice in this package, not a pile of local values.

## Primitives

```tsx
import { Button, Panel, StatusPill } from "@ayaka/design-system/react";

<Panel title="Tracker" actions={<Button size="sm">Reset</Button>}>
  <StatusPill status="success">connected</StatusPill>
</Panel>;
```

`Button`, `IconButton`, `Numeric`, `StatusPill`, `Toolbar`, `Panel`, `Field`,
`Input`, `Select`, `Switch`, `RadioGroup`, `Dialog`, `DialogBody`, `Tooltip`,
`BuildStamp`. The props **are** the
contract and they are deliberately small: a prop that carries a domain type
(`NeedleData`, `Volume`) belongs in the product repo, not here.

`react` and `react-dom` 19 and `tailwindcss` 4 are peer dependencies — the
consumer owns those versions.

You do **not** need an `@source` line for the primitives. Tailwind's automatic
source detection skips `node_modules`, so a consumer would otherwise get
`<Button>` with none of the utilities its classes name — an unstyled control,
with nothing anywhere to say why. `tailwind.css` carries the `@source` itself,
resolved relative to the package, so the fix travels with the dependency
instead of being a line every app has to remember. `tests/consumer/run.sh`
asserts that classes only the primitives use reach a real app's built
stylesheet.

### Dialog scrolling

```tsx
<Dialog>
  <DialogTrigger asChild><Button>Help</Button></DialogTrigger>
  <DialogContent title="Help" description="Using the tracker" actions={
    <DialogClose asChild><Button>Close</Button></DialogClose>
  }>
    <DialogBody aria-label="Tracker help">…long help content…</DialogBody>
  </DialogContent>
</Dialog>
```

`DialogBody(props: DialogBodyProps)` accepts div HTML attributes. Put it
directly inside `DialogContent`; the title/description and `actions` are the
fixed header/footer. The dialog is bounded by `100svh` minus spacing-4 gutters;
the body shrinks to the remaining height and scrolls internally. A thin
voice-colored scrollbar and sticky bottom fade make scrolling discoverable
on touch. No header-height calculation is needed at the call site. Existing
short dialogs can continue using plain children. Oversized headers/actions
must still fit the viewport; test actual geometry in consumer Playwright.
`DialogContent` sets `--dialog-surface` to `--bg-elevated` and uses it as its
background; `DialogBody` fades to the same property. A consumer that needs a
different surface sets `--dialog-surface` on a named class in `theme.css`, then
passes that class to `DialogContent`, so the content and fade cannot drift.

### Numeric values

```tsx
<Numeric value={12.34} unit="mm" precision={1} reservedChars={6} />
<Numeric value={null} unit="mm" precision={1} reservedChars={6} />
```

`Numeric({ value: number | null, unit?: string, precision?: number,
reservedChars?: number, reservedUnitChars?: number, showUnitWhenEmpty?: boolean,
reserveUnitSlotWhenEmpty?: boolean,
...spanAttributes })` reserves separate value and unit
slots. `precision` is an integer 0–100 (default 0); `reservedChars` is a positive
integer (default 6), in monospace `ch`. The unit slot defaults to the unit
string's length in `ch`; `reservedUnitChars` pins it, which is what a unit that
changes with the reading (`ms` → `s` → `min`) needs so the cells beside it hold
still. Choose enough value characters
for the sign, decimal point and expected range; overflowing values remain
visible rather than being clipped. `toFixed` formatting applies (including
JavaScript's exponential notation at magnitudes ≥ 1e21).

Both widths arrive as a `--ds-numeric-chars` count on the slot and become a
width through the `.ds-numeric-slot` rule in `tokens/scales.css`, so a consumer
can widen a slot from CSS — and an app importing no voice gets no reserved
width, because it has imported none of the package's CSS.

Null renders one muted `—`, announced as “No value”, at
`--numeric-empty-scale` of the readout's own size (0.25, floored at the xs
step), inside a value box that keeps its full width. The unit is hidden while
the value is missing; `showUnitWhenEmpty` brings it back, muted.
`reserveUnitSlotWhenEmpty` instead keeps a blank unit slot at its reserved
width, preventing side-by-side hero readouts from moving when one becomes
empty. It defaults to false; when both props are true, the muted unit is shown.
The scale is a
schema token, so an app tunes it per surface in its own `theme.css`.
Zero is a reading. NaN/infinity and invalid precision/width
throw. Unit case is preserved under uppercase labels. The existing
`<Numeric unit="ms">42</Numeric>` form stays source-compatible for preformatted
content; it keeps its natural layout. Its `unitSeparator` defaults to `auto`,
which emits `42°`, `42%`, and `42 mm`; `space` and `none` override the inferred
separator. A React node unit cannot be inferred and defaults to a space, so set
`none` explicitly when it wraps a compact symbol. `value` and children are mutually
exclusive. See [the shared UI rules](docs/ui-rules.md#shared-readouts-and-status).

### Status semantics and detail

`StatusPill({ status: Status, detail?: ReactNode, children: ReactNode,
...spanAttributes })` preserves the existing `status` API. `STATUS_STATES`
exports the tone-to-state mapping and `StatusState<Tone = Status>` derives
its state union: success = healthy/live, warning = degraded/stale/lost,
danger = error/invalid/offline, info = connecting, neutral = unknown/loading.
The [shared UI rules](docs/ui-rules.md#shared-readouts-and-status) are the
consumer reference. No status blinks; shared voice CSS enforces this.

```tsx
<TooltipProvider>
  <StatusPill status="warning" detail="No samples for 5 seconds">Stale</StatusPill>
</TooltipProvider>
```

With detail, the pill is a Tab-reachable tooltip trigger; detail opens on
hover or focus, is linked by `aria-describedby`, and dismisses on Escape.
Without detail the pill adds no tab stop. Detail is supplemental, never the
only place essential information lives.

### Build metadata

`BuildStamp({ name: string, describe: string, buildTime: string,
formatBuildTime?: (iso: string) => string, onClick?: MouseEventHandler,
...attributes })` renders an
opaque elevated-surface plate with AA-tested
secondary text, suitable for a dark footer or bright image. Supply the actual
`git describe` string, including a dirty suffix.
Time is displayed verbatim; the package performs no
fetching or locale conversion. An ISO 8601 `buildTime` is wrapped in a
`<time dateTime>` carrying the ISO value, and `formatBuildTime` words it for
display without disturbing that value. A `buildTime` that is already worded
(`built 2026-01-01 00:00 UTC`) prints as-is, with no `<time>` element claiming
a datetime it does not hold. The consumer owns placement and loading/error
handling. No opacity is applied to the plate.
Without `onClick` it is a static span. With `onClick` it reuses the package
`Button` as a focusable `type="button"` control, so Enter and Space activate
the stamp without a consumer wrapping nested interactive elements. This
focused variant avoids broadening `Button` with an `asChild` API solely for
this use case.

### Radio selection

`RadioGroup({ options: RadioGroupOption[], value?: string,
defaultValue?: string, onValueChange?: (value: string) => void,
orientation?: "horizontal" | "vertical", dir?: "ltr" | "rtl", loop?: boolean,
id?: string, name?: string, disabled?: boolean, required?: boolean,
className?: string, ...aria })` renders labeled options. Each option is
`{ value: string, label: ReactNode, disabled?: boolean }`; values must be unique.
The forwarded ARIA fields are `aria-label`, `aria-labelledby`,
`aria-describedby`, and boolean `aria-invalid`. Provide an accessible group
name directly or via `Field`. Labels contain text, not nested controls.

Vertical is the default; Radix owns Tab entry, disabled-item skipping, looping
(default true), RTL and native form values.
See [Radix Radio Group](https://www.radix-ui.com/primitives/docs/components/radio-group).
The package supplies Model A keyboard behavior itself: every arrow moves focus
and selection together, Space commits the focused option, and Enter does
nothing. It commits through Radix's click path so controlled state, callbacks
and form values stay consistent, while stopping the original keydown before
Radix's timing-sensitive `document` listener can handle it again under React 19.
Radio and switch controls are buttons with their respective ARIA roles, not
native inputs. Both carry `data-ds-control` (`radio` or `switch`); app-level
Space/footswitch handlers must ignore a focused `[data-ds-control]`, because an
`INPUT`/`TEXTAREA` exemption alone does not protect these controls.

### Labels and case

`Field` does **not** uppercase its label. The density table in `docs/ui-rules.md`
asks for `uppercase tracking-wide` on meta labels, and that is right for
English, but CSS `text-transform` is not case-folding: it turned `Plan θ` into
`Plan Θ`, a different symbol from the one the same quantity is printed with
elsewhere.

A product whose labels are pure ASCII adds the class where it wants the effect:

```tsx
<Field label={<span className="uppercase">Port</span>}>
```

Anything carrying Greek, mathematical or non-Latin text leaves it off.

## Colour maths

```ts
import { contrastRatio, oklchToSrgb, parseOklch } from "@ayaka/design-system/color";

const [r, g, b] = oklchToSrgb(...Object.values(parseOklch("oklch(0.66 0.12 178)")).slice(0, 3));
```

`parseOklch`, `oklchToSrgb`, `relativeLuminance`, `contrastRatio`, `deltaE` and
`parseTokens`. Pure, dependency-free, and the same code every voice in this
package is held to — so an assertion you write about a colour and this
package's own gate cannot disagree about what that colour is.

Reach for it where a value has to leave CSS: a canvas fill, a WebGL uniform, a
test that checks a rendered pixel against a token. The GPU cannot take an
`oklch()` string, and a Node test cannot ask the browser to resolve one, so
without this the sRGB triple ends up hard-coded beside the token — the drift
rule L1 exists to prevent, moved one file over.

## The gate

```sh
bunx design-lint --config design-lint.json
```

| Rule | Fails on |
|---|---|
| L1 | colour literal (`#hex`, `rgb()`, `hsl()`, `oklch()`, `color-mix()`) outside the theme file |
| L2 | `style={{ … }}` with a key that is neither a custom property nor geometry |
| L3 | off-scale Tailwind values: arbitrary `[13px]`, spacing steps 5/7/9/11 |
| L4 | `dark:` on a colour utility |
| L5 | a raw `<button>`/`<input>`/`<select>`/`<textarea>`/`<dialog>` instead of a primitive |
| L6 | a custom property that is not `--x-` prefixed, an `--x-` name that duplicates a schema role, a schema token redefined outside the theme file |
| L7 | a numeric `z-index` or `z-[n]` instead of a z-layer token |

Every rule is `"error" | "warn" | "off"` in the config, and every allowlist
entry carries a `reason` — an entry without one is a config error, not a pass.
A consumer's adoption is finished only when every rule is `error`.

```json
{
  "include": ["src/**/*.{ts,tsx,css}"],
  "exclude": ["**/*.test.*"],
  "themeFile": "src/styles/theme.css",
  "rules": { "L1": "error", "L2": "error", "L3": "error", "L4": "error", "L5": "error", "L6": "error", "L7": "error" },
  "allow": [{ "rule": "L5", "path": "src/legacy/OldButton.tsx", "reason": "replaced in #123" }]
}
```

## Storybook and agent access

Start the executable component catalogue from this checkout:

```sh
bun install --frozen-lockfile
bun run storybook
```

Open `http://127.0.0.1:6006`. The development server binds to loopback and fails
if port 6006 is occupied, so the MCP attachment cannot silently point at a
different server. Its Streamable HTTP MCP endpoint is
`http://127.0.0.1:6006/mcp`.

With that server running, attach either agent in one line:

```sh
codex mcp add design-system --url http://127.0.0.1:6006/mcp
claude mcp add --transport http --scope project design-system http://127.0.0.1:6006/mcp
```

Equivalent Codex configuration (`~/.codex/config.toml`):

```toml
[mcp_servers.design-system]
url = "http://127.0.0.1:6006/mcp"
```

Equivalent Claude Code project configuration (`.mcp.json`):

```json
{
    "mcpServers": {
        "design-system": {
            "type": "http",
            "url": "http://127.0.0.1:6006/mcp"
        }
    }
}
```

Ask the agent to call `docs-list`, then `docs-show` with an ID from that list
(e.g. Numeric). `docs-show-story` exposes individual states; `stories-preview`
returns links to real stories. The component manifest is generated from the
actual TypeScript APIs, with common native control props retained. These
commands follow the [Storybook MCP documentation](https://storybook.js.org/docs/ai/mcp/overview),
[Codex MCP documentation](https://developers.openai.com/codex/mcp), and
[Claude Code MCP documentation](https://code.claude.com/docs/en/mcp).

The toolbar switches **Base / light**, **Base / dark**, and **Biomonitor / dark**.
It loads the package's voice CSS directly and applies the voice class and base
`dark` class to `<html>`, so dialogs and tooltips inherit the same palette.
Autodocs examples use separate iframes so their portals and transparency
settings cannot affect neighboring examples. Biomonitor remains dark-only.
The transparency toolbar sets `data-glass="off"`
on `<html>`; the Glass system-preference story is also tested with Chromium's
real `prefers-reduced-transparency` media emulation.

Stories live in `stories/` and cover every component exported by `./react`,
including Dialog/Tooltip composition helpers. `cn`, `buttonVariants`,
`STATUS_STATES`, the colour helpers, and type-only exports are utilities/data,
not renderable components. Examples use the needle apps' ANGLE vocabulary,
Guide's 60° target / 42.5° live display fixtures, and Simulator's 90 mm CT
console fixture. Build metadata is a fixed illustrative snapshot, not the
current checkout's build. No hardware or backend is required.

```sh
bun run storybook:check  # static build, export/API/state coverage, Chromium smoke
bun run storybook:build # static output in storybook-static/
bun run storybook:test  # smoke against source stories; requires the built manifest
```

`bun run check` includes `storybook:check`, so the existing Ubuntu **Quality
Check** CI job gates the static build and browser tests. The smoke suite
renders every story in all three voices, executes story interaction checks,
and fails on console errors or unhandled errors. It also checks Glass's opaque
fallback. Export coverage and manifest checks fail for missing components,
empty APIs, incomplete snippets, or missing `STATUS_STATES`; story counts per
component are printed by the gate. Story markup and preview CSS are included
in design-lint; existing contrast, lint, unit, and packed-consumer gates remain
in place.

Storybook packages are pinned together in `bun.lock`. Browser smoke uses the
repository's Vitest 5 with portable stories and Playwright; Storybook's Vitest
addon currently supports Vitest 3/4. Consequently MCP's addon-backed `test-run`
tool is unavailable: run `bun run storybook:check` in the shell. The static
build contains the catalogue and manifest, but serving those files does not
start the development-only MCP endpoint.

**CI artifact limitation:** the existing workflow has no upload step. This
change does not edit workflows, so `storybook-static/` is built and tested by
CI but is not uploaded as a downloadable Actions artifact. A workflow change
would be required to add `actions/upload-artifact` for that directory after
the Check step; the same Ubuntu job can perform it.

## Working on it

```sh
bun install
bun run check
```

`bun run check` is what CI runs. Read `AGENTS.md` before adding a token, a
voice or a primitive — it carries the assignment procedure and the release
rules.

### Glass floating surfaces

`Glass` from `@ayaka/design-system/react` and `.ds-glass` on semantic HTML
share one material, imported automatically by every voice. See
[the contract, token values and consumer migration map](docs/glass.md) and
[the interactive demo](docs/glass-demo.html) (serve the repository with `bunx vite`).
