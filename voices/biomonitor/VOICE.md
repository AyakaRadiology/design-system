# Voice: biomonitor

Patient-telemetry aesthetics for dashboards and monitors the owner glances at.
First worn by spine (PRs #11–12); `../biomonitor.css` carries the gate-verified
values (every AA pair ≥ 6.6, chart-vs-status ΔE ≥ 10.5, dataviz validator ALL
PASS on the dark surface).

## When to reach for it

A personal or small-team monitoring surface — system health, agents, money,
telemetry — where the page's job is "is everything alive, and did anything need
me?" and the owner should *enjoy* looking at it. Not for content/reading
surfaces or marketing.

## The rules that make it read as an instrument

1. **Dark only, blue-cast, layered.** No light mode, no toggle. Surfaces step
   ~0.04–0.05 L apart (page → card → well); the steps ARE the depth — no
   `shadow-*` anywhere. Never pure black: hue 225 at low chroma everywhere.
2. **Warm-white text on cold surfaces** (hue ~100 vs ~225) — the temperature
   contrast is half the look.
3. **Numerals are mono, and that's a constant, not a habit.** One shared
   constant (spine: `NUMERIC = "font-mono tabular-nums"`) applied to every
   figure, cost, age, counter. Micro-labels/eyebrows: mono, `text-xs`,
   `uppercase tracking-widest`, secondary color. Prose stays in the sans.
   Container-level mono over short label phrases is fine — it reads as an
   instrument caption, not a bug.
4. **One glow, on the signature element only** (`--trace-glow`, accent-derived).
   Everything else is flat and bordered. A second glow demotes the first.
5. **Status hues are alarms, series hues are data** — never cross them, and the
   signature draws in the accent phosphor regardless of state: you read the
   *rhythm*, not the color (a color-coded signature is just a third status dot).
   Status labels never blink or pulse in any state; use the shared mapping
   in `docs/ui-rules.md` and `StatusPill`'s enforced static treatment. Dialog
   scrollbars use secondary text against the elevated surface; the functional
   bottom fade is the sole scroll-cue exception to the no-gradients rule.
6. **Pick the signature from the subject's own world.** spine is a nervous
   system, so its signature is a live EKG in the header: steady rhythm when
   healthy, idle grey until data arrives, a flatline exactly when the staleness
   alarm fires. Derive yours the same way — from what the product *is*, driven
   by real state, with `prefers-reduced-motion` honored (static, never absent).
7. **Mechanize the look's invariants.** Contrast floors, series/status ΔE
   separation, and a dark-only guard that rejects any second theme block. This
   package does all three for every voice in `src/lint/voices.test.ts`, ported
   from spine's `frontend/src/lib/contrast.{ts,test.ts}`, so a voice added here
   inherits them rather than re-deriving them.

## What this voice is not

Not a hacker terminal (pure black + single acid accent), not glassmorphism, not
gradients. The base ui skill's scale/density rules all still hold — this voice
only re-values the tokens and adds the rules above.
