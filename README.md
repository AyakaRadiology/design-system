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
`Input`, `Select`, `Switch`, `Dialog`, `Tooltip`. The props **are** the
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

## Working on it

```sh
bun install
bun run check
```

`bun run check` is what CI runs. Read `AGENTS.md` before adding a token, a
voice or a primitive — it carries the assignment procedure and the release
rules.
