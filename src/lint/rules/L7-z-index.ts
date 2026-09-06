import type postcss from "postcss";
import type ts from "typescript";
import { findInStringLiterals, isThemeFile } from "../tsx.js";
import type { Rule, RuleContext, RuleFinding } from "../types.js";

/** `z-[60]` or `z-50` — a stacking number chosen at the point of use. */
const Z_UTILITY = /\bz-(?:\[[^\]]*\]|\d+)/;

const NUMERIC = /^-?\d+$/;

const MESSAGE =
    "stacking numbers belong to the layer tokens — use z-raised, z-overlay, z-modal or z-toast (or var(--z-modal) in CSS)";

/**
 * L7 — no z-index literals.
 *
 * Four layers exist and the gaps between them are the design. A component that
 * picks its own number is deciding, alone and permanently, that it sits above
 * something it has never seen.
 */
export const L7: Rule = {
    id: "L7",
    description: "numeric z-index instead of a layer token",

    checkTsx(file: string, source: ts.SourceFile): RuleFinding[] {
        return findInStringLiterals(
            file,
            source,
            "L7",
            Z_UTILITY,
            (match) => `${match} — ${MESSAGE}`,
        );
    },

    checkCss(file: string, root: postcss.Root, context: RuleContext): RuleFinding[] {
        if (isThemeFile(file, context)) return [];
        const findings: RuleFinding[] = [];
        root.walkDecls("z-index", (decl) => {
            if (!NUMERIC.test(decl.value.trim())) return;
            findings.push({
                rule: "L7",
                file,
                line: decl.source?.start?.line ?? 1,
                col: decl.source?.start?.column ?? 1,
                message: `z-index: ${decl.value} — ${MESSAGE}`,
            });
        });
        return findings;
    },
};
