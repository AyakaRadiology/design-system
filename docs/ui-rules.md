<!-- Copy of the `ui` skill's SKILL.md, minus its per-project Setup section
     (this package IS the setup — see README.md). Kept here so the repository
     is self-contained: the density, scale and anti-pattern rules below are
     what the primitives in src/react implement and what design-lint checks. -->

# UI design system

One token system for every project: IBM Carbon's spacing/type skeleton with the IBM identity stripped (Inter, teal accent, 6/8px radii). Without this skill each session invents its own system — a new accent ramp, ad-hoc `slate-*` literals, off-scale sizes. With it, all projects converge.

`tokens.css` (in this skill directory) is the seed. The **project's copy** is the source of truth for values — this file never repeats them.

## Voices

The base tokens converge projects; they don't give any one project an identity.
When a surface should *impress* — a personal dashboard, anything the owner
looks at for pleasure — pick (or create) a voice: a complete alternative token
set plus the rules that make it read as itself, kept in `voices/<name>/`
(`tokens.css` + `VOICE.md`). Seed the project from the voice's tokens instead
of the base ones; every scale/density/anti-pattern rule in this file still
applies on top.

- `voices/biomonitor/` — dark-only patient-telemetry for monitors (first worn
  by spine). See its VOICE.md for the signature-element rule.

When a frontend-design pass produces a look worth reusing, capture it as a new
voice here rather than leaving it stranded in one repo.

## Density — dense tool UI (default)

| Element | Spec |
|---|---|
| Body text | `text-sm` (14px base, set by tokens) |
| Meta/labels/column headers | `text-xs`, headers `uppercase tracking-wide` |
| Headings | `text-xl` page title, `text-lg` page-level sections, `text-sm font-semibold` card/panel headings — max 4 sizes per screen |
| Controls (inputs, buttons, selects) | `h-8`, `px-3`, `rounded-md`, `text-sm`; icon-only buttons `size-8`, no padding |
| Switch | track `h-4 w-8 rounded-full p-0.5` (`bg-bg-muted` off → `bg-accent` on); `size-3` knob (`bg-bg` → `bg-accent-fg`), travel `translate-x-4` |
| Table cells | `px-3 py-2`; numeric columns `tabular-nums` |
| Row states | hover `hover:bg-bg-subtle`, selected `bg-accent-subtle`; header/footer rows sit on `bg-bg-subtle`, toolbar on `bg-bg` |
| Card/panel padding | `p-4`, page gutters `px-6 py-8`, section gap `space-y-6` |
| Icons | `size-4` |
| Weights | 400 body, 500 emphasis, 600 headings — nothing else |

**Reading/content surfaces** (docs, blog, marketing): body `text-base` (16px), measure `max-w-prose-page`, spacing one step up.

## Containers

- Form/settings page: `max-w-3xl` centered; individual controls `max-w-md`
- Side panel: `lg:w-96`; modal: `max-w-lg`
- Data tables: full-width within page gutters
- Prose: `max-w-prose-page`

## Scale rules

- Spacing (padding/gap/margin): Carbon steps only — `0.5, 1, 1.5, 2, 3, 4, 6, 8, 10, 12` (2–48px). Never 5/7/9/11. Width/max-width/container utilities are exempt (`w-96`, `max-w-3xl` fine), plus `w-px`/`h-px` hairlines; control heights come from the Density table, not this exemption.
- Radii: `rounded-md` controls, `rounded-lg` surfaces, `rounded-full` pills/dots. Nothing else.
- Shadows: `shadow-xs` controls, `shadow-sm` cards — a ceiling, not a goal. Dark-mode depth comes from the `bg`/`bg-subtle` surface step, not shadows.

## Anti-patterns

Each of these appeared in unguided output. When you catch yourself giving the same correction twice, append it here.

| Drift | Correction |
|---|---|
| Raw palette literals with `dark:` twins (`border-slate-200 dark:border-slate-800`) | Semantic tokens: `border-border`, `bg-bg`, `text-text-secondary`. Dark mode is handled once in tokens.css — components never write `dark:` for colors. |
| Arbitrary values: `text-[13px]`, `text-[11px]`, `w-[7.5rem]` | Nearest scale step. If a value is genuinely needed repeatedly, promote it to a token in the project's tokens.css. |
| Inventing an accent: new `brand-*`/oklch ramp, stock `indigo-*`/violet | The accent already exists: `bg-accent`, `text-accent-fg`, `hover:bg-accent-hover`, `bg-accent-subtle`. One fill color + hover — no 50–900 ramp. |
| Ad-hoc status hues picked inline (`emerald`, `amber`, `blue`) | `success`/`warning`/`danger`/`info` tokens, each with `-subtle` (tinted bg) and `-fg` (text on solid fill) pairs. Badges: `bg-info-subtle text-info`; destructive button: `bg-danger text-danger-fg hover:bg-danger-hover`. |
| Per-component focus styles (`focus:ring-2 ...`) | Global `:focus-visible` lives in tokens.css. Add nothing. |
| Marketing defaults on tool UI: gradients, glassmorphism, `shadow-lg`, `rounded-xl`, hero spacing | Tool UI is flat, dense, bordered. See Scale rules. |

## Worked example

```tsx
<div className="flex items-center justify-between border-b border-border bg-bg px-3 py-2">
  <input
    className="h-8 w-full max-w-xs rounded-md border border-border-strong bg-bg px-3 text-sm placeholder:text-text-tertiary"
    placeholder="Search jobs…"
  />
  <button className="h-8 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg hover:bg-accent-hover">
    New job
  </button>
</div>
```

No `dark:` variants, no focus classes, no invented colors — tokens cover all three.

## Scope

This governs product/tool UI structure. For aesthetic direction on expressive surfaces (landing pages, campaigns), the frontend-design skill applies on top — but tokens still hold.

## Shared readouts and status

Use `Numeric value={numberOrNull} unit="mm" precision={1} reservedChars={6}`
for machine readings. The missing-value glyph is **`—`**: one muted em dash,
never `--.-`, zero, or an empty string. The unit remains visible in a muted,
fixed-width slot. The value slot reserves `reservedChars` monospace `ch`
(default 6), including the sign and decimal point; `precision` defaults to 0.
Size it for the full expected range. Digits are tabular; units always preserve
case, even inside an uppercase label. Null alone means missing; NaN/infinity
are errors, not a missing-value fallback. The compatibility children form
remains available for preformatted figures but does not reserve fixed slots.

Both slots take their width from the `.ds-numeric-slot` rule the package
ships, driven by a `--ds-numeric-chars` count — so a consumer widens a slot in
CSS rather than by forking the component, and an app that imports no voice
(and therefore no `tokens/scales.css`) gets no reserved width at all.

`reservedUnitChars` pins the unit slot, which otherwise takes the width of the
unit string. Pin it wherever the unit itself changes — a latency readout that
counts in `ms`, then `s`, then `min` moves every cell to its right twice,
while the machine is doing nothing unusual: `reservedUnitChars={3}`.

The empty state has a size contract. The placeholder carries no font size of
its own, so it reads at whatever size the readout is set in, and the unit goes
muted beside it. `hideUnitWhenEmpty` drops the unit's text while the value is
null and keeps its reserved slot, so nothing shifts when the reading arrives.

Hero readouts — a single large figure on a monitor — are sized by the consumer
on a wrapper, never by the primitive:

```css
/* the app's theme.css */
:root { --x-hero-readout: 7rem; }
.hero-readout { font-size: var(--x-hero-readout); }
```

```tsx
<div className="hero-readout">
    <Numeric value={distance} unit="mm" precision={1} reservedChars={5} hideUnitWhenEmpty />
</div>
```

The size is a token and a class because `text-[7rem]` in a component is an L3
finding, and because the placeholder inherits the size: a hero readout with a
fixed small glyph is the regression this contract exists to prevent.

`StatusPill status={tone}` uses this shared mapping (also exported as
`STATUS_STATES` and `StatusState<Tone>`):

| Tone | States |
|---|---|
| success | healthy, live |
| warning | degraded, stale, lost |
| danger | error, invalid, offline |
| info | connecting |
| neutral | unknown, loading |

Always show a meaningful label: color alone is insufficient. No status may
blink or pulse, including errors; the shared CSS disables animations and
transitions on the pill and its descendants. Optional `detail` supplements
that label with a tooltip on a focusable trigger; wrap the app in
`TooltipProvider`. Keep actionable or essential information in visible UI.

`BuildStamp` prints the app name, git describe and build time on an opaque
`bg-bg-elevated` plate with `text-text-secondary`. This pair is contrast-tested
in every voice/mode, including over bright imagery. The consumer supplies
metadata and chooses placement; the primitive does not fetch or invent it.
`buildTime` displays verbatim: an ISO 8601 string is wrapped in `<time>` with
the ISO value as its `datetime`, and a string the consumer has already worded
(`built 2026-01-01 00:00 UTC`) is printed as-is, without a `<time>` claiming a
datetime it is not. `formatBuildTime={(iso) => …}` words an ISO build time for
display while the machine-readable value stays the ISO string.

`DialogBody` owns internal scrolling inside `DialogContent`. Title,
description and actions stay outside the scroll region. The dialog reserves
spacing-4 viewport gutters using `svh`; flex layout subtracts actual header
and footer sizes. Every voice supplies the scrollbar colors and functional
bottom fade through its tokens. The fade is a scroll cue, not a decorative
gradient; do not remove it merely because a touch browser hides scrollbars.
