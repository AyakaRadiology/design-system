import type postcss from "postcss";
import type ts from "typescript";
export declare const RULE_IDS: readonly ["L1", "L2", "L3", "L4", "L5", "L6", "L7"];
export type RuleId = (typeof RULE_IDS)[number];
export declare const SEVERITIES: readonly ["error", "warn", "off"];
export type Severity = (typeof SEVERITIES)[number];
/** One violation, located precisely enough for an editor to jump to it. */
export interface Finding {
    rule: RuleId;
    /** Path relative to the config's directory, so output is machine-independent. */
    file: string;
    line: number;
    col: number;
    message: string;
    severity: Exclude<Severity, "off">;
}
/**
 * What a rule returns. The severity is deliberately absent: a rule states that
 * something IS a violation, and the config decides how loudly to say so. A rule
 * that knew its own severity could quietly decline to report at all.
 */
export type RuleFinding = Omit<Finding, "severity">;
/** What every rule needs to know beyond the file it is looking at. */
export interface RuleContext {
    /** Path of the one file allowed to declare schema tokens, relative to the config. */
    themeFile: string;
    /** Schema token names, without the leading dashes. */
    schemaTokens: ReadonlySet<string>;
    /** The `x-` in `--x-needle-tracker`. */
    extensionPrefix: string;
}
export interface Rule {
    id: RuleId;
    description: string;
    checkTsx?(file: string, source: ts.SourceFile, context: RuleContext): RuleFinding[];
    checkCss?(file: string, root: postcss.Root, context: RuleContext): RuleFinding[];
}
