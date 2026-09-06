import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/* The CLI is exercised here as a SUBPROCESS with its stdout on a pipe, which
 * is the one arrangement none of the other CLI tests reproduce: they call
 * main() with an injected writer, so nothing about them depends on how — or
 * whether — the process's own stdout is flushed.
 *
 * Node writes to a pipe asynchronously. A write larger than the pipe buffer
 * (64 KiB on Linux) cannot complete inline, so it is queued; `process.exit()`
 * then tears the process down and the queued half is simply lost. Redirecting
 * to a FILE hides it, because a file descriptor is written synchronously.
 * That is why this reached a consumer before it reached a test.
 */

const bin = fileURLToPath(new URL("../../bin/design-lint.js", import.meta.url).href);

/** Enough findings that the JSON cannot fit in one pipe buffer. */
const FINDINGS = 600;
const PIPE_BUFFER_BYTES = 64 * 1024;

function noisyProject(): string {
    const root = mkdtempSync(join(tmpdir(), "design-lint-stdout-"));
    mkdirSync(join(root, "src/styles"), { recursive: true });
    // One colour literal per line, so the finding count is the line count and
    // every finding carries a different position.
    const lines = Array.from(
        { length: FINDINGS },
        (_, i) => `export const c${i} = "#${(i % 16).toString(16).repeat(6)}";`,
    );
    writeFileSync(join(root, "src/palette.ts"), `${lines.join("\n")}\n`);
    writeFileSync(
        join(root, "src/styles/theme.css"),
        ":root {\n  --accent: oklch(0.8 0.12 195);\n}\n",
    );
    writeFileSync(
        join(root, "design-lint.json"),
        JSON.stringify({
            include: ["src/**/*.{ts,tsx,css}"],
            exclude: [],
            themeFile: "src/styles/theme.css",
            rules: { L1: "error" },
            allow: [],
        }),
    );
    return root;
}

function runPiped(cwd: string, args: string[]) {
    return spawnSync(process.execPath, [bin, ...args], {
        cwd,
        // The whole point: stdout is a pipe, not a file and not a terminal.
        stdio: ["ignore", "pipe", "pipe"],
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
    });
}

describe("the CLI as a subprocess with stdout on a pipe", () => {
    if (!existsSync(bin) || !existsSync(join(dirname(bin), "../dist/lint/cli.js"))) {
        throw new Error(`${bin} needs a built dist/. Run \`bun run gen\` first.`);
    }

    it("writes every byte of a large JSON report before exiting", () => {
        const root = noisyProject();
        const result = runPiped(root, ["--format", "json"]);

        expect(result.error).toBeUndefined();
        expect(result.stdout.length).toBeGreaterThan(PIPE_BUFFER_BYTES);

        // The assertion the consumer's `design-lint --format json | jq` makes.
        const parsed = JSON.parse(result.stdout);
        expect(parsed.findings).toHaveLength(FINDINGS);
        expect(parsed.filesChecked).toBe(2);

        // Truncation loses the tail first, so the last finding is the canary.
        expect(parsed.findings.at(-1)).toMatchObject({ rule: "L1", line: FINDINGS });
    });

    /* An exit code that survives the flush is the other half: a gate that
     * printed everything and then exited 0 would be worse than one that
     * truncated. */
    it("still reports failure after a large write", () => {
        expect(runPiped(noisyProject(), ["--format", "json"]).status).toBe(1);
    });

    it("writes every byte of a large text report before exiting", () => {
        const result = runPiped(noisyProject(), []);
        expect(result.stdout.length).toBeGreaterThan(PIPE_BUFFER_BYTES);
        const lines = result.stdout.trimEnd().split("\n");
        expect(lines).toHaveLength(FINDINGS + 1);
        expect(lines.at(-2)).toMatch(new RegExp(`^src/palette\\.ts:${FINDINGS}:\\d+ L1 error `));
        expect(lines.at(-1)).toMatch(/^design-lint: 2 file\(s\), 600 error\(s\), 0 warning\(s\)$/);
        expect(result.status).toBe(1);
    });

    it("preserves exit 0 on a clean run and exit 2 on an unusable config", () => {
        const clean = mkdtempSync(join(tmpdir(), "design-lint-stdout-clean-"));
        mkdirSync(join(clean, "src/styles"), { recursive: true });
        writeFileSync(join(clean, "src/ok.tsx"), 'export const A = () => <i className="p-4" />;\n');
        writeFileSync(
            join(clean, "src/styles/theme.css"),
            ":root {\n  --accent: oklch(0.8 0.12 195);\n}\n",
        );
        writeFileSync(
            join(clean, "design-lint.json"),
            JSON.stringify({
                include: ["src/**/*.{ts,tsx,css}"],
                exclude: [],
                themeFile: "src/styles/theme.css",
                rules: { L1: "error" },
                allow: [],
            }),
        );
        expect(runPiped(clean, []).status).toBe(0);
        expect(runPiped(clean, ["--config", "nope.json"]).status).toBe(2);
    });
});
