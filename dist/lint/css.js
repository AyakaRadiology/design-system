import postcss from "postcss";
/**
 * The chain of selectors and at-rule preludes enclosing a node, outermost
 * first. A declaration at the top of `:root` reads `":root"`; one inside
 * `@theme inline` reads `"@theme inline"`. Nesting is joined with a space, so
 * a `:root` inside a media query cannot be mistaken for a top-level one.
 */
function containerOf(node) {
    const parts = [];
    let current = node.parent;
    while (current && current.type !== "root") {
        if (current.type === "rule") {
            parts.unshift(current.selector);
        }
        else if (current.type === "atrule") {
            const atRule = current;
            parts.unshift(atRule.params ? `@${atRule.name} ${atRule.params}` : `@${atRule.name}`);
        }
        current = current.parent;
    }
    return parts.join(" ");
}
/**
 * Every `--name: value` declaration in a stylesheet, by property name without
 * the leading dashes.
 *
 * A name maps to a LIST because one token is legitimately declared more than
 * once — a light+dark voice declares every colour in `:root` and again in
 * `.dark` — and the validator has to be able to tell those two apart rather
 * than see the last one to win.
 */
export function collectCustomProperties(css) {
    const found = new Map();
    const root = postcss.parse(css);
    root.walkDecls((decl) => {
        if (!decl.prop.startsWith("--"))
            return;
        const name = decl.prop.slice(2);
        const list = found.get(name);
        const entry = { selector: containerOf(decl), value: decl.value.trim() };
        if (list)
            list.push(entry);
        else
            found.set(name, [entry]);
    });
    return found;
}
