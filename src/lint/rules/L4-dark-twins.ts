import type ts from "typescript";
import { findInStringLiterals } from "../tsx.js";
import type { Rule, RuleFinding } from "../types.js";

// These prefixes are overloaded in Tailwind: e.g. text-lg sets font-size,
// while text-accent sets colour. Exclude non-colour values as whole utilities
// so a custom colour such as bg-cover-art still counts as a colour twin.
const END = String.raw`(?=!?\s|!$|$)`;
const NON_COLOR = [
    String.raw`bg-\[(?:url|image|image-set|cross-fade|element|(?:repeating-)?(?:linear|radial|conic)-gradient)\([^\]]+\)\]`,
    String.raw`bg-(?:auto|cover|contain|none|fixed|local|scroll|clip-\S+|origin-\S+|repeat(?:-[xy]|-round|-space)?|no-repeat|(?:top|bottom|left|right|center)(?:-(?:top|bottom|left|right))?|(?:linear|radial|conic|gradient)-\S+|blend-\S+)`,
    String.raw`text-(?:xs|sm|base|lg|[2-9]?xl)(?:/\S+)?`,
    "text-(?:left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)",
    String.raw`border-(?:[xysetrbl]|collapse|separate|solid|dashed|dotted|double|hidden|none|spacing-\S+)`,
    String.raw`(?:border(?:-[xysetrbl])?|ring(?:-offset)?|outline(?:-offset)?|stroke|from|via|to)-(?:\d+(?:\.\d+)?(?:%|/\S+)?|\[(?:length:|number:|percentage:)?-?[\d.]+(?:px|rem|em|%|vw|vh)?\])`,
    "(?:ring|outline)-inset",
    "outline-(?:solid|dashed|dotted|double|hidden|none)",
    "shadow-(?:2xs|xs|sm|md|lg|xl|2xl|none|inner)",
    String.raw`(?:bg|text|border|ring|outline|shadow|stroke)-\[(?:length|size|position|image|url|number):[^\]]+\]`,
].join("|");

/** `dark:` on a utility that sets a colour. */
const DARK_COLOR_TWIN = new RegExp(
    String.raw`\bdark:(?:[\w-]+:)*(?!(?:${NON_COLOR})${END})(?:bg|text|border|ring|fill|stroke|outline|shadow|from|to|via)-`,
);

/**
 * L4 — dark mode is handled in the voice, once.
 *
 * A `dark:` colour twin in a component is a second copy of a decision the
 * voice already made, and the two copies drift. The `@theme inline` mapping in
 * tailwind.css is what makes the twin unnecessary: the utility keeps the
 * `var()` reference, so the voice's `.dark` block swaps the value underneath it.
 */
export const L4: Rule = {
    id: "L4",
    description: "dark: variant on a colour utility",

    checkTsx(file: string, source: ts.SourceFile): RuleFinding[] {
        return findInStringLiterals(
            file,
            source,
            "L4",
            DARK_COLOR_TWIN,
            (match) =>
                `${match}… — drop the dark: twin and use the semantic token; the voice's .dark block already swaps the value`,
        );
    },
};
