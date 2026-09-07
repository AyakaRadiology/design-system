import ts from "typescript";
import { positionAt, walk } from "../tsx.js";
import type { Rule, RuleFinding } from "../types.js";

/**
 * Look through a type assertion or a parenthesis to the value being styled.
 *
 * A custom property has no place in React's `CSSProperties`, so the only way
 * to set one and keep the file type-checked is `{ "--x": n } as SomeStyle`.
 * The keys are still spelled out in the file, so they are still checkable —
 * and everything below still applies to them. What stays reported is the case
 * this rule exists for: a value whose keys the file does not name at all.
 */
function styleObject(expression: ts.Expression): ts.Expression {
    if (
        ts.isAsExpression(expression) ||
        ts.isSatisfiesExpression(expression) ||
        ts.isParenthesizedExpression(expression)
    ) {
        return styleObject(expression.expression);
    }
    return expression;
}

/**
 * The only style keys a component may set inline, because they are geometry
 * rather than design: a value the layout computes at runtime has nowhere else
 * to live. Anything else — a colour, a font, a padding — belongs in a class.
 */
const GEOMETRY = new Set(["transform", "width", "height", "left", "top", "opacity"]);

/**
 * L2 — no inline styles except geometry and custom properties.
 *
 * An object literal is checked key by key. A `style` value that is NOT an
 * object literal (a variable, a spread) is reported too: this rule can only
 * see what the file spells out, and a hole a rule cannot see through is a hole
 * a component will eventually be pushed through.
 */
export const L2: Rule = {
    id: "L2",
    description: "inline style that is neither a custom property nor geometry",

    checkTsx(file: string, source: ts.SourceFile): RuleFinding[] {
        const findings: RuleFinding[] = [];
        const report = (node: ts.Node, message: string) =>
            findings.push({ rule: "L2", file, ...positionAt(source, node.getStart()), message });

        walk(source, (node) => {
            if (!ts.isJsxAttribute(node) || node.name.getText() !== "style") return;
            const initializer = node.initializer;
            if (!initializer || !ts.isJsxExpression(initializer) || !initializer.expression) {
                report(node, "style attribute with no readable value");
                return;
            }
            const value = styleObject(initializer.expression);
            if (!ts.isObjectLiteralExpression(value)) {
                report(
                    node,
                    "style is not an object literal, so its keys cannot be checked — inline the object, or move the styling into a class",
                );
                return;
            }
            for (const property of value.properties) {
                if (ts.isSpreadAssignment(property)) {
                    report(
                        property,
                        "spread into style, so its keys cannot be checked — name the keys, or move the styling into a class",
                    );
                    continue;
                }
                const name = property.name;
                if (!name) continue;
                const key = ts.isComputedPropertyName(name)
                    ? null
                    : ts.isIdentifier(name) || ts.isStringLiteral(name)
                      ? name.text
                      : name.getText();
                if (key === null) {
                    report(property, "computed style key, so it cannot be checked");
                    continue;
                }
                if (key.startsWith("--") || GEOMETRY.has(key)) continue;
                report(
                    property,
                    `inline style "${key}" — only custom properties and geometry (${[...GEOMETRY].join(", ")}) may be set inline; everything else belongs in a class`,
                );
            }
        });
        return findings;
    },
};
