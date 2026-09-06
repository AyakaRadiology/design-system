import ts from "typescript";
import { positionAt, walk } from "../tsx.js";
import type { Rule, RuleFinding } from "../types.js";

/** The intrinsic elements the package ships a primitive for. */
const RAW_CONTROLS: Record<string, string> = {
    button: "Button or IconButton",
    input: "Input",
    select: "Select",
    textarea: "Input",
    dialog: "Dialog",
};

/**
 * L5 — controls come from the package.
 *
 * A raw control is where hand-rolled focus rings, ad-hoc heights and missing
 * aria labels get in. Lowercase tags only: `<Button>` is the primitive, and
 * `<button>` is the thing it replaces.
 */
export const L5: Rule = {
    id: "L5",
    description: "raw control element instead of a primitive",

    checkTsx(file: string, source: ts.SourceFile): RuleFinding[] {
        const findings: RuleFinding[] = [];
        walk(source, (node) => {
            if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
            const tag = node.tagName;
            // An intrinsic element is a lowercase identifier; anything else is a
            // component reference and none of this rule's business.
            if (!ts.isIdentifier(tag)) return;
            const name = tag.text;
            const replacement = RAW_CONTROLS[name];
            if (!replacement) return;
            findings.push({
                rule: "L5",
                file,
                ...positionAt(source, node.getStart()),
                message: `raw <${name}> — use ${replacement} from @ayaka/design-system/react`,
            });
        });
        return findings;
    },
};
