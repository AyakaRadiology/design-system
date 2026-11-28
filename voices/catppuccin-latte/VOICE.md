# Voice: catppuccin-latte

The [Catppuccin](https://catppuccin.com/palette) Latte palette, Catppuccin's
one light flavour, on the house schema. `../catppuccin-latte.css` carries the
gate-verified values (the same floors as every voice).

## When to reach for it

The light choice of an app that already wears a Catppuccin dark flavour and
lets its user pick, usually through `themes/catppuccin.css`. On its own, for a
tool that has to be light and should feel like the Catppuccin family.

## The rules that make it read as itself

The rules of `../catppuccin-macchiato/VOICE.md` hold, with two differences:

1. **Light only, and the palette's own ladder.** Page is mantle, panels and
   floating content are base, wells and hover are crust. Floating content is
   told apart by its border and shadow, because Latte has nothing lighter than
   base.
2. **More steps off the palette.** Latte is low-contrast on its light ground:
   green, yellow and blue are 2.3–4.3:1 on base as the palette gives them. Each
   status is taken deeper on its own hue, and four of the five series are too;
   every such value says so in the CSS.

## What this voice is not

Not a light mode of another voice: a single-mode voice. An app that switches
between flavours uses the theme set, not two voice imports.
