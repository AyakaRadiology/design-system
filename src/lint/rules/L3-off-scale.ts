import type ts from "typescript";
import { findInStringLiterals } from "../tsx.js";
import type { Rule, RuleFinding } from "../types.js";

/** A Tailwind arbitrary length: `text-[13px]`, `w-[7.5rem]`. */
const ARBITRARY_LENGTH = /\[[0-9.]+(?:px|rem|em)\]/;

/**
 * Spacing utilities on a step the scale does not have.
 *
 * Carbon's steps are 0.5, 1, 1.5, 2, 3, 4, 6, 8, 10, 12 — never 5, 7, 9 or 11.
 * Width and max-width utilities are exempt by construction: they are not in
 * this prefix list, because `w-96` and `max-w-3xl` are the sanctioned way to
 * size a container.
 */
const OFF_SCALE_SPACING =
    /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-(?:5|7|9|11)\b/;

const PATTERN = new RegExp(`${ARBITRARY_LENGTH.source}|${OFF_SCALE_SPACING.source}`);

/**
 * L3 — no values off the scale.
 *
 * An arbitrary value is either a step that exists (use it) or a value the
 * design needs repeatedly (promote it to a token). It is never a one-off.
 */
export const L3: Rule = {
    id: "L3",
    description: "arbitrary value or off-scale spacing step",

    checkTsx(file: string, source: ts.SourceFile): RuleFinding[] {
        return findInStringLiterals(
            file,
            source,
            "L3",
            PATTERN,
            (match) =>
                `off the scale: ${match} — use the nearest allowed step (spacing 0.5 1 1.5 2 3 4 6 8 10 12, never 5/7/9/11), or promote the value to a token if it is needed repeatedly`,
        );
    },
};
