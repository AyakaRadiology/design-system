import type { Rule } from "../types.js";
/**
 * L2 — no inline styles except geometry and custom properties.
 *
 * An object literal is checked key by key. A `style` value that is NOT an
 * object literal (a variable, a spread) is reported too: this rule can only
 * see what the file spells out, and a hole a rule cannot see through is a hole
 * a component will eventually be pushed through.
 */
export declare const L2: Rule;
