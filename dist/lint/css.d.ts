import postcss from "postcss";
/** Where a custom property was declared, and what it was set to. */
export interface CustomProperty {
    /** The containing selector or at-rule prelude — `:root`, `.dark`, `@theme inline`. */
    selector: string;
    value: string;
}
/** The same, plus the name and the source position a lint finding needs. */
export interface CustomPropertyDeclaration extends CustomProperty {
    /** Property name without the leading `--`. */
    name: string;
    line: number;
    col: number;
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
export declare function collectCustomProperties(css: string): Map<string, CustomProperty[]>;
/**
 * Every custom-property declaration in an already-parsed stylesheet, with its
 * source position.
 *
 * Separate from `collectCustomProperties` because the two callers want
 * different things: the schema validators want the declarations grouped by
 * name to answer "was this declared, and where"; a lint rule wants them one at
 * a time with a line and column to point at.
 */
export declare function walkCustomProperties(root: postcss.Root): Generator<CustomPropertyDeclaration>;
