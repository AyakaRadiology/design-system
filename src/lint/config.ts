import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { RULE_IDS, type RuleId, SEVERITIES, type Severity } from "./types.js";

/**
 * One allowlist entry. The `reason` is not decoration: an allowlist without
 * reasons becomes a list nobody can ever shorten, because no one remembers
 * which entries were temporary. An entry without one is a config error, not a
 * pass.
 */
export interface AllowEntry {
    rule: RuleId;
    /** A path or glob, relative to the config file's directory. */
    path: string;
    reason: string;
}

export interface Config {
    include: string[];
    exclude: string[];
    /** The one file allowed to declare schema tokens. */
    themeFile: string;
    rules: Record<RuleId, Severity>;
    allow: AllowEntry[];
    /** Absolute directory the paths above are relative to. */
    root: string;
}

/** A config that cannot be read or does not hold together. Exit code 2. */
export class ConfigError extends Error {}

function fail(message: string): never {
    throw new ConfigError(message);
}

function stringArray(value: unknown, field: string): string[] {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string"))
        fail(`"${field}" must be an array of strings`);
    return value as string[];
}

function parseRules(value: unknown): Record<RuleId, Severity> {
    if (typeof value !== "object" || value === null) fail(`"rules" must be an object`);
    const raw = value as Record<string, unknown>;
    for (const key of Object.keys(raw))
        if (!RULE_IDS.includes(key as RuleId))
            fail(`"rules" names ${key}, which is not one of ${RULE_IDS.join(", ")}`);

    const rules = {} as Record<RuleId, Severity>;
    for (const id of RULE_IDS) {
        const severity = raw[id];
        // A rule left out is OFF rather than a default: a consumer adopting the
        // package turns rules on one at a time, and silently enabling one it
        // never named would fail a build for a rule nobody chose.
        if (severity === undefined) {
            rules[id] = "off";
            continue;
        }
        if (!SEVERITIES.includes(severity as Severity))
            fail(`"rules.${id}" is ${JSON.stringify(severity)}; expected "error", "warn" or "off"`);
        rules[id] = severity as Severity;
    }
    return rules;
}

function parseAllow(value: unknown): AllowEntry[] {
    if (value === undefined) return [];
    if (!Array.isArray(value)) fail(`"allow" must be an array`);
    return value.map((entry, index) => {
        const where = `allow[${index}]`;
        if (typeof entry !== "object" || entry === null) fail(`${where} must be an object`);
        const raw = entry as Record<string, unknown>;
        if (!RULE_IDS.includes(raw.rule as RuleId))
            fail(
                `${where}.rule is ${JSON.stringify(raw.rule)}; expected one of ${RULE_IDS.join(", ")}`,
            );
        if (typeof raw.path !== "string" || raw.path.trim() === "")
            fail(`${where}.path must be a non-empty path or glob`);
        if (typeof raw.reason !== "string" || raw.reason.trim() === "")
            fail(
                `${where} exempts ${String(raw.path)} from ${String(raw.rule)} with no reason. ` +
                    `Every allowlist entry carries one, so that the list can be shortened later ` +
                    `by someone who was not there when it was written.`,
            );
        return { rule: raw.rule as RuleId, path: raw.path, reason: raw.reason };
    });
}

/**
 * Read and check a `design-lint.json`.
 *
 * Hand-written rather than schema-validated on purpose: this is the only shape
 * the CLI reads, and a validation dependency in a gate every consumer installs
 * costs more than the forty lines above.
 */
export function loadConfig(path: string): Config {
    const absolute = resolve(path);
    let text: string;
    try {
        text = readFileSync(absolute, "utf8");
    } catch {
        fail(`cannot read ${absolute}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch (error) {
        fail(`${absolute} is not valid JSON: ${(error as Error).message}`);
    }
    if (typeof parsed !== "object" || parsed === null) fail(`${absolute} must contain an object`);
    const raw = parsed as Record<string, unknown>;

    if (typeof raw.themeFile !== "string" || raw.themeFile.trim() === "")
        fail(`"themeFile" must name the one file allowed to declare schema tokens`);

    return {
        include: stringArray(raw.include, "include"),
        exclude: raw.exclude === undefined ? [] : stringArray(raw.exclude, "exclude"),
        themeFile: raw.themeFile,
        rules: parseRules(raw.rules),
        allow: parseAllow(raw.allow),
        root: dirname(absolute),
    };
}
