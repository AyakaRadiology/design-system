import type { Rule } from "../types.js";
/**
 * A written-out colour, in any of the forms CSS accepts.
 *
 * Valid hex lengths exclude prose like `#1 in the queue`; the trailing
 * lookahead excludes identifier continuations like `#fff-icon` and `#fff_x`.
 * The function forms are anchored on `(` so that the
 * word "info" in a sentence is not read as a colour.
 */
export declare const COLOR_LITERAL: RegExp;
/**
 * L1 — no colour literals outside the theme file.
 *
 * This is the rule the whole package exists to make enforceable: one file
 * holds the values, everything else names a role. The theme file is exempt
 * because it is where the values legitimately live.
 */
export declare const L1: Rule;
