import { findInStringLiterals, isThemeFile } from "../tsx.js";
/** `z-[60]` or `z-50` — a stacking number chosen at the point of use. */
const Z_UTILITY = /(?<![\w-])-?z-(?:\[-?\d+\]|\d+)/;
const NUMERIC = /^-?\d+$/;
/** Hide bracket contents such as arbitrary variant selectors, preserving numeric values and offsets. */
function maskNonNumericBrackets(text) {
    const parts = [];
    let copied = 0;
    let start = 0;
    let depth = 0;
    let quote;
    for (const { 0: token, index } of text.matchAll(/\\[\s\S]|[[\]'"]/g)) {
        if (quote !== undefined) {
            if (token === quote)
                quote = undefined;
        }
        else if (token === "[") {
            if (depth === 0)
                start = index + 1;
            depth++;
        }
        else if (depth > 0) {
            if (token === "'" || token === '"')
                quote = token;
            if (token !== "]")
                continue;
            depth--;
            if (depth === 0 && !NUMERIC.test(text.slice(start, index))) {
                parts.push(text.slice(copied, start), "_".repeat(index - start));
                copied = index;
            }
        }
    }
    return parts.length === 0 ? text : parts.join("") + text.slice(copied);
}
const MESSAGE = "stacking numbers belong to the layer tokens — use z-raised, z-overlay, z-modal or z-toast (or var(--z-modal) in CSS)";
/**
 * L7 — no z-index literals.
 *
 * Four layers exist and the gaps between them are the design. A component that
 * picks its own number is deciding, alone and permanently, that it sits above
 * something it has never seen.
 */
export const L7 = {
    id: "L7",
    description: "numeric z-index instead of a layer token",
    checkTsx(file, source) {
        return findInStringLiterals(file, source, "L7", Z_UTILITY, (match) => `${match} — ${MESSAGE}`, maskNonNumericBrackets);
    },
    checkCss(file, root, context) {
        if (isThemeFile(file, context))
            return [];
        const findings = [];
        root.walkDecls(/^z-index$/i, (decl) => {
            if (!NUMERIC.test(decl.value.trim()))
                return;
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
