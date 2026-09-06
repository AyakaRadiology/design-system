import postcss from "postcss";

/** Where a custom property was declared, and what it was set to. */
export interface CustomProperty {
    /** The containing selector or at-rule prelude — `:root`, `.dark`, `@theme inline`. */
    selector: string;
    value: string;
}

/**
 * The chain of selectors and at-rule preludes enclosing a node, outermost
 * first. A declaration at the top of `:root` reads `":root"`; one inside
 * `@theme inline` reads `"@theme inline"`. Nesting is joined with a space, so
 * a `:root` inside a media query cannot be mistaken for a top-level one.
 */
function containerOf(node: postcss.Node): string {
    const parts: string[] = [];
    let current = node.parent;
    while (current && current.type !== "root") {
        if (current.type === "rule") {
            parts.unshift((current as postcss.Rule).selector);
        } else if (current.type === "atrule") {
            const atRule = current as postcss.AtRule;
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
export function collectCustomProperties(css: string): Map<string, CustomProperty[]> {
    const found = new Map<string, CustomProperty[]>();
    const root = postcss.parse(css);
    root.walkDecls((decl) => {
        if (!decl.prop.startsWith("--")) return;
        const name = decl.prop.slice(2);
        const list = found.get(name);
        const entry: CustomProperty = { selector: containerOf(decl), value: decl.value.trim() };
        if (list) list.push(entry);
        else found.set(name, [entry]);
    });
    return found;
}
