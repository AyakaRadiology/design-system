import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateDesign } from "./generate-design.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MAX_PRODUCT_LINES = 60;
let fixture: string;

beforeEach(() => {
    fixture = execFileSync("mktemp", ["-d"], {
        encoding: "utf8",
        env: { ...process.env, TMPDIR: tmpdir() },
    }).trim();
    for (const path of ["tokens", "voices", "docs/ui-rules.md"]) {
        cpSync(resolve(ROOT, path), resolve(fixture, path), { recursive: true });
    }
});
afterEach(() => rmSync(fixture, { recursive: true, force: true }));

function replace(path: string, before: string, after: string): void {
    const target = resolve(fixture, path);
    const original = readFileSync(target, "utf8");
    expect(original).toContain(before);
    writeFileSync(target, original.replace(before, after));
}

describe("generated design context", () => {
    it("keeps the product brief within its line budget", () => {
        const lines = readFileSync(resolve(ROOT, "PRODUCT.md"), "utf8").trimEnd().split("\n");
        expect(lines.length).toBeLessThanOrEqual(MAX_PRODUCT_LINES);
    });

    it("is deterministic and agrees with the checked-in projection", () => {
        const generated = generateDesign(fixture);
        expect(generated).toBe(generateDesign(fixture));
        expect(generated).toBe(readFileSync(resolve(ROOT, "DESIGN.md"), "utf8"));
        expect(generated).toContain('fontSize: "0.875rem"');
        expect(generated).toContain('"md": "0.375rem"');
        expect(generated).not.toContain("text-secondary--line-height");
    });

    it("tracks palette, font, glass, scale and schema-purpose changes", () => {
        replace(
            "voices/biomonitor.css",
            "--accent: oklch(0.8 0.12 178)",
            "--accent: oklch(0.81 0.12 178)",
        );
        replace("voices/biomonitor.css", "--x-glass-radius: 8px", "--x-glass-radius: 9px");
        replace("tokens/scales.css", '"Inter Variable", "Inter",', '"House Variable", "Inter",');
        replace("tokens/scales.css", "--text-sm: 0.875rem", "--text-sm: 0.9rem");
        replace(
            "tokens/schema.json",
            "Structural borders and dividers.",
            "Changed border purpose.",
        );
        const generated = generateDesign(fixture);
        for (const value of [
            "0.81 0.12 178",
            '"glass": "9px"',
            "House Variable",
            "0.9rem",
            "Changed border purpose.",
        ]) {
            expect(generated).toContain(value);
        }
    });

    it("fails loudly for missing required tokens and unrecognized spacing rules", () => {
        replace("voices/biomonitor.css", "--accent:", "--unknown-accent:");
        expect(() => generateDesign(fixture)).toThrow("Invalid design sources");
        cpSync(resolve(ROOT, "voices/biomonitor.css"), resolve(fixture, "voices/biomonitor.css"));
        replace("docs/ui-rules.md", "Carbon steps only", "Unparsed steps");
        expect(() => generateDesign(fixture)).toThrow("Cannot read house spacing/radius rules");
    });

    it("rejects hand edits and a missing DESIGN.md without rewriting it", () => {
        // Exercise the actual CLI in an isolated repository-shaped fixture.
        for (const path of [
            "tools/generate-design.ts",
            "src/lint/css.ts",
            "src/lint/schema.ts",
            "package.json",
        ]) {
            cpSync(resolve(ROOT, path), resolve(fixture, path), { recursive: true });
        }
        // Module resolution uses the installed dependencies, not a second install.
        const env = { ...process.env, NODE_PATH: resolve(ROOT, "node_modules") };
        const run = () =>
            spawnSync("bun", [resolve(fixture, "tools/generate-design.ts"), "--check"], {
                encoding: "utf8",
                env,
            });
        const output = resolve(fixture, "DESIGN.md");
        writeFileSync(output, generateDesign(fixture));
        expect(run().status).toBe(0);
        writeFileSync(output, "hand edited\n");
        const stale = run();
        expect(stale.status).not.toBe(0);
        expect(stale.stderr).toContain("DESIGN.md is stale");
        expect(readFileSync(output, "utf8")).toBe("hand edited\n");
        rmSync(output);
        expect(run().status).not.toBe(0);
    });
});
