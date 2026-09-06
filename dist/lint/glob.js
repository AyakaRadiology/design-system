/**
 * The small glob subset the config needs, compiled to a RegExp.
 *
 * Hand-rolled rather than pulled in: `exclude` patterns and `allow` paths are
 * matched here, and a lint gate that a consumer runs in CI should not grow a
 * dependency tree to answer "does this path look like that one". `include` is
 * handed to `node:fs`'s own globSync instead, which is why only the matching
 * half lives here.
 *
 * Supported: `**` across separators, `*` and `?` within one segment, and
 * `{a,b}` alternation. Everything else is a literal.
 */
const SPECIAL = /[.+^$()|[\]\\]/g;
export function globToRegExp(pattern) {
    let out = "";
    // Only a comma INSIDE braces is alternation; one in a path is a literal.
    let braceDepth = 0;
    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        if (char === "*") {
            if (pattern[i + 1] === "*") {
                // `**/` also matches zero directories, so `**/*.test.*` catches
                // a file at the root as well as one nested five deep.
                if (pattern[i + 2] === "/") {
                    out += "(?:.*/)?";
                    i += 2;
                }
                else {
                    out += ".*";
                    i += 1;
                }
            }
            else {
                out += "[^/]*";
            }
        }
        else if (char === "?") {
            out += "[^/]";
        }
        else if (char === "{") {
            braceDepth++;
            out += "(?:";
        }
        else if (char === "}" && braceDepth > 0) {
            braceDepth--;
            out += ")";
        }
        else if (char === "," && braceDepth > 0) {
            out += "|";
        }
        else if (char !== undefined) {
            out += char.replace(SPECIAL, "\\$&");
        }
    }
    return new RegExp(`^${out}$`);
}
/** Does `path` (relative, `/`-separated) match any of these globs? */
export function matchesAny(path, patterns) {
    return patterns.some((pattern) => globToRegExp(pattern).test(path));
}
