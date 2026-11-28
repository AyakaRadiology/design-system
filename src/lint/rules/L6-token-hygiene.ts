import type postcss from "postcss";
import { walkCustomProperties } from "../css.js";
import type { Rule, RuleContext, RuleFinding } from "../types.js";

/**
 * Inside `@theme`, Tailwind namespaces configure utility classes and their
 * defaults. Schema tokens still follow this rule's ownership checks.
 */
const TAILWIND_NAMESPACES = [
    "color-",
    "z-index-",
    "text-",
    "font-",
    "leading-",
    "tracking-",
    "container-",
    "spacing-",
    "radius-",
    "shadow-",
    "animate-",
    "tab-size-",
    "inset-shadow-",
    "drop-shadow-",
    "blur-",
    "perspective-",
    "zoom-",
    "aspect-",
    "ease-",
    "default-",
    "breakpoint-",
];

const isTailwindThemeDeclaration = (name: string, selector: string, value: string) =>
    (selector === "@theme" || selector.startsWith("@theme ")) &&
    ((name === "*" && value === "initial") ||
        TAILWIND_NAMESPACES.some((prefix) => name.startsWith(prefix)));

/**
 * L6 — one file owns the tokens, and extensions say they are extensions.
 *
 * Three failures, and they are three different mistakes:
 *
 *   * a schema token redefined outside the theme file — the value now has two
 *     homes and the second one wins wherever it is imported last;
 *   * a custom property in app CSS with no `--x-` prefix — indistinguishable
 *     from a schema token at the point of use, so nobody can tell whether
 *     changing it is a local decision or a fleet-wide one;
 *   * an `--x-` name that duplicates a schema role — the sprawl this design
 *     was written to prevent, where every repo grows a private copy of
 *     `--accent` under a different name.
 */
export const L6: Rule = {
    id: "L6",
    description: "custom property that is not a schema token or an --x- extension",

    checkCss(file: string, root: postcss.Root, context: RuleContext): RuleFinding[] {
        const findings: RuleFinding[] = [];
        const isTheme = file === context.themeFile;

        for (const { name, selector, value, line, col } of walkCustomProperties(root)) {
            const at = { rule: "L6" as const, file, line, col };

            if (context.schemaTokens.has(name)) {
                if (!isTheme)
                    findings.push({
                        ...at,
                        message: `schema token --${name} redefined in ${file} — only ${context.themeFile} may set a schema token`,
                    });
                continue;
            }

            if (isTailwindThemeDeclaration(name, selector, value)) continue;

            if (name.startsWith(context.extensionPrefix)) {
                const bare = name.slice(context.extensionPrefix.length);
                if (context.schemaTokens.has(bare))
                    findings.push({
                        ...at,
                        message: `--${name} duplicates the schema role "${bare}" — use var(--${bare}), or promote a genuinely new role to tokens/schema.json`,
                    });
                continue;
            }

            findings.push({
                ...at,
                message: `--${name} is neither a schema token nor an extension — name a product-specific token --${context.extensionPrefix}${name}, and declare it in ${context.themeFile}`,
            });
        }
        return findings;
    },
};
