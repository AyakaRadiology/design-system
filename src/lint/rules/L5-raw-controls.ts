import ts from "typescript";
import { positionAt, walk } from "../tsx.js";
import type { Rule, RuleFinding } from "../types.js";

/** The intrinsic elements the package ships a primitive for. */
const RAW_CONTROLS: Record<string, string> = {
    button: "Button or IconButton",
    input: "Input",
    select: "Select",
    dialog: "Dialog",
};

function mayAllowMultiple(attributes: ts.JsxAttributes): boolean {
    return attributes.properties.some((attribute) => {
        if (!ts.isJsxAttribute(attribute) || attribute.name.getText() !== "multiple") return false;
        const initializer = attribute.initializer;
        const value =
            initializer && ts.isJsxExpression(initializer) ? initializer.expression : undefined;
        return value?.kind !== ts.SyntaxKind.FalseKeyword;
    });
}

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
            // Select is single-choice. Keep the native control if multiple selection may be enabled.
            if (name === "select" && mayAllowMultiple(node.attributes)) return;

            const replacement = RAW_CONTROLS[name];
            const guidance =
                name === "textarea"
                    ? "keep the textarea for multiline input and request a design review"
                    : replacement && `use ${replacement} from @ayaka/design-system/react`;
            if (!guidance) return;
            findings.push({
                rule: "L5",
                file,
                ...positionAt(source, node.getStart()),
                message: `raw <${name}> — ${guidance}`,
            });
        });
        return findings;
    },
};
