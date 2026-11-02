import { findInStringLiterals, isThemeFile } from "../tsx.js";
/**
 * A written-out colour, in any of the forms CSS accepts.
 *
 * Valid hex lengths exclude prose like `#1 in the queue`; the trailing
 * lookahead excludes identifier continuations like `#fff-icon` and `#fff_x`.
 * The function forms are anchored on `(` so that the
 * word "info" in a sentence is not read as a colour.
 */
export const COLOR_LITERAL = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(/i;
// URL contents are references, not colours. Respect quotes and escaped closing
// parentheses so a URL cannot hide a real colour later in the declaration.
const CSS_URL = /\burl\(\s*(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|(?:\\[\s\S]|[^)"'\\])*)\s*\)/gi;
const MESSAGE = (match) => `colour literal ${match} — use a semantic token utility (bg-accent, text-text-secondary, border-border) or a --x- extension declared in the theme file`;
/**
 * L1 — no colour literals outside the theme file.
 *
 * This is the rule the whole package exists to make enforceable: one file
 * holds the values, everything else names a role. The theme file is exempt
 * because it is where the values legitimately live.
 */
export const L1 = {
    id: "L1",
    description: "colour literal outside the theme file",
    checkTsx(file, source, context) {
        if (isThemeFile(file, context))
            return [];
        return findInStringLiterals(file, source, "L1", COLOR_LITERAL, MESSAGE);
    },
    checkCss(file, root, context) {
        if (isThemeFile(file, context))
            return [];
        const findings = [];
        root.walkDecls((decl) => {
            const match = COLOR_LITERAL.exec(decl.value.replace(CSS_URL, ""));
            if (!match)
                return;
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
