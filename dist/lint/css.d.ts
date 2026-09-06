/** Where a custom property was declared, and what it was set to. */
export interface CustomProperty {
    /** The containing selector or at-rule prelude — `:root`, `.dark`, `@theme inline`. */
    selector: string;
    value: string;
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
