import ts from "typescript";
import type { RuleContext, RuleFinding, RuleId } from "./types.js";
/**
 * Parse a TS/TSX file for linting.
 *
 * `setParentNodes` is on because several rules need to ask what encloses a
 * node. No type information is built: every rule here is syntactic, and a
 * consumer's CI should not pay for a full program to be told it wrote a hex
 * colour.
 */
export declare function parseTsx(file: string, text: string): ts.SourceFile;
export interface Position {
    line: number;
    col: number;
}
/** 1-based line and column of an absolute offset. */
export declare function positionAt(source: ts.SourceFile, offset: number): Position;
/** Every node in the tree, in source order. */
export declare function walk(node: ts.Node, visit: (node: ts.Node) => void): void;
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
export declare function forEachStringLiteral(source: ts.SourceFile, visit: (text: string, start: number) => void): void;
/** Report every match of `pattern` in every string literal of the file. */
export declare function findInStringLiterals(file: string, source: ts.SourceFile, rule: RuleId, pattern: RegExp, message: (match: string) => string): RuleFinding[];
/** Is this the one file allowed to declare and redefine schema tokens? */
export declare function isThemeFile(file: string, context: RuleContext): boolean;
