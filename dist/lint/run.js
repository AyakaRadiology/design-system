import { globSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import postcss from "postcss";
import { ConfigError } from "./config.js";
import { matchesAny } from "./glob.js";
import { RULES } from "./rules/index.js";
import { loadPackageSchema } from "./schema.js";
import { parseTsx } from "./tsx.js";
/** Paths use `/` in the config and in output, whatever the host separator is. */
const toPosix = (path) => path.split("\\").join("/");
function selectedThemeFile(config, files) {
    const configuredPath = resolve(config.root, config.themeFile);
    const themeFile = toPosix(relative(config.root, configuredPath));
    if (files.has(themeFile))
        return themeFile;
    const normalizedTheme = themeFile.normalize("NFC");
    const candidates = [...files].filter(([file]) => file.normalize("NFC") === normalizedTheme);
    if (candidates.length === 0)
        return themeFile;
    // Some volumes store both spellings as separate files. Only grant the
    // theme exemption when the listed path identifies the configured file.
    const theme = statSync(configuredPath, { bigint: true, throwIfNoEntry: false });
    if (!theme)
        return themeFile;
    for (const [file, target] of candidates) {
        const candidate = statSync(target, { bigint: true });
        if (candidate.dev === theme.dev && candidate.ino === theme.ino)
            return file;
    }
    return themeFile;
}
function ruleContext(config, files) {
    const schema = loadPackageSchema();
    return {
        themeFile: selectedThemeFile(config, files),
        schemaTokens: new Set(Object.keys(schema.tokens)),
        extensionPrefix: schema.extensionPrefix,
    };
}
/** The files the config selects, relative to its directory, in a stable order. */
export function selectFiles(config) {
    return [...selectFilePaths(config).keys()].sort();
}
function selectFilePaths(config) {
    const root = realpathSync(config.root);
    const paths = globSync(config.include, { cwd: config.root }).map((path) => relative(config.root, resolve(config.root, path)));
    const files = new Map();
    for (const path of [...new Set(paths)].sort()) {
        const file = toPosix(path);
        if (matchesAny(file, config.exclude))
            continue;
        const target = realpathSync(resolve(config.root, path));
        if (!statSync(target).isFile())
            continue;
        const fromRoot = relative(root, target);
        if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
            throw new ConfigError(`${file} resolves outside the project root`);
        }
        files.set(file, target);
    }
    return files;
}
function parseCss(file, text) {
    try {
        return postcss.parse(text, { from: file, map: false });
    }
    catch (error) {
        if (!(error instanceof postcss.CssSyntaxError))
            throw error;
        // Both the PostCSS error object and its message can contain source text.
        throw new ConfigError(`${file}:${error.line}:${error.column} invalid CSS syntax`);
    }
}
/**
 * Lint everything the config selects.
 *
 * Allowlisting happens AFTER the rules run rather than by skipping files, so
 * that an entry which no longer suppresses anything is still visible as an
 * entry — a list that silently stops mattering is a list nobody ever removes
 * a line from.
 */
export function run(config) {
    const files = selectFilePaths(config);
    const context = ruleContext(config, files);
    const active = Object.keys(RULES).filter((id) => config.rules[id] !== "off");
    const raw = [];
    for (const [file, target] of files) {
        const text = readFileSync(target, "utf8");
        const isCss = file.endsWith(".css");
        const source = isCss ? null : parseTsx(file, text);
        const root = isCss ? parseCss(file, text) : null;
        for (const id of active) {
            const rule = RULES[id];
            if (root && rule.checkCss)
                raw.push(...rule.checkCss(file, root, context));
            if (source && rule.checkTsx)
                raw.push(...rule.checkTsx(file, source, context));
        }
    }
    const allowed = (finding) => config.allow.some((entry) => entry.rule === finding.rule && matchesAny(finding.file, [entry.path]));
    const findings = raw
        .filter((finding) => !allowed(finding))
        .map((finding) => ({
        ...finding,
        // "off" rules never ran, so anything left is error or warn.
        severity: config.rules[finding.rule] === "warn" ? "warn" : "error",
    }))
        .sort((a, b) => a.file.localeCompare(b.file) ||
        a.line - b.line ||
        a.col - b.col ||
        a.rule.localeCompare(b.rule));
    return {
        findings,
        exitCode: findings.some((finding) => finding.severity === "error") ? 1 : 0,
        filesChecked: files.size,
    };
}
