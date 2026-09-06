import type { Finding } from "./types.js";
interface Options {
    config: string;
    format: "text" | "json";
}
export declare function parseArgs(argv: readonly string[]): Options | "help";
export declare function formatText(findings: readonly Finding[]): string;
/** The CLI body, exported so it can be tested without spawning a process. */
export declare function main(argv: readonly string[], write?: (...data: any[]) => void, writeError?: (...data: any[]) => void): 0 | 1 | 2;
export {};
