import type { Rule } from "../types.js";
/**
 * L4 — dark mode is handled in the voice, once.
 *
 * A `dark:` colour twin in a component is a second copy of a decision the
 * voice already made, and the two copies drift. The `@theme inline` mapping in
 * tailwind.css is what makes the twin unnecessary: the utility keeps the
 * `var()` reference, so the voice's `.dark` block swaps the value underneath it.
 */
export declare const L4: Rule;
