import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import { expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TAILWIND_PRESET = "tailwind.css";
const TAILWIND_DIRECTIVES = new Set([
    "theme",
    "source",
    "custom-variant",
    "apply",
    "tailwind",
    "config",
    "plugin",
    "utility",
    "variant",
    "reference",
]);

it("shipped runtime CSS contains no Tailwind directives or preset imports", () => {
    const work = mkdtempSync(join(tmpdir(), "design-system-css-"));
    try {
        // Inspect the actual distribution, including newly added CSS files, not
        // a hard-coded list of source voices. Only the opt-in compiler entry is
        // exempt; no runtime stylesheet may reach it via an import.
        const tarball = join(work, "package.tgz");
        execFileSync("bun", ["pm", "pack", "--filename", tarball], { cwd: ROOT });
        execFileSync("tar", ["-xzf", tarball, "-C", work]);
        const packageRoot = join(work, "package");
        const cssFiles = readdirSync(packageRoot, { recursive: true, encoding: "utf8" })
            .filter((file) => file.endsWith(".css"))
            .map((file) => file.split(sep).join("/"));
        expect(cssFiles).toEqual(
            expect.arrayContaining([TAILWIND_PRESET, "voices/base.css", "voices/biomonitor.css"]),
        );
        const runtimeFiles = new Set(
            cssFiles
                .filter((file) => file !== TAILWIND_PRESET)
                .map((file) => join(packageRoot, file)),
        );
        for (const file of runtimeFiles) {
            postcss.parse(readFileSync(file, "utf8"), { from: file }).walkAtRules((rule) => {
                expect(TAILWIND_DIRECTIVES.has(rule.name.toLowerCase()), `${file}: ${rule}`).toBe(
                    false,
                );
                if (rule.name.toLowerCase() !== "import") return;
                const target = rule.params.match(/^["']([^"']+)["']/u)?.[1];
                expect(
                    target,
                    `${file}: imports must resolve inside the plain CSS distribution`,
                ).toBeDefined();
                if (!target) throw new Error(`Cannot resolve ${rule}`);
                expect(runtimeFiles.has(resolve(file, "..", target)), `${file}: ${rule}`).toBe(
                    true,
                );
            });
        }
    } finally {
        rmSync(work, { recursive: true, force: true });
    }
});
