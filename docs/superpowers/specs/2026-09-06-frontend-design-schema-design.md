# Frontend design schema, per-repo voices, and hardware-free development

Date: 2026-09-06. Status: approved direction ("it's all yours", Harry, 2026-09-06);
the costly-to-reverse decisions are listed in §9 with their reasons.

## 1. Purpose

Three frontends (needle-guide; needle-simulator `apps/desktop`; needle-simulator
`apps/annotator`) each invent their own visual system, hand-roll every control,
and can only be exercised end to end with hardware attached. This design gives
them, and every future project, one shared **schema** (what tokens and
primitives exist), selectable **voices** (what values they take), a per-repo
**extension** layer (what only that product needs), a mechanical **gate** that
keeps the three apart, and a **fake layer** at each app's transport boundary so
the UI runs and is tested with nothing plugged in.

The owner's requirement that shaped the split: he should not have to decide
what is shared and what is repo-specific. The decision procedure in §4 is
therefore written for an agent, and the parts that can be checked are checked.

## 2. What the audit found (2026-09-05, read-only)

| | needle-guide | simulator/desktop | simulator/annotator |
|---|---|---|---|
| Stack | Electron 39, React 19, Vite 8, **CSS Modules**, Biome | **Tauri 2**, React 19, Vite 8, Tailwind 4, ESLint | React 19, Vite 8, Tailwind 4, ESLint |
| Tokens | 2 CSS vars used twice; 67 colour literals, 38 px sizes | 73 CSS vars in `globals.css`, bypassed in 19/24 files (188 inline styles) | class-name map `src/theme/semanticColors.ts` with a source-scan test |
| Primitives | none; 11 raw `<button>`, no button class | none; 24 raw `<button>`; `StatusBar.tsx` is one 570-line function | none |
| State | 9 independent `useConfig()` IPC subscriptions, `window.api` in 13 files | 17 Zustand stores, healthy | react-query |
| Hardware-free | `just dev-sim` (full stack + Tk simulator); renderer cannot open in a browser | mock WS + recorded v1/v2 fixtures + DICOM fixture harness; assembled by hand per script | nothing; tests stub `fetch` with a hand-mirrored copy of backend semantics |
| e2e | none | 5 Playwright specs in chromium | none |

Non-frontend layers are sound in both repos and stay out of scope here. The
design-relevant precedent is `needle-protocol`: public repo, committed `dist/`,
CI regenerates and diffs, release-please, consumers pin `github:…#vX.Y.Z`.

## 3. Architecture

### 3.1 Three layers

```
┌──────────────────────────────────────────────────────────────┐
│ schema      @ayaka/design-system   (repo AyakaRadiology/design-system)
│   tokens/schema.json   token NAMES, roles, types, required flag
│   voices/*.css         VALUE sets that satisfy the schema
│   tailwind.css         @theme inline mapping → bg-bg, text-accent, …
│   react/               primitives (props are the contract)
│   bin/design-lint      the gate every consumer runs
│   AGENTS.md            §4 procedure, verbatim
├──────────────────────────────────────────────────────────────┤
│ voice       chosen per repo, values only
│   base (light+dark)  · biomonitor (dark-only instrument)  · <future>
├──────────────────────────────────────────────────────────────┤
│ extension   per repo, in that repo
│   src/styles/theme.css   @import voice; overrides; --x-* domain tokens
│   src/components/…       domain components (NeedleVisualizer, MprViewer)
└──────────────────────────────────────────────────────────────┘
```

**Schema** answers "what is a surface, a border, a text level, an accent, a
status, a type step, a spacing step, a radius, a z-layer, a motion duration".
It is the current `~/.claude/skills/ui/tokens.css` name set, made explicit as
`tokens/schema.json` so it can be validated, plus the `--chart-*` and
`--trace-glow` names the biomonitor voice already adds.

**Voice** answers "what values". `base` is the skill's light/dark set;
`biomonitor` is the skill's dark-only set (currently worn by spine). A voice
must define every required schema token and nothing outside the schema;
CI proves it (§5.2).

**Extension** answers "what only this product knows". Colours for DICOM
crosshairs, tracker vs fused needle, frame states labeled/predicted/excluded.
They are CSS custom properties prefixed `--x-`, declared in the repo's
`theme.css`, and derived from schema tokens wherever a schema token exists
(`--x-frame-labeled: var(--success)`).

### 3.2 Package layout (`AyakaRadiology/design-system`)

```
tokens/schema.json          # the master schema (names, role, type, required)
tokens/scales.css           # voice-independent scales: type, fonts, z-layers, motion
tailwind.css                # @theme inline mapping of colour tokens → utilities
voices/base.css             # voice: base light+dark (imports scales + tailwind.css)
voices/biomonitor.css       # voice: biomonitor dark-only (+ VOICE.md rules)
react/                      # Button, IconButton, Panel, Field(+Input/Select/Switch),
                            # StatusPill, Dialog, Tooltip, Toolbar, Numeric
lint/                       # design-lint rules + schema validator + contrast
bin/design-lint             # CLI: `design-lint [--config design-lint.json]`
tools/gen.sh                # builds dist/ (committed, diffed in CI)
dist/                       # committed build artifact (needle-protocol pattern)
docs/superpowers/specs/     # this document
AGENTS.md                   # §4 verbatim + how to add a voice / promote a token
```

Subpath exports: `@ayaka/design-system/voices/base.css`,
`…/voices/biomonitor.css`, `…/tailwind.css`, `…/react`, bin `design-lint`.

Radix UI primitives (`@radix-ui/react-dialog`, `-tooltip`, `-switch`,
`-select`) and `class-variance-authority` + `tailwind-merge` are the only
runtime dependencies. No shadcn generator: shadcn copies files into each app,
which is the copy-drift this design removes.

### 3.3 Consumer wiring

```css
/* src/styles/theme.css — the ONLY file that may redefine schema tokens */
@import "tailwindcss";
@import "@ayaka/design-system/voices/biomonitor.css"; /* pulls in scales + tailwind mapping */

:root {
  /* overrides (values only; each line carries a reason) */
  --accent: oklch(0.80 0.12 195); /* desktop keeps its cyan phosphor */

  /* extensions: domain tokens, --x- prefixed, derived where possible */
  --x-dicom-crosshair: var(--accent);
  --x-needle-tracker: var(--chart-1);
  --x-needle-fused: var(--chart-2);
}
@theme inline {
  --color-x-dicom-crosshair: var(--x-dicom-crosshair);
  /* … */
}
```

Both needle apps start on `biomonitor` (dark-only instrument UI is what they
already are). The base voice stays for light tool UIs. Divergence between
needle-guide and simulator is a values change in each repo's `theme.css`; if
the overrides grow into a look, it becomes a new voice in the package (the
skill's existing rule).

## 4. The assignment procedure (what goes where)

Written for the agent doing the work. Mechanical checks in **bold**.

Token:
1. Name a role a tool UI has regardless of product (surface, border, text
   level, accent, status, chart series, type step, z-layer, motion)?
   → schema. Add it to `tokens/schema.json` and to every voice in the same
   PR. **CI fails a voice missing a required token.**
2. Same role, different value? → voice override in `theme.css`.
   **design-lint fails a schema token redefined anywhere else.**
3. A concept of the product (DICOM, needle, frame state, plan)? → extension
   `--x-*` in `theme.css`. **design-lint fails an unprefixed custom property
   in app CSS and fails an `--x-` name that duplicates a schema role.**

Component:
4. Props carry no domain type (Button, Panel, Field, Dialog, Numeric) AND a
   second repo needs it → package. One repo → that repo, even if it looks
   generic. Promotion is a PR to the package when the second consumer appears.
5. Props carry a domain type (NeedleData, Volume, PairState) → repo.

Look:
6. A deliberate new look → new voice in the package with `VOICE.md`, never a
   pile of overrides. Rule of thumb: more than ~8 schema overrides in one
   `theme.css` is a voice.

## 5. Gates

### 5.1 `design-lint` (runs in every consumer's CI, config `design-lint.json`)

| Rule | Fails on | Exemption |
|---|---|---|
| L1 colour literal | `#hex`, `rgb()`, `hsl()`, `oklch()` in app TSX/CSS | `theme.css`; files listed with a reason |
| L2 inline style | `style={{` keys that are not `--*` custom properties or geometry (`transform`, `width`, `height`, `left`, `top`, `opacity`) | none |
| L3 off-scale | Tailwind arbitrary values `[13px]`; spacing steps 5/7/9/11 | width/max-width utilities (skill rule) |
| L4 dark twins | `dark:` on a colour utility | none |
| L5 raw controls | `<button`, `<input`, `<select`, `<dialog` in app code | the package; files listed with a reason |
| L6 token hygiene | custom property in app CSS not `--x-`; `--x-` name equal to a schema role; schema token redefined outside `theme.css` | none |
| L7 z-index literal | numeric `z-index` / `z-[n]` | `theme.css` z-layer tokens |

Every allowlist entry carries a reason string; an entry without one fails.
Each rule has `warn` or `error` in the config. A consumer's adoption
sub-project is done only when every rule is `error` (§7).

### 5.2 Package CI (public repo, hosted runners, needle-protocol pattern)

- `tools/gen.sh` then `git diff --exit-code -- dist/` (stale artifact fails).
- schema validation: every voice defines every required token, no unknowns.
- contrast: spine's `frontend/src/lib/contrast.ts` ported as the package's
  test; every voice's AA pairs (text/bg, accent-fg/accent, status-fg/status)
  ≥ 4.5, biomonitor's chart-vs-status ΔE floor kept.
- `design-lint` runs against `react/` itself.
- vitest on primitives (render, variants, keyboard/focus via Radix).
- release-please, node release type, `bump-minor-pre-major`, tags `v*`.

### 5.3 What the `ui` skill becomes

The skill keeps the prose rules (density, scale, anti-patterns, voice rules)
and drops `tokens.css` and `voices/` — those move into the package so there
is one copy. Its setup section becomes "add the package, import a voice, run
design-lint". Projects that cannot take a dependency copy
`voices/base.css` from the package at a named tag, and say which.

## 6. Hardware-free development

Principle: fake at the **transport boundary**, complete **by type**, driven by
**named scenarios**, launched by **one command**, and the **same fake** serves
dev, unit tests and e2e. Every bug found with hardware becomes a scenario.

### 6.1 needle-guide

- `src/fake/FakeApi.ts` — `class FakeApi implements Window['api']`. Because
  it `implements` the preload type, adding an IPC method without extending the
  fake is a compile error.
- `src/fake/scenarios/` — `steady`, `sweep`, `disconnect`, `invalid`,
  `impact`, `garbage-65g` (issue #374), `reconnect`. A scenario is a script of
  timed IPC events.
- Vite plugin: when `VITE_FAKE_API=<scenario>` the fake is installed before
  `main.tsx` mounts. `just dev-fake [scenario]` runs Vite alone, in a browser,
  with HMR. No Electron, no Python.
- vitest: `installFakeApi(scenario)` replaces the 13 partial hand stubs.
- Playwright e2e in chromium against the Vite dev server (the simulator's
  approach), one spec per scenario, run in CI.
- `just dev-sim` (full stack) stays for the Electron ↔ Python boundary; a
  `--headless --scenario` mode for `scripts/simulator.py` is a later step.

### 6.2 needle-simulator / desktop

Already has the pieces (`tests/e2e/mockServer.ts`, recorded v1/v2 fixtures,
`NEEDLE_BROWSER_FIXTURE` DICOM harness, `scripts/fake-nav-theta.ts`). Work:
- `just dev-desktop-fake [scenario]` starts mock WS + nav-theta fake + plan
  channel fake and passes the port through Vite `define`, replacing the
  manual `localStorage["NEEDLE_E2E_WS"]` step.
- Scenarios as fixture files: existing `steady-v1`, `steady-v2` plus `lost`,
  `reconnect`, `status-error`, `garbage`. Fixtures are validated against the
  wire types in a test so a recorded file cannot silently go stale.
- DICOM stays on the existing harness; a small synthetic volume for CI is a
  follow-up, not part of this design.

### 6.3 needle-simulator / annotator

Greenfield. Decision: run the **real FastAPI app on a fixture dataset**
(`ANNOTATOR_FIXTURE=1` → in-memory SQLite seeded deterministically with a
handful of synthetic image pairs), not MSW. Reason: the current test fake is a
hand-maintained mirror of backend semantics and has already drifted; the real
app on fixture data cannot drift. Adds `just dev-annotator-fake`, Playwright
e2e in CI, and `openapi-typescript` generation of `src/types/api.ts` with a
drift check (the codegen the file's own header promised and never got).

## 7. Adoption sequence (sub-projects; each gets its own plan)

| # | Sub-project | Done when |
|---|---|---|
| S1 | `design-system` v0.1: repo, schema, both voices, tailwind mapping, 9 primitives, design-lint, CI, release-please. infra: `rulesets/repos.json` entry, rulesets applied, `ui` skill rewritten. | v0.1.0 tagged; skill has no token values |
| S2 | desktop adoption: dep, `theme.css` mapping the 73 vars to schema + `--x-`, design-lint warn→error, primitives replace raw controls, `StatusBar`/`MprViewer`/`AxialSlices` split, fake launcher + scenarios | all L-rules `error`; no file > 300 lines in `src/components`, `src/panels`; `just dev-desktop-fake` in README |
| S3 | annotator adoption: dep, `semanticColors.ts` on schema utilities, design-lint error, fixture backend, e2e, OpenAPI codegen + drift check | all L-rules `error`; `types/api.ts` generated; e2e in CI |
| S4 | needle-guide adoption: Tailwind 4 + dep, `theme.css`, 67 literals → tokens, design-lint error, one `window.api` adapter + Zustand store (single subscription), `FakeApi` + scenarios + `just dev-fake` + Playwright, primitives, `ui/`→`features/` restructure, `AGENTS.md` CSS rule replaced | all L-rules `error`; `useConfig` subscribes once; e2e in CI; AGENTS.md matches code |
| S5 | pin freshness: scheduled job in both consumer repos that opens a bump PR when `needle-protocol` or `design-system` has a newer tag (Dependabot cannot follow `github:` pins) | a stale pin produces a PR within a day |

Order S1 → S2 → S3 → S4 → S5. S2 before S4 because desktop already runs
Tailwind 4 and its fakes exist, so it proves the package with the least
migration; S4 is the largest change and benefits from a proven v0.x.

## 8. Six months from now, what broke

- **Pins went stale** (manual step): `needle-protocol` already has no bump
  mechanism. S5 closes it for both packages.
- **Two copies of the tokens** (one-way sync): the skill's `tokens.css` would
  drift from the package. S1 deletes the skill copy.
- **Tokens bypassed again** (drift): happened once already in desktop. L1/L2
  in `error` mode is the fix; §7 makes `error` the done criterion, so a
  sub-project cannot close in `warn`.
- **`--x-` sprawl re-creating schema roles** (drift): L6 collision check;
  the monthly advisor pass gets `design-system` in its bundle so promotions
  are proposed, not remembered.
- **Fakes drift from the real transport** (silent failure): needle-guide's
  fake is type-bound to the preload; desktop fixtures are validated against
  wire types; annotator runs the real backend.
- **The package's docs describe a stack it doesn't ship** (drift; happened in
  `docs/frontend.md`): S2–S4 add a test that the CSS entry imports the voice
  it documents and that `package.json` has the dependency the docs name.

## 9. Decisions (costly to reverse) and reasons

1. **Repo `AyakaRadiology/design-system`, public.** Mirrors `needle-protocol`:
   public means free hosted CI and unauthenticated `github:` installs; the
   org runner group refuses public repos anyway, and Lin214ia hosted Actions
   is billing-blocked today. Transfer later keeps redirects.
2. **Package `@ayaka/design-system`, git-tag distribution, committed `dist/`.**
   Same mechanism as `needle-protocol`; no registry account to manage.
3. **Tailwind 4 in needle-guide, replacing the CSS Modules mandate.** One
   idiom across three apps outweighs the migration; CSS Modules stay allowed
   for keyframes and complex selectors only. `AGENTS.md` changes in S4.
4. **Radix primitives + cva, no shadcn copy-in.** Copy-in is the drift
   pattern being removed.
5. **Both needle apps start on the `biomonitor` voice.** They are dark
   instrument UIs today; identical is the correct first state, divergence is
   a values PR.
6. **Annotator fakes = real FastAPI on fixture data, not MSW.**
7. **Not in scope:** Storybook, visual regression screenshots, a synthetic
   DICOM volume for CI, i18n. Each is a separate decision when needed.
