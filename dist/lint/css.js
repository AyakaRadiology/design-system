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
    for (const declaration of walkCustomProperties(postcss.parse(css))) {
        const list = found.get(declaration.name);
        const entry = {
            selector: declaration.selector,
            value: declaration.value,
        };
        if (list)
            list.push(entry);
        else
            found.set(declaration.name, [entry]);
    }
    return found;
}
/**
 * Every custom-property declaration in an already-parsed stylesheet, with its
 * source position.
 *
 * Separate from `collectCustomProperties` because the two callers want
 * different things: the schema validators want the declarations grouped by
 * name to answer "was this declared, and where"; a lint rule wants them one at
 * a time with a line and column to point at.
 */
export function* walkCustomProperties(root) {
    const declarations = [];
    root.walkDecls((decl) => {
        if (!decl.prop.startsWith("--"))
            return;
        declarations.push({
            name: decl.prop.slice(2),
            selector: containerOf(decl),
            value: decl.value.trim(),
            line: decl.source?.start?.line ?? 1,
            col: decl.source?.start?.column ?? 1,
        });
    });
    yield* declarations;
}
