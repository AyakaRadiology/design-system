import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatText, main, parseArgs } from "./cli.js";
import { ConfigError, loadConfig } from "./config.js";
import { run, selectFiles } from "./run.js";

/* A throwaway project on disk, because run() answers questions about file
 * selection and relative paths that a fake filesystem would answer for it. */
function project(files: Record<string, string>, config: object): string {
    const root = mkdtempSync(join(tmpdir(), "design-lint-run-"));
    for (const [path, contents] of Object.entries(files)) {
        const full = join(root, path);
        mkdirSync(dirname(full), { recursive: true });
        writeFileSync(full, contents);
    }
    const configPath = join(root, "design-lint.json");
    writeFileSync(configPath, JSON.stringify(config));
    return configPath;
}

const ALL_ERROR = {
    L1: "error",
    L2: "error",
    L3: "error",
    L4: "error",
    L5: "error",
    L6: "error",
    L7: "error",
};
const BASE = {
    include: ["src/**/*.{ts,tsx,css}"],
    exclude: ["**/*.test.*"],
    themeFile: "src/styles/theme.css",
    rules: ALL_ERROR,
};

const OFFENDING =
    'export const Chip = () => <button className="p-5" style={{ color: "#fff" }} />;\n';
const CLEAN = 'export const Chip = () => <span className="p-4 bg-accent text-accent-fg" />;\n';
const THEME =
    ":root {\n  --accent: oklch(0.8 0.12 195);\n  --x-needle-tracker: var(--chart-1);\n}\n";

describe("selectFiles", () => {
    it("returns the included files, relative to the config, in a stable order", () => {
        const config = loadConfig(
            project(
                { "src/b.tsx": CLEAN, "src/a.tsx": CLEAN, "src/styles/theme.css": THEME },
                BASE,
            ),
        );
        expect(selectFiles(config)).toEqual(["src/a.tsx", "src/b.tsx", "src/styles/theme.css"]);
    });

    it("drops excluded files", () => {
        const config = loadConfig(
            project(
                { "src/a.tsx": CLEAN, "src/a.test.tsx": OFFENDING, "src/styles/theme.css": THEME },
                BASE,
            ),
        );
        expect(selectFiles(config)).toEqual(["src/a.tsx", "src/styles/theme.css"]);
    });

    it("ignores a file the include patterns do not name", () => {
        const config = loadConfig(
            project(
                {
                    "src/a.tsx": CLEAN,
                    "src/notes.md": "# not linted",
                    "src/styles/theme.css": THEME,
                },
                BASE,
            ),
        );
        expect(selectFiles(config)).toEqual(["src/a.tsx", "src/styles/theme.css"]);
    });
});

describe("run", () => {
    it("passes a clean project", () => {
        const result = run(
            loadConfig(project({ "src/a.tsx": CLEAN, "src/styles/theme.css": THEME }, BASE)),
        );
        expect(result.findings).toEqual([]);
        expect(result.exitCode).toBe(0);
        expect(result.filesChecked).toBe(2);
    });

    it("reports every rule a file breaks, and exits 1", () => {
        const result = run(
            loadConfig(project({ "src/a.tsx": OFFENDING, "src/styles/theme.css": THEME }, BASE)),
        );
        expect(new Set(result.findings.map((finding) => finding.rule))).toEqual(
            new Set(["L1", "L2", "L3", "L5"]),
        );
        expect(result.exitCode).toBe(1);
    });

    it("orders findings by file, then line, then column", () => {
        const result = run(
            loadConfig(
                project(
                    {
                        "src/b.tsx": OFFENDING,
                        "src/a.tsx": OFFENDING,
                        "src/styles/theme.css": THEME,
                    },
                    BASE,
                ),
            ),
        );
        const files = result.findings.map((finding) => finding.file);
        expect(files).toEqual([...files].sort());
    });

    it("drops a finding an allowlist entry covers, and nothing else", () => {
        const configPath = project(
            { "src/a.tsx": OFFENDING, "src/styles/theme.css": THEME },
            {
                ...BASE,
                allow: [{ rule: "L5", path: "src/a.tsx", reason: "replaced in #123" }],
            },
        );
        const rules = new Set(run(loadConfig(configPath)).findings.map((finding) => finding.rule));
        expect(rules.has("L5")).toBe(false);
        expect(rules.has("L1")).toBe(true);
    });

    it("accepts a glob in an allowlist path", () => {
        const configPath = project(
            { "src/legacy/a.tsx": OFFENDING, "src/styles/theme.css": THEME },
            {
                ...BASE,
                allow: [{ rule: "L5", path: "src/legacy/**", reason: "migrated in S4" }],
            },
        );
        expect(run(loadConfig(configPath)).findings.some((finding) => finding.rule === "L5")).toBe(
            false,
        );
    });

    it("reports a warn rule without failing the run", () => {
        const configPath = project(
            { "src/a.tsx": OFFENDING, "src/styles/theme.css": THEME },
            {
                ...BASE,
                rules: { L3: "warn" },
            },
        );
        const result = run(loadConfig(configPath));
        expect(result.findings.map((finding) => finding.severity)).toEqual(["warn"]);
        expect(result.exitCode).toBe(0);
    });

    it("does not run a rule that is off", () => {
        const configPath = project(
            { "src/a.tsx": OFFENDING, "src/styles/theme.css": THEME },
            {
                ...BASE,
                rules: { ...ALL_ERROR, L1: "off", L2: "off", L3: "off", L5: "off" },
            },
        );
        expect(run(loadConfig(configPath)).findings).toEqual([]);
    });

    it("lets the theme file hold the values, and no other file", () => {
        const configPath = project(
            {
                "src/styles/theme.css": THEME,
                "src/other.css": ".x { --accent: oklch(0.5 0.1 200); }\n",
            },
            BASE,
        );
        const findings = run(loadConfig(configPath)).findings;
        expect(findings.every((finding) => finding.file === "src/other.css")).toBe(true);
        expect(findings.map((finding) => finding.rule).sort()).toEqual(["L1", "L6"]);
    });

    it("reports how many files it read", () => {
        const configPath = project(
            { "src/styles/theme.css": THEME },
            { ...BASE, include: ["app/**/*.tsx"] },
        );
        expect(run(loadConfig(configPath)).filesChecked).toBe(0);
    });
});

describe("the command line", () => {
    it("defaults the config path and the format", () => {
        expect(parseArgs([])).toEqual({ config: "design-lint.json", format: "text" });
    });

    it("reads --config and --format", () => {
        expect(parseArgs(["--config", "a.json", "--format", "json"])).toEqual({
            config: "a.json",
            format: "json",
        });
    });

    it("refuses an unknown argument, a missing path and a bad format", () => {
        expect(() => parseArgs(["--wat"])).toThrow(ConfigError);
        expect(() => parseArgs(["--config"])).toThrow(/needs a path/);
        expect(() => parseArgs(["--format", "yaml"])).toThrow(/text/);
    });

    it("prints one line per finding", () => {
        const findings = run(
            loadConfig(project({ "src/a.tsx": OFFENDING, "src/styles/theme.css": THEME }, BASE)),
        ).findings;
        const text = formatText(findings);
        expect(text.split("\n")).toHaveLength(findings.length);
        expect(text).toMatch(/^src\/a\.tsx:1:\d+ L\d error /m);
    });

    it("exits 2 on an unusable config, saying which one", () => {
        const said: string[] = [];
        expect(
            main(
                ["--config", "/nonexistent/design-lint.json"],
                () => {},
                (line) => said.push(line),
            ),
        ).toBe(2);
        expect(said.join("\n")).toMatch(/cannot read/);
    });

    it("exits 2 on a bad argument", () => {
        expect(
            main(
                ["--format", "yaml"],
                () => {},
                () => {},
            ),
        ).toBe(2);
    });

    it("exits 1 and prints the findings, or 0 and prints the count", () => {
        const dirty = project({ "src/a.tsx": OFFENDING, "src/styles/theme.css": THEME }, BASE);
        const clean = project({ "src/a.tsx": CLEAN, "src/styles/theme.css": THEME }, BASE);
        const said: string[] = [];
        expect(
            main(
                ["--config", dirty],
                (line) => said.push(String(line)),
                () => {},
            ),
        ).toBe(1);
        expect(said.join("\n")).toMatch(/L1 error/);
        said.length = 0;
        expect(
            main(
                ["--config", clean],
                (line) => said.push(String(line)),
                () => {},
            ),
        ).toBe(0);
        expect(said.join("\n")).toMatch(/2 file\(s\), 0 error\(s\)/);
    });

    /* A renamed directory or a typo in a glob leaves CI green while the gate
     * checks nothing — the one failure mode that looks exactly like success. */
    it("exits 2 when the include patterns match no files, in either format", () => {
        const configPath = project({ "src/a.tsx": CLEAN }, { ...BASE, include: ["app/**/*.tsx"] });
        const said: string[] = [];
        expect(
            main(
                ["--config", configPath],
                () => {},
                (line) => said.push(String(line)),
            ),
        ).toBe(2);
        expect(said.join("\n")).toMatch(/matched no files/);
        expect(
            main(
                ["--config", configPath, "--format", "json"],
                () => {},
                () => {},
            ),
        ).toBe(2);
    });

    it("emits machine-readable findings with --format json", () => {
        const configPath = project({ "src/a.tsx": OFFENDING, "src/styles/theme.css": THEME }, BASE);
        const said: string[] = [];
        expect(
            main(
                ["--config", configPath, "--format", "json"],
                (line) => said.push(String(line)),
                () => {},
            ),
        ).toBe(1);
        const parsed = JSON.parse(said.join("\n"));
        expect(parsed.filesChecked).toBe(2);
        expect(parsed.findings[0]).toMatchObject({ file: "src/a.tsx", severity: "error" });
    });
});
