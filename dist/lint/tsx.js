import ts from "typescript";
/**
 * Parse a TS/TSX file for linting.
 *
 * `setParentNodes` is on because several rules need to ask what encloses a
 * node. No type information is built: every rule here is syntactic, and a
 * consumer's CI should not pay for a full program to be told it wrote a hex
 * colour.
 */
export function parseTsx(file, text) {
    return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}
/** 1-based line and column of an absolute offset. */
export function positionAt(source, offset) {
    const { line, character } = source.getLineAndCharacterOfPosition(offset);
    return { line: line + 1, col: character + 1 };
}
/** Every node in the tree, in source order. */
export function walk(node, visit) {
    visit(node);
    node.forEachChild((child) => walk(child, visit));
}
/**
 * Every string the source spells out: a quoted literal, a bare template, and
 * each fixed chunk of a template with substitutions.
 *
 * Class names are the reason this is not restricted to `className` attributes.
 * A variant table built with `cva()`, a `cn()` call, a constant at the top of
 * the file — all of them hold class strings that never appear inside a JSX
 * attribute, and a rule that only looked at attributes would pass every one of
 * them.
 */
export function forEachStringLiteral(source, visit) {
    walk(source, (node) => {
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            visit(node.text, node.getStart() + 1);
        }
        else if (ts.isTemplateHead(node) ||
            ts.isTemplateMiddle(node) ||
            ts.isTemplateTail(node)) {
            visit(node.text, node.getStart() + 1);
        }
    });
}
/** Report every match of `pattern` in every string literal of the file. */
export function findInStringLiterals(file, source, rule, pattern, message) {
    const findings = [];
    forEachStringLiteral(source, (text, start) => {
        // A fresh RegExp per string: a shared /g/ instance carries lastIndex
        // between calls and would skip roughly half the matches.
        for (const match of text.matchAll(new RegExp(pattern.source, `${pattern.flags}g`))) {
            const offset = match.index ?? 0;
            findings.push({
                rule,
                file,
                ...positionAt(source, Math.min(start + offset, source.text.length)),
                message: message(match[0]),
            });
        }
    });
    return findings;
}
/** Is this the one file allowed to declare and redefine schema tokens? */
export function isThemeFile(file, context) {
    return file === context.themeFile;
}
