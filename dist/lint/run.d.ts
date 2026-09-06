import type { Config } from "./config.js";
import type { Finding } from "./types.js";
export interface RunResult {
    findings: Finding[];
    /** 0 clean, 1 an error-severity finding remains, 2 the config is unusable. */
    exitCode: 0 | 1 | 2;
    /** How many files were read. Zero is reported, never silently passed. */
    filesChecked: number;
}
/** The files the config selects, relative to its directory, in a stable order. */
export declare function selectFiles(config: Config): string[];
/**
 * Lint everything the config selects.
 *
 * Allowlisting happens AFTER the rules run rather than by skipping files, so
 * that an entry which no longer suppresses anything is still visible as an
 * entry — a list that silently stops mattering is a list nobody ever removes
 * a line from.
 */
export declare function run(config: Config): RunResult;
