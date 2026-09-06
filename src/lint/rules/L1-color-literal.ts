import type postcss from "postcss";
import type ts from "typescript";
import { findInStringLiterals, isThemeFile } from "../tsx.js";
import type { Rule, RuleContext, RuleFinding } from "../types.js";

/**
 * A written-out colour, in any of the forms CSS accepts.
 *
 * `\b` after the hex digits so that `#1 in the queue` is prose and
 * `#1e293b` is a slate. The function forms are anchored on `(` so that the
 * word "info" in a sentence is not read as a colour.
 */
export const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(/i;

const MESSAGE = (match: string) =>
    `colour literal ${match} — use a semantic token utility (bg-accent, text-text-secondary, border-border) or a --x- extension declared in the theme file`;

/**
 * L1 — no colour literals outside the theme file.
 *
 * This is the rule the whole package exists to make enforceable: one file
 * holds the values, everything else names a role. The theme file is exempt
 * because it is where the values legitimately live.
 */
export const L1: Rule = {
    id: "L1",
    description: "colour literal outside the theme file",

    checkTsx(file: string, source: ts.SourceFile, context: RuleContext): RuleFinding[] {
        if (isThemeFile(file, context)) return [];
        return findInStringLiterals(file, source, "L1", COLOR_LITERAL, MESSAGE);
    },

    checkCss(file: string, root: postcss.Root, context: RuleContext): RuleFinding[] {
        if (isThemeFile(file, context)) return [];
        const findings: RuleFinding[] = [];
        root.walkDecls((decl) => {
            const match = COLOR_LITERAL.exec(decl.value);
            if (!match) return;
            findings.push({
                rule: "L1",
                file,
                line: decl.source?.start?.line ?? 1,
                col: decl.source?.start?.column ?? 1,
                message: MESSAGE(match[0]),
            });
        });
        return findings;
    },
};
