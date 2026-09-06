import type ts from "typescript";
import { findInStringLiterals } from "../tsx.js";
import type { Rule, RuleFinding } from "../types.js";

/** `dark:` on a utility that sets a colour. `dark:flex` is none of this rule's business. */
const DARK_COLOR_TWIN = /\bdark:(?:bg|text|border|ring|fill|stroke|outline|shadow|from|to|via)-/;

/**
 * L4 — dark mode is handled in the voice, once.
 *
 * A `dark:` colour twin in a component is a second copy of a decision the
 * voice already made, and the two copies drift. The `@theme inline` mapping in
 * tailwind.css is what makes the twin unnecessary: the utility keeps the
 * `var()` reference, so the voice's `.dark` block swaps the value underneath it.
 */
export const L4: Rule = {
    id: "L4",
    description: "dark: variant on a colour utility",

    checkTsx(file: string, source: ts.SourceFile): RuleFinding[] {
        return findInStringLiterals(
            file,
            source,
            "L4",
            DARK_COLOR_TWIN,
            (match) =>
                `${match}… — drop the dark: twin and use the semantic token; the voice's .dark block already swaps the value`,
        );
    },
};
