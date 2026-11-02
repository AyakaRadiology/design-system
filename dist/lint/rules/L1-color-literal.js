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
/** Hide resource identifiers, retaining offsets for TSX diagnostics. */
function withoutUrls(value) {
    const prefix = /\burl\(/gi;
    const parts = [];
    let copied = 0;
    for (let match = prefix.exec(value); match; match = prefix.exec(value)) {
        let end = prefix.lastIndex;
        while (end < value.length && /\s/.test(value.charAt(end)))
            end++;
        const quote = value[end] === '"' || value[end] === "'" ? value[end++] : null;
        while (end < value.length) {
            const char = value[end];
            if (char === "\\") {
                end += 2;
            }
            else if (quote ? char === quote : char === ")" || char === '"' || char === "'") {
                break;
            }
            else {
                end++;
            }
        }
        if (quote && value[end] === quote) {
            end++;
            while (end < value.length && /\s/.test(value.charAt(end)))
                end++;
        }
        else if (quote) {
            break;
        }
        // Never rescan a consumed suffix, even when the candidate is malformed.
        prefix.lastIndex = end;
        if (value[end] !== ")")
            continue;
        end++;
        parts.push(value.slice(copied, match.index), " ".repeat(end - match.index));
        copied = end;
        prefix.lastIndex = end;
    }
    parts.push(value.slice(copied));
    return parts.join("");
}
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
        return findInStringLiterals(file, source, "L1", COLOR_LITERAL, MESSAGE, withoutUrls);
    },
    checkCss(file, root, context) {
        if (isThemeFile(file, context))
            return [];
        const findings = [];
        root.walkDecls((decl) => {
            const match = COLOR_LITERAL.exec(withoutUrls(decl.value));
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
