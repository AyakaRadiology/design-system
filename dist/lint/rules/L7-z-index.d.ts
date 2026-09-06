import type { Rule } from "../types.js";
/**
 * L7 — no z-index literals.
 *
 * Four layers exist and the gaps between them are the design. A component that
 * picks its own number is deciding, alone and permanently, that it sits above
 * something it has never seen.
 */
export declare const L7: Rule;
