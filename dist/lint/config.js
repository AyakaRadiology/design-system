import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { RULE_IDS, SEVERITIES } from "./types.js";
/** A config that cannot be read or does not hold together. Exit code 2. */
export class ConfigError extends Error {
}
function fail(message) {
    throw new ConfigError(message);
}
function stringArray(value, field) {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string"))
        fail(`"${field}" must be an array of strings`);
    return value;
}
function parseRules(value) {
    if (typeof value !== "object" || value === null)
        fail(`"rules" must be an object`);
    const raw = value;
    for (const key of Object.keys(raw))
        if (!RULE_IDS.includes(key))
            fail(`"rules" names ${key}, which is not one of ${RULE_IDS.join(", ")}`);
    const rules = {};
    for (const id of RULE_IDS) {
        const severity = raw[id];
        // A rule left out is OFF rather than a default: a consumer adopting the
        // package turns rules on one at a time, and silently enabling one it
        // never named would fail a build for a rule nobody chose.
        if (severity === undefined) {
            rules[id] = "off";
            continue;
        }
        if (!SEVERITIES.includes(severity))
            fail(`"rules.${id}" is ${JSON.stringify(severity)}; expected "error", "warn" or "off"`);
        rules[id] = severity;
    }
    return rules;
}
function parseAllow(value) {
    if (value === undefined)
        return [];
    if (!Array.isArray(value))
        fail(`"allow" must be an array`);
    return value.map((entry, index) => {
        const where = `allow[${index}]`;
        if (typeof entry !== "object" || entry === null)
            fail(`${where} must be an object`);
        const raw = entry;
        if (!RULE_IDS.includes(raw.rule))
            fail(`${where}.rule is ${JSON.stringify(raw.rule)}; expected one of ${RULE_IDS.join(", ")}`);
        if (typeof raw.path !== "string" || raw.path.trim() === "")
            fail(`${where}.path must be a non-empty path or glob`);
        if (typeof raw.reason !== "string" || raw.reason.trim() === "")
            fail(`${where} exempts ${String(raw.path)} from ${String(raw.rule)} with no reason. ` +
                `Every allowlist entry carries one, so that the list can be shortened later ` +
                `by someone who was not there when it was written.`);
        return { rule: raw.rule, path: raw.path, reason: raw.reason };
    });
}
/**
 * Read and check a `design-lint.json`.
 *
 * Hand-written rather than schema-validated on purpose: this is the only shape
 * the CLI reads, and a validation dependency in a gate every consumer installs
 * costs more than the forty lines above.
 */
export function loadConfig(path) {
    const absolute = resolve(path);
    let text;
    try {
        text = readFileSync(absolute, "utf8");
    }
    catch {
        fail(`cannot read ${absolute}`);
    }
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch (error) {
        fail(`${absolute} is not valid JSON: ${error.message}`);
    }
    if (typeof parsed !== "object" || parsed === null)
        fail(`${absolute} must contain an object`);
    const raw = parsed;
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
