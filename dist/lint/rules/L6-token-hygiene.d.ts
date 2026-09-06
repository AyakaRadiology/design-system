import type { Rule } from "../types.js";
/**
 * L6 — one file owns the tokens, and extensions say they are extensions.
 *
 * Three failures, and they are three different mistakes:
 *
 *   * a schema token redefined outside the theme file — the value now has two
 *     homes and the second one wins wherever it is imported last;
 *   * a custom property in app CSS with no `--x-` prefix — indistinguishable
 *     from a schema token at the point of use, so nobody can tell whether
 *     changing it is a local decision or a fleet-wide one;
 *   * an `--x-` name that duplicates a schema role — the sprawl this design
 *     was written to prevent, where every repo grows a private copy of
 *     `--accent` under a different name.
 */
export declare const L6: Rule;
