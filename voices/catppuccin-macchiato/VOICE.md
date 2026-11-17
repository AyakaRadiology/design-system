# Voice: catppuccin-macchiato

The [Catppuccin](https://catppuccin.com/palette) Macchiato palette on the house
schema: soft pastels on slate-violet. `../catppuccin-macchiato.css` carries the
gate-verified values (the same floors as every voice: AA pairs ≥ 4.5, including
glass and the actual StatusPill pairs; chart-vs-status ΔE ≥ 10).

## When to reach for it

A tool someone sits in for hours and should find easy on the eyes: an
annotation workstation, an editor-like surface. Text on a panel is about 10:1
here against about 15:1 in biomonitor, and borders are one quiet step off the
surface. Not for a monitor that has to be read at a glance from across the
room (that is biomonitor), and not for anything that needs a light mode.

## The rules that make it read as itself

1. **Dark only, and the palette's own ladder.** Page is mantle, panels are
   base, wells and hover are surface0, floating content is surface1. No pure
   black, no pure white, no shadow on ordinary surfaces.
2. **Palette colours first.** A new interface colour in a product's
   `theme.css` comes from the Macchiato palette, with its name in a comment. A
   data vocabulary the user already learned (a colormap, an overlay legend)
   keeps its own colours. The values in the voice that step off the palette
   each say which floor forced it.
3. **Mauve is the accent; pastels mean something.** Green, yellow, red and
   blue are statuses and nothing else. A product whose own vocabulary already
   uses violet may override the accent with another palette colour.
4. **Borders stay quiet.** `border-border` is surface0, close to the surface on
   purpose; use `border-border-strong` where a control has to show its edge.
   The contrast in this voice comes from text, not from lines.
5. **No glow.** This voice has no signature element and no `--trace-glow`.

## What this voice is not

Not a general-purpose replacement for base or biomonitor, and not the other
Catppuccin flavours (Latte, Frappé, Mocha): those would be voices of their own.
The ui rules' scale and density all still hold; this voice only re-values the
tokens.
