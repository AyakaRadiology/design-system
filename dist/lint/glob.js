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
const SPECIAL = /[.+^$()|{}[\]\\]/g;
export function globToRegExp(pattern) {
    // Only balanced braces with a comma at their own depth are alternation.
    const alternation = new Map();
    const braces = [];
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === "{") {
            braces.push({ start: i, commas: [] });
        }
        else if (pattern[i] === ",") {
            braces.at(-1)?.commas.push(i);
        }
        else if (pattern[i] === "}") {
            const brace = braces.pop();
            if (brace && brace.commas.length > 0) {
                alternation.set(brace.start, { end: i, boundaries: [...brace.commas, i] });
            }
        }
    }
    const compile = (start, end, separator = "") => {
        let out = "";
        for (let i = start; i < end; i++) {
            const char = pattern[i];
            const group = alternation.get(i);
            if (group) {
                const close = group.end;
                // Put a following slash inside each branch so a terminal **
                // can consume zero directories, including in nested braces.
                const slash = pattern[close + 1] === "/" && close + 1 < end;
                const suffix = slash ? "/" : close + 1 === end ? separator : "";
                const branches = [];
                let branchStart = i + 1;
                for (const boundary of group.boundaries) {
                    branches.push(compile(branchStart, boundary, suffix));
                    branchStart = boundary + 1;
                }
                out += `(?:${branches.join("|")})`;
                i = close + (slash ? 1 : 0);
                if (close + 1 === end)
                    separator = "";
            }
            else if (char === "*") {
                if (pattern[i + 1] === "*" && i + 1 < end) {
                    if (pattern[i + 2] === "/" && i + 2 < end) {
                        out += "(?:.*/)?";
                        i += 2;
                    }
                    else if (i + 2 === end && separator === "/") {
                        out += "(?:.*/)?";
                        separator = "";
                        i++;
                    }
                    else {
                        out += ".*";
                        i++;
                    }
                }
                else {
                    out += "[^/]*";
                }
            }
            else if (char === "?") {
                out += "[^/]";
            }
            else if (char !== undefined) {
                out += char.replace(SPECIAL, "\\$&");
            }
        }
        return out + separator;
    };
    return new RegExp(`^${compile(0, pattern.length)}$`, "s");
}
/** Does `path` (relative, `/`-separated) match any of these globs? */
export function matchesAny(path, patterns) {
    return patterns.some((pattern) => globToRegExp(pattern).test(path));
}
