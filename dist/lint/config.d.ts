import { type RuleId, type Severity } from "./types.js";
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
export declare class ConfigError extends Error {
}
/**
 * Read and check a `design-lint.json`.
 *
 * Hand-written rather than schema-validated on purpose: this is the only shape
 * the CLI reads, and a validation dependency in a gate every consumer installs
 * costs more than the forty lines above.
 */
export declare function loadConfig(path: string): Config;
