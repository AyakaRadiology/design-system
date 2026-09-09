# AGENTS.md — working on `@ayaka/design-system`

This package is the schema layer for every frontend in the fleet: it says what
tokens and primitives exist, ships the value sets ("voices") that satisfy the
schema, and ships the `design-lint` gate that keeps consumers from inventing
their own. The design that produced it is
`docs/superpowers/specs/2026-09-06-frontend-design-schema-design.md`; the
density and scale rules the primitives implement are `docs/ui-rules.md`.

## What goes where

Reproduced verbatim from §4 of the spec. It is written for the agent doing the
work, so that nobody has to decide case by case what is shared and what is
repo-specific. Mechanical checks in **bold**.

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

## Adding a voice

1. Copy `voices/base.css` to `voices/<name>.css`. Keep **every** schema token:
   the validator fails a voice that drops a required one, and fails a voice
   that declares a name the schema does not know.
2. A dark-only voice declares its values on `:root` and has no `.dark` block
   (see `voices/biomonitor/VOICE.md` rule 1). A light+dark voice declares the
   light values on `:root` and every required *colour* token again on `.dark`.
3. Write `voices/<name>/VOICE.md`: when to reach for the voice, the rules that
   make it read as itself, and what it is not.
4. `bun run test` must stay green — `src/lint/voices.test.ts` holds every voice
   to the same contrast floors and to the series-vs-status ΔE separation. Fix
   the values, never the floor.
5. `bun run validate-voices` must exit 0.

## Promoting a repo `--x-` token

A repo-local extension becomes schema when a second product needs the same
role. One PR does all of it, or the schema and the voices drift:

1. Add the name to `tokens/schema.json` with its type, role and `doc`.
2. Add a value to **every** voice under `voices/`.
3. If it is a colour, add the `--color-<name>: var(--<name>);` line to
   `tailwind.css` so the utility exists.
4. Note it in the PR body; release-please puts a `feat` commit in the CHANGELOG,
   which is what tells consumers a new token is available.
5. The consumer PR that drops its `--x-` alias is separate and comes after the
   package is tagged.

## Commits and pull requests

- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`,
  `test:`, `build:`, `ci:`, `perf:` …). The type decides the release bump, so
  `feat` for a new token or primitive and `fix` for a corrected value.
- Never commit to `main`. Branch, open a PR as **ready** (never draft), enable
  auto-merge on green: `gh pr merge --auto --squash`.
- If CI fails, fix the code. Never weaken a test, relax a floor, add a
  `design-lint` allow entry without a real reason, or edit the workflow to make
  a check pass.
- Never merge the release PR (`chore(main): release X.Y.Z`) — cutting a release
  is the owner's decision. Never create or push a tag by hand.

## Design review context

Impeccable reviews read `PRODUCT.md` and the generated `DESIGN.md` at the root.
The house schema, UI rules and selected voice constrain reviews; detector
suggestions do not authorize changing the brand or consumer terminology.
Edit token/rule sources, then run `bun run design:generate`. Never hand-edit
`DESIGN.md`: `bun run design:check` regenerates in memory and compares bytes,
and runs first in the existing **Quality Check** CI job via `bun run check`.
The deliberate Inter exception lives in `.impeccable/config.json`; it is a
value-level brand decision, not a disabled rule or file-wide exclusion.

## Local verification

```
bun install
bun run check     # gen + typecheck + lint + test + voice validation + design-lint + dist diff
```

`bun run check` is exactly what CI's `Quality Check` job runs. `dist/` is a
committed build artifact: run `bun run gen` and commit the result whenever
`src/` changes, and never hand-edit a file under `dist/`.
