import { ConfigError, loadConfig } from "./config.js";
import { run } from "./run.js";
const DEFAULT_CONFIG = "design-lint.json";
const USAGE = `design-lint [--config ${DEFAULT_CONFIG}] [--format text|json]

Checks a consumer's components and CSS against the design system's rules
L1–L7. See https://github.com/AyakaRadiology/design-system#the-gate.`;
export function parseArgs(argv) {
    const options = { config: DEFAULT_CONFIG, format: "text" };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--help" || arg === "-h")
            return "help";
        if (arg === "--config") {
            const value = argv[++i];
            if (value === undefined)
                throw new ConfigError("--config needs a path");
            options.config = value;
        }
        else if (arg === "--format") {
            const value = argv[++i];
            if (value !== "text" && value !== "json")
                throw new ConfigError(`--format must be "text" or "json", not ${String(value)}`);
            options.format = value;
        }
        else {
            throw new ConfigError(`unknown argument ${String(arg)}`);
        }
    }
    return options;
}
export function formatText(findings) {
    return findings
        .map((finding) => `${finding.file}:${finding.line}:${finding.col} ${finding.rule} ${finding.severity} ${finding.message}`)
        .join("\n");
}
/** The CLI body, exported so it can be tested without spawning a process. */
export function main(argv, write = console.log, writeError = console.error) {
    let options;
    try {
        options = parseArgs(argv);
    }
    catch (error) {
        writeError(`design-lint: ${error.message}`);
        writeError(USAGE);
        return 2;
    }
    if (options === "help") {
        write(USAGE);
        return 0;
    }
    let result;
    try {
        result = run(loadConfig(options.config));
    }
    catch (error) {
        if (error instanceof ConfigError) {
            writeError(`design-lint: ${error.message}`);
            return 2;
        }
        throw error;
    }
    if (options.format === "json") {
        write(JSON.stringify({ findings: result.findings, filesChecked: result.filesChecked }, null, 2));
        return result.filesChecked === 0 ? 2 : result.exitCode;
    }
    if (result.findings.length > 0)
        write(formatText(result.findings));
    /* A gate that matched no files passes silently, which is the one failure
     * mode that looks exactly like success — a renamed directory, a typo in a
     * glob, and CI goes green while checking nothing. It is a config error,
     * not a clean run. */
    if (result.filesChecked === 0) {
        writeError(`design-lint: the "include" patterns matched no files under ${process.cwd()} — the gate would have checked nothing`);
        return 2;
    }
    const errors = result.findings.filter((finding) => finding.severity === "error").length;
    const warnings = result.findings.length - errors;
    write(`design-lint: ${result.filesChecked} file(s), ${errors} error(s), ${warnings} warning(s)`);
    return result.exitCode;
}
/* No auto-run on import. `bin/design-lint.js` is the only entry point, and a
 * module that exited the process on import would take the test runner with it
 * — and would run main twice, since the bin's own path contains this module's
 * name. */
