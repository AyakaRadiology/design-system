import { globSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import postcss from "postcss";
import type { Config } from "./config.js";
import { matchesAny } from "./glob.js";
import { RULES } from "./rules/index.js";
import { loadPackageSchema } from "./schema.js";
import { parseTsx } from "./tsx.js";
import type { Finding, RuleContext, RuleFinding, RuleId } from "./types.js";

export interface RunResult {
    findings: Finding[];
    /** 0 clean, 1 an error-severity finding remains, 2 the config is unusable. */
    exitCode: 0 | 1 | 2;
    /** How many files were read. Zero is reported, never silently passed. */
    filesChecked: number;
}

/** Paths use `/` in the config and in output, whatever the host separator is. */
const toPosix = (path: string) => path.split("\\").join("/");

function ruleContext(config: Config): RuleContext {
    const schema = loadPackageSchema();
    return {
        themeFile: toPosix(config.themeFile),
        schemaTokens: new Set(Object.keys(schema.tokens)),
        extensionPrefix: schema.extensionPrefix,
    };
}

/** The files the config selects, relative to its directory, in a stable order. */
export function selectFiles(config: Config): string[] {
    const found = globSync(config.include, { cwd: config.root })
        .map((path) => toPosix(relative(config.root, resolve(config.root, path))))
        .filter((path) => !matchesAny(path, config.exclude));
    return [...new Set(found)].sort();
}

/**
 * Lint everything the config selects.
 *
 * Allowlisting happens AFTER the rules run rather than by skipping files, so
 * that an entry which no longer suppresses anything is still visible as an
 * entry — a list that silently stops mattering is a list nobody ever removes
 * a line from.
 */
export function run(config: Config): RunResult {
    const context = ruleContext(config);
    const active = (Object.keys(RULES) as RuleId[]).filter((id) => config.rules[id] !== "off");
    const raw: RuleFinding[] = [];
    const files = selectFiles(config);

    for (const file of files) {
        const text = readFileSync(resolve(config.root, file), "utf8");
        const isCss = file.endsWith(".css");
        const source = isCss ? null : parseTsx(file, text);
        const root = isCss ? postcss.parse(text, { from: file }) : null;

        for (const id of active) {
            const rule = RULES[id];
            if (root && rule.checkCss) raw.push(...rule.checkCss(file, root, context));
            if (source && rule.checkTsx) raw.push(...rule.checkTsx(file, source, context));
        }
    }

    const allowed = (finding: RuleFinding) =>
        config.allow.some(
            (entry) => entry.rule === finding.rule && matchesAny(finding.file, [entry.path]),
        );

    const findings: Finding[] = raw
        .filter((finding) => !allowed(finding))
        .map((finding) => ({
            ...finding,
            // "off" rules never ran, so anything left is error or warn.
            severity:
                config.rules[finding.rule] === "warn" ? ("warn" as const) : ("error" as const),
        }))
        .sort(
            (a, b) =>
                a.file.localeCompare(b.file) ||
                a.line - b.line ||
                a.col - b.col ||
                a.rule.localeCompare(b.rule),
        );

    return {
        findings,
        exitCode: findings.some((finding) => finding.severity === "error") ? 1 : 0,
        filesChecked: files.length,
    };
}
