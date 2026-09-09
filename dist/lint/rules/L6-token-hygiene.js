import { walkCustomProperties } from "../css.js";
/**
 * Tailwind theme namespaces. Inside `@theme` these produce utilities rather
 * than name a design token — `--color-x-needle-tracker` is how an extension
 * token becomes `text-x-needle-tracker` — so they are not custom properties
 * this rule has an opinion about.
 */
const TAILWIND_NAMESPACES = [
    "color-",
    "z-index-",
    "text-",
    "font-",
    "container-",
    "spacing-",
    "radius-",
    "shadow-",
    "ease-",
    "breakpoint-",
];
const isTailwindNamespace = (name, selector) => selector.startsWith("@theme") && TAILWIND_NAMESPACES.some((prefix) => name.startsWith(prefix));
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
export const L6 = {
    id: "L6",
    description: "custom property that is not a schema token or an --x- extension",
    checkCss(file, root, context) {
        const findings = [];
        const isTheme = file === context.themeFile;
        for (const { name, selector, line, col } of walkCustomProperties(root)) {
            if (isTailwindNamespace(name, selector))
                continue;
            const at = { rule: "L6", file, line, col };
            if (context.schemaTokens.has(name)) {
                if (!isTheme)
                    findings.push({
                        ...at,
                        message: `schema token --${name} redefined in ${file} — only ${context.themeFile} may set a schema token`,
                    });
                continue;
            }
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
