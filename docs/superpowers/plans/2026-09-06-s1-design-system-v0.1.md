# S1 — `design-system` v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `AyakaRadiology/design-system` v0.1.0: the token schema, two voices, the Tailwind mapping, nine React primitives, the `design-lint` gate, CI that proves all of it, and release automation — installable by consumers as `github:AyakaRadiology/design-system#v0.1.0`.

**Architecture:** One public repo mirroring `needle-protocol`'s distribution (committed `dist/`, CI regenerates and diffs, release-please). Tokens are CSS custom properties whose *names* are declared in `tokens/schema.json` and whose *values* live in voice files; a validator proves each voice against the schema; `design-lint` is a standalone CLI (TypeScript compiler API for TSX, postcss for CSS) that consumers run in CI.

**Tech Stack:** bun, TypeScript 5.9, React 19 (peer), Tailwind 4 (peer, CSS-first `@theme`), Radix UI (`react-dialog`, `react-tooltip`, `react-switch`, `react-select`), `class-variance-authority`, `tailwind-merge`, postcss (lint dep), vitest + @testing-library/react (jsdom), Biome, release-please.

**Spec:** `docs/superpowers/specs/2026-09-06-frontend-design-schema-design.md` (in this repo). Read it first; §3 layout, §4 procedure, §5 gates are normative.

**Amended 2026-09-06**, after the desktop inventory found a fourth surface tier: Task 2's token list gains the required colour `bg-elevated` (role surface) — popovers, menus, dialogs and tooltips, the depth cue where a voice forbids shadows. Shipped in PR #8, which also moved `DialogContent`, the `Select` menu and the `Tooltip` onto it. This note is here rather than a silent edit because a plan that quietly grows to match the code stops being a record of what was decided.

## Global Constraints

- Repo: `AyakaRadiology/design-system`, PUBLIC, default branch `main`. After Task 1, every change goes through a PR with auto-merge on green; never push to main directly.
- Package name `@ayaka/design-system`; `"private": false`; `"files"` lists `dist`, `tokens`, `voices`, `tailwind.css`, `bin`, `README.md`, `AGENTS.md`.
- Peer deps: `react ^19`, `react-dom ^19`, `tailwindcss ^4`. Runtime deps ONLY: the four Radix packages, `class-variance-authority`, `tailwind-merge`, `postcss`, `typescript` (design-lint parses with the TS API; keep it a runtime dep of the CLI). No others without a stated reason in the PR.
- CI workflow file `.github/workflows/ci.yml`, job name exactly `Quality Check`, `runs-on: ubuntu-latest` (public repo → free hosted minutes; the org's self-hosted group refuses public repos). No path filters (a filtered-out PR never reports the required check).
- Token names: exactly the sets in Task 2. Extension prefix `x-`. Every schema token is a CSS custom property without the `--` in `schema.json` keys.
- Density/scale rules from `~/.claude/skills/ui/SKILL.md` (copy the file into the repo as `docs/ui-rules.md` in Task 1 so the repo is self-contained): controls `h-8 px-3 rounded-md text-sm`, icon buttons `size-8`, panels `p-4`, weights 400/500/600 only, spacing steps 0.5–12 without 5/7/9/11, radii `md`/`lg`/`full` only, shadows `xs`/`sm` max.
- Conventional Commits; commit trailer on every commit:
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and
  `Claude-Session: https://claude.ai/code/session_017f18dxXHYmYVekMGktzqbM`.
- Scratch files only under `/home/harry/.claude/jobs/a2d2f00c/tmp` (`mktemp -d -p …`), never bare `/tmp`.
- Working copy: clone to `~/dev/design-system`; feature branches in worktrees `~/worktrees/design-system/<branch>` (branch name = dir name).

---

### Task 1: Repository bootstrap, CI skeleton, release automation

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.build.json`, `biome.json`, `vitest.config.ts`, `README.md`, `AGENTS.md`, `docs/ui-rules.md` (copy of `~/.claude/skills/ui/SKILL.md` minus its "Setup" section), `docs/superpowers/specs/2026-09-06-frontend-design-schema-design.md` (from `/home/harry/.claude/jobs/a2d2f00c/tmp/`), `docs/superpowers/plans/2026-09-06-s1-design-system-v0.1.md` (this file), `.github/workflows/ci.yml`, `.github/workflows/release-please.yml`, `release-please-config.json`, `.release-please-manifest.json` (`{".": "0.0.0"}` so the first release is 0.1.0 via `initial-version`), `.gitignore`, `tools/gen.sh` (initially: `bun run build`), `src/index.ts` (empty export).
- Templates to copy from: `/home/harry/dev/needle-protocol/.github/workflows/{ci.yml,release-please.yml}`, `/home/harry/dev/needle-protocol/release-please-config.json`, `tsconfig*.json`, `tools/`.

**Interfaces:**
- Produces: `bun run gen` (= `tools/gen.sh`, builds `dist/`), `bun run typecheck`, `bun run lint` (biome), `bun run test` (vitest), `bun run check` (all four + `git diff --exit-code -- dist/`). CI runs `bun run check`.

- [ ] Step 1: `gh repo create AyakaRadiology/design-system --public --description "Frontend design schema, voices and primitives for Harry's tool UIs" --clone` into `~/dev/design-system`.
- [ ] Step 2: Write `package.json` (name `@ayaka/design-system`, version `0.0.0`, `type: module`, `exports` map with `./voices/*.css`, `./tailwind.css`, `./tokens/schema.json`, `./react` → `dist/react/index.js` + types, `./package.json`; `bin: { "design-lint": "bin/design-lint.js" }`; scripts above; peer deps; dev deps: typescript, biome, vitest, jsdom, @testing-library/react, @types/react, react, react-dom, tailwindcss). Run `bun install`.
- [ ] Step 3: Copy/adapt tsconfigs, biome, vitest config (jsdom env, `src/**/*.test.{ts,tsx}`), `.gitignore` (node_modules, coverage; **dist/ is NOT ignored**).
- [ ] Step 4: `release-please-config.json`: node release type, `bump-minor-pre-major: true`, `include-component-in-tag: false`, `initial-version: 0.1.0`, changelog sections as needle-protocol. Workflow copied verbatim.
- [ ] Step 5: `ci.yml`: on push main / tags v* / pull_request; permissions contents:read; setup-node 24 + setup-bun; `bun install --frozen-lockfile`; `bun run check`. Job name `Quality Check`.
- [ ] Step 6: `AGENTS.md`: paste spec §4 verbatim under "What goes where", then "Adding a voice" (copy `voices/base.css`, keep every schema token, add `VOICE.md`, contrast test must pass), "Promoting a repo `--x-` token" (PR adds to schema.json + every voice + tailwind.css + CHANGELOG entry), and the commit/PR rules above. `README.md`: install snippet (`bun add github:AyakaRadiology/design-system#v0.1.0`), consumer wiring from spec §3.3, design-lint usage.
- [ ] Step 7: Initial commit on `main` (the only direct push allowed): `chore: bootstrap design-system (spec, plan, CI, release-please)`. Push. Confirm `Quality Check` runs green on main (empty test suite passes; `vitest run --passWithNoTests`).
- [ ] Step 8: Report the repo URL in the task report; the infra builder adds the ruleset (`rulesets/repos.json` → `"AyakaRadiology/design-system": ["Quality Check"]`).

### Task 2: Token schema, scales, voices, Tailwind mapping, schema validator

**Files:**
- Create: `tokens/schema.json`, `tokens/scales.css`, `tailwind.css`, `voices/base.css`, `voices/biomonitor.css`, `voices/biomonitor/VOICE.md` (copy of `~/.claude/skills/ui/voices/biomonitor/VOICE.md`), `src/lint/schema.ts`, `src/lint/schema.test.ts`, `src/lint/css.ts` (postcss helpers: `collectCustomProperties(css: string): Map<string, {selector: string; value: string}[]>`).
- Sources: `~/.claude/skills/ui/tokens.css` (base values + `@theme` scales + `@theme inline` mapping + `@layer base`), `~/.claude/skills/ui/voices/biomonitor/tokens.css`.

**Interfaces:**
- Produces `tokens/schema.json`:
  ```json
  {
    "version": 1,
    "extensionPrefix": "x-",
    "tokens": {
      "<name>": { "type": "color|font|length|integer|duration|easing|shadow", "role": "surface|border|text|accent|status|series|signature|type|font|z|motion", "required": true|false, "doc": "…" }
    }
  }
  ```
  Names (required unless noted): colours `bg bg-subtle bg-muted bg-elevated border border-strong text text-secondary text-tertiary accent accent-hover accent-fg accent-subtle success success-subtle success-fg warning warning-subtle warning-fg danger danger-hover danger-subtle danger-fg info info-subtle info-fg`; series `chart-1 … chart-5` (required); signature `trace-glow` (type shadow, **optional**); fonts `font-sans font-mono`; type `text-xs text-xs--line-height text-sm text-sm--line-height text-base text-base--line-height text-lg text-lg--line-height text-xl text-xl--line-height text-2xl text-2xl--line-height`; container `container-prose-page`; z `z-raised z-overlay z-modal z-toast` (integer: 10, 100, 1000, 1100); motion `motion-fast motion-base` (duration: 120ms, 200ms) and `ease-standard` (easing: `cubic-bezier(0.2, 0, 0, 1)`).
- `tokens/scales.css`: (1) the `@theme { … }` block from the skill's tokens.css (fonts, type ramp, container), extended with `--z-index-raised: 10; --z-index-overlay: 100; --z-index-modal: 1000; --z-index-toast: 1100;` so `z-raised`, `z-overlay`, `z-modal`, `z-toast` exist as Tailwind utilities; (2) a `:root { --z-raised: 10; … --motion-fast: 120ms; --motion-base: 200ms; --ease-standard: cubic-bezier(0.2, 0, 0, 1); }` block for use from CSS (`var(--z-modal)`); (3) the `@layer base` body/focus block from the skill. The validator treats `--z-index-*` inside `@theme` as Tailwind namespace (exempt), and `--z-*`/`--motion-*`/`--ease-*` in `:root` as schema tokens.
- `tailwind.css`: exactly the skill's `@theme inline { --color-… }` block plus `--color-chart-1..5: var(--chart-1..5)`. Nothing else.
- `voices/base.css`: `@custom-variant dark (&:where(.dark, .dark *));` + the skill's `:root {}` and `.dark {}` colour blocks + `--chart-1..5` for both (base voice needs series colours: use the skill's `dataviz` placeholder palette if present in `~/.claude/skills/dataviz/references/palette.md`; otherwise five hue-spaced oklch values at L 0.55/0.75 light/dark with chroma 0.12) + `@import "../tokens/scales.css"; @import "../tailwind.css";` at the top.
- `voices/biomonitor.css`: the biomonitor `tokens.css` colours (`:root` only, dark-only, includes `--chart-*` and `--trace-glow`) + the same two imports. No `.dark` block (VOICE.md rule 1).
- `src/lint/schema.ts` exports `validateVoice(css: string, schema: Schema): Violation[]` where `Violation = { code: "missing" | "unknown" | "type"; token: string; where: string }`. Rules: every `required` token declared in `:root`; if a `.dark` block exists it must declare every required *color* token; no custom property declared that is not in the schema (voices carry no `--x-`); `--color-*`, `--z-index-*`, `--text-*`, `--font-*`, `--container-*` inside `@theme` are exempt from "unknown" (they are Tailwind namespace, produced by scales/tailwind.css).

- [ ] Step 1: Write `src/lint/schema.test.ts`: (a) `voices/base.css` → no violations; (b) `voices/biomonitor.css` → no violations; (c) a fixture missing `--accent` → one `missing`; (d) a fixture declaring `--brand` → one `unknown`; (e) base fixture whose `.dark` lacks `--bg` → `missing` with `where: ".dark"`.
- [ ] Step 2: Run, see failures (files absent).
- [ ] Step 3: Create the CSS files and `schema.json`; implement `css.ts` (postcss parse; walk `rule.selector`/`atrule.name` for `theme`; collect decls starting with `--`) and `schema.ts`.
- [ ] Step 4: Tests pass. Add `bun run validate-voices` script (a tiny `tools/validate-voices.ts` that runs `validateVoice` over `voices/*.css` and exits 1 on violations) and include it in `bun run check`.
- [ ] Step 5: PR `feat(tokens): schema, scales, base and biomonitor voices, tailwind mapping`. Auto-merge.

### Task 3: Contrast and colour-distance gate for voices

**Files:**
- Create: `src/lint/contrast.ts`, `src/lint/contrast.test.ts`, `src/lint/voices.test.ts`.
- Source: `/home/harry/dev/spine/frontend/src/lib/contrast.ts` and `contrast.test.ts` (port; keep function names where sensible).

**Interfaces:**
- Produces: `parseOklch(value: string): {l,c,h,alpha}`, `oklchToSrgb`, `contrastRatio(fg: string, bg: string): number` (WCAG 2.x), `deltaE(a: string, b: string): number` (OKLab Euclidean ×100 or whatever spine uses — keep spine's definition and cite it in a comment).
- `voices.test.ts` runs for every `voices/*.css` file (and for `.dark` block when present): pairs `text/bg`, `text-secondary/bg`, `text/bg-subtle`, `accent-fg/accent`, `success-fg/success`, `warning-fg/warning`, `danger-fg/danger`, `info-fg/info` ≥ 4.5; `text-tertiary/bg` ≥ 3.0; every `chart-n` vs every status colour ΔE ≥ 10 (biomonitor VOICE.md rule 5; if a base pair fails, adjust the base chart palette, not the floor).

- [ ] Step 1: Write contrast unit tests from spine's (known pairs, e.g. white on black = 21).
- [ ] Step 2: Fail → port implementation → pass.
- [ ] Step 3: Write `voices.test.ts`, run; fix voice values only if a pair fails (record the change in the PR body with before/after ratios).
- [ ] Step 4: PR `feat(lint): contrast and ΔE gate over every voice`. Auto-merge.

### Task 4: `design-lint` CLI

**Files:**
- Create: `src/lint/config.ts`, `src/lint/rules/{L1-color-literal,L2-inline-style,L3-off-scale,L4-dark-twins,L5-raw-controls,L6-token-hygiene,L7-z-index}.ts`, `src/lint/run.ts`, `src/lint/cli.ts`, `bin/design-lint.js` (`#!/usr/bin/env node` importing `../dist/lint/cli.js`), `src/lint/rules/__fixtures__/<rule>/{fail.tsx|fail.css,pass.tsx|pass.css}`, tests `src/lint/rules/*.test.ts`, `src/lint/config.test.ts`, `src/lint/run.test.ts`, `design-lint.json` (the repo lints its own `src/react`).

**Interfaces:**
- Config (`design-lint.json`, resolved relative to cwd):
  ```json
  {
    "include": ["src/**/*.{ts,tsx,css}"],
    "exclude": ["**/*.test.*", "**/__fixtures__/**"],
    "themeFile": "src/styles/theme.css",
    "rules": { "L1": "error", "L2": "error", "L3": "error", "L4": "error", "L5": "error", "L6": "error", "L7": "error" },
    "allow": [ { "rule": "L5", "path": "src/legacy/OldButton.tsx", "reason": "replaced in #123" } ]
  }
  ```
  `rules` values `"error" | "warn" | "off"`. An `allow` entry without a non-empty `reason` is a config error (exit 2). `loadConfig(path): Config` validates shape with a hand-written checker (no zod dep).
- `Finding = { rule: "L1"…"L7"; file: string; line: number; col: number; message: string; severity: "error"|"warn" }`.
- Each rule module exports `{ id, description, checkTsx?(file, sourceFile: ts.SourceFile): Finding[]; checkCss?(file, root: postcss.Root): Finding[] }`.
- `run(config, cwd): { findings: Finding[]; exitCode: 0|1|2 }` — 1 when any `error` finding remains after allowlist; warnings print but do not fail.
- CLI: `design-lint [--config design-lint.json] [--format text|json]`. Text output one line per finding: `path:line:col L1 error message`.
- Rule semantics (TSX via `typescript` API, CSS via postcss):
  - L1: any string literal / template chunk in TSX, or any CSS decl value, matching `#[0-9a-f]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch|oklab|color-mix)\(` — except inside `themeFile`.
  - L2: JSX attribute `style` whose value is an object literal with a key not starting with `--` and not in `["transform","width","height","left","top","opacity"]`; any key whose value contains a colour literal is L1 too.
  - L3: className string containing `\[[0-9.]+(px|rem|em)\]` or `\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-(5|7|9|11)\b`.
  - L4: className token `dark:` followed by `(bg|text|border|ring|fill|stroke|outline|shadow|from|to|via)-`.
  - L5: JSX opening element with tag `button|input|select|textarea|dialog` (lowercase intrinsic only).
  - L6 (CSS): custom property declared outside `themeFile` → error unless name starts with `--x-`; inside any file, `--x-<name>` where `<name>` is a schema token → error "duplicates schema role"; schema token declared in a file other than `themeFile` → error. Schema comes from the package's own `tokens/schema.json`.
  - L7: CSS decl `z-index` with a numeric value, or className `z-\[` / `z-[0-9]`, outside `themeFile`.

- [ ] Step 1: For each rule write `fail`/`pass` fixtures and a test asserting the exact finding count and line numbers; a config test for the missing-reason error; a run test asserting allowlisted findings are dropped and exit codes.
- [ ] Step 2: Run → fail. Implement config, rules, run, cli. Run → pass.
- [ ] Step 3: `design-lint.json` for the repo itself; add `bun run design-lint` to `bun run check` (must pass on the repo's `src/react`, which at this point is empty; Task 5/6 keep it passing).
- [ ] Step 4: Smoke the bin after `bun run gen`: `node bin/design-lint.js --config design-lint.json` exits 0.
- [ ] Step 5: PR `feat(lint): design-lint CLI with rules L1–L7`. Auto-merge.

### Task 5: Primitives batch 1 — Button, IconButton, Numeric, StatusPill, Toolbar, Panel

**Files:**
- Create: `src/react/cn.ts` (`cn(...inputs) = twMerge(clsx-free join)` — use `tailwind-merge` only), `src/react/{Button,IconButton,Numeric,StatusPill,Toolbar,Panel}.tsx` + `.test.tsx`, `src/react/index.ts`.

**Interfaces (props are the contract; keep them this small):**
- `Button`: `variant?: "primary"|"secondary"|"ghost"|"danger"` (default secondary), `size?: "md"|"sm"` (md `h-8 px-3 text-sm`, sm `h-7 px-2 text-xs`), plus native button props; `type` defaults to `"button"`. Classes: primary `bg-accent text-accent-fg hover:bg-accent-hover`; secondary `border border-border-strong bg-bg text-text hover:bg-bg-subtle`; ghost `text-text hover:bg-bg-subtle`; danger `bg-danger text-danger-fg hover:bg-danger-hover`; all `inline-flex items-center gap-2 rounded-md font-medium disabled:opacity-50 disabled:pointer-events-none`. No focus classes (global `:focus-visible`).
- `IconButton`: same variants, `size-8` square, `aria-label: string` **required in the type**, children = icon.
- `Numeric`: `<span className="font-mono tabular-nums">{children}{unit && <span className="text-text-secondary"> {unit}</span>}</span>`; props `unit?: string`.
- `StatusPill`: `status: "success"|"warning"|"danger"|"info"|"neutral"`; `bg-<status>-subtle text-<status>` (neutral: `bg-bg-muted text-text-secondary`), `inline-flex h-5 items-center rounded-full px-2 text-xs font-medium`.
- `Toolbar`: `<div role="toolbar" className="flex items-center gap-2 border-b border-border bg-bg px-3 py-2">`.
- `Panel`: props `title?: ReactNode`, `actions?: ReactNode`, children; `rounded-lg border border-border bg-bg`; header `flex items-center justify-between border-b border-border px-4 py-2` with `text-sm font-semibold` title; body `p-4`.
- `index.ts` re-exports all.

- [ ] Step 1: Tests per component: renders, variant class present, `type="button"` default, disabled state, IconButton without aria-label is a type error (`// @ts-expect-error` test), Numeric renders unit with secondary colour, StatusPill maps each status, Panel renders header only when title/actions given.
- [ ] Step 2: Fail → implement → pass. `bun run design-lint` must stay green on `src/react` (L5 fires on the intrinsic `<button>` inside Button/IconButton: add the two allow entries with reason "this IS the primitive").
- [ ] Step 3: PR `feat(react): Button, IconButton, Numeric, StatusPill, Toolbar, Panel`. Auto-merge.

### Task 6: Primitives batch 2 — Field, Input, Select, Switch, Dialog, Tooltip

**Files:**
- Create: `src/react/{Field,Input,Select,Switch,Dialog,Tooltip}.tsx` + tests; update `index.ts`.

**Interfaces:**
- `Field`: `label: ReactNode`, `hint?: ReactNode`, `error?: ReactNode`, `htmlFor?: string`, children. Generates an id when `htmlFor` absent and passes `id`/`aria-describedby`/`aria-invalid` to a single child via `cloneElement`. Label `text-xs font-medium uppercase tracking-wide text-text-secondary`; error `text-xs text-danger`.
- `Input`: native input props; `h-8 w-full rounded-md border border-border-strong bg-bg px-3 text-sm placeholder:text-text-tertiary aria-invalid:border-danger`.
- `Select`: Radix Select wrapped: props `value`, `onValueChange`, `options: {value: string; label: ReactNode}[]`, `placeholder?`; trigger styled as Input; content `rounded-md border border-border bg-bg shadow-sm z-overlay`.
- `Switch`: Radix Switch; track `h-4 w-8 rounded-full p-0.5 bg-bg-muted data-[state=checked]:bg-accent`; thumb `size-3 rounded-full bg-bg data-[state=checked]:bg-accent-fg data-[state=checked]:translate-x-4`.
- `Dialog`: exports `Dialog` (Root), `DialogTrigger`, `DialogContent` with props `title: ReactNode`, `description?: ReactNode`, `actions?: ReactNode`, children; overlay `fixed inset-0 z-overlay bg-bg-subtle/80`; content `fixed left-1/2 top-1/2 z-modal w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg p-4 shadow-sm`.
- `Tooltip`: `TooltipProvider` re-export + `Tooltip` with props `content: ReactNode`, children (trigger); content `z-toast rounded-md border border-border bg-bg px-2 py-1 text-xs shadow-xs`.

- [ ] Step 1: Tests: Field wires `for`/`id` and `aria-describedby` to hint/error; Input aria-invalid styling attribute; Select opens and calls `onValueChange` (Radix in jsdom needs `pointer-events` polyfills — copy the standard `ResizeObserver`/`hasPointerCapture` stubs into `vitest.setup.ts`); Switch toggles `data-state`; Dialog renders title and closes on Escape; Tooltip shows content on focus.
- [ ] Step 2: Fail → implement → pass. design-lint green (allow entries for the intrinsic `<input>`/`<select>` inside Input/Select with reason).
- [ ] Step 3: PR `feat(react): Field, Input, Select, Switch, Dialog, Tooltip`. Auto-merge.

### Task 7: Build artifact, exports, consumer smoke test

**Files:**
- Modify: `tools/gen.sh` (tsc build of `src/react` and `src/lint` to `dist/` ESM + `.d.ts`; copy nothing else — CSS is exported from source paths), `package.json` exports.
- Create: `tests/consumer/` — a script (`bun tests/consumer/run.sh`) that `bun pm pack`s the repo, creates a scratch Vite+React+Tailwind app under `mktemp -d -p /home/harry/.claude/jobs/a2d2f00c/tmp` (in CI: `$RUNNER_TEMP`), installs the tarball, writes `src/styles/theme.css` per spec §3.3 (biomonitor + one `--x-` token), a `main.tsx` rendering `<Panel title="x"><Button>ok</Button></Panel>`, runs `vite build`, then runs `design-lint` in that app with a config where all rules are `error` and asserts exit 0; then appends `color: #fff` to a component and asserts exit 1.
- Copy `needle-protocol/tests/consumer` conventions if useful.

- [ ] Step 1: Write the consumer script with those assertions.
- [ ] Step 2: Implement gen.sh; `bun run gen`; commit `dist/`. Ensure `bun run check` includes `git diff --exit-code -- dist/` and the consumer smoke.
- [ ] Step 3: PR `build: committed dist, exports map, consumer smoke test`. Auto-merge.

### Task 8: Release 0.1.0 and hand-off

- [ ] Step 1: Confirm release-please opened `chore(main): release 0.1.0`. **Do NOT merge it** (Harry's rule: release PRs are his). Report its URL as **HUMAN ACTION REQUIRED: merge the release PR to cut v0.1.0**.
- [ ] Step 2: Until the tag exists, consumers pin the merge commit sha (`github:AyakaRadiology/design-system#<sha>`); the S2 plan switches to `#v0.1.0` afterwards. Record the sha in the report.
- [ ] Step 3: Report: repo URL, PR list with CI states, the release PR URL, the sha, and every deviation from this plan with its reason.
