import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";

const script = readFileSync(new URL("../tests/consumer/run.sh", import.meta.url), "utf8");
const helper = script.match(/^assert_css\(\) \{[\s\S]*?^\}/mu)?.[0];
const cases = [
    ["voice surface value", "--bg: oklch(0.2 0.01 200);"],
    ["--x- extension token", "--x-needle-tracker: red;"],
    ["dialog surface default", "--dialog-surface: var(--bg-elevated);"],
    ["the app's tuned empty scale", "--numeric-empty-scale: 0.35;"],
];

it.each(cases)("consumer assertion rejects a missing %s", (label, declaration) => {
    // Execute the real helper AND call site so argument-routing regressions
    // cannot be hidden by invoking the helper correctly only in this test.
    const call = script.split("\n").find((line) => line.startsWith(`assert_css "${label}"`));
    if (!helper || !call) throw new Error(`Cannot find consumer assertion: ${label}`);
    const work = mkdtempSync(join(tmpdir(), "consumer-css-"));
    const css = join(work, "built.css");
    const run = () =>
        spawnSync("bash", ["-euc", `${helper}\n${call}`], {
            env: { ...process.env, CSS_OUT: css },
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        });
    try {
        const declarations = cases.map(([, value]) => value);
        writeFileSync(css, `:root { --unrelated: 1; ${declarations.join(" ")} }`);
        const present = run();
        expect(present.error).toBeUndefined();
        expect(present.status).toBe(0);

        writeFileSync(
            css,
            `:root { --unrelated: 1; ${declarations.filter((value) => value !== declaration).join(" ")} }`,
        );
        const missing = run();
        expect(missing.error).toBeUndefined();
        expect(missing.status).toBe(1);
        expect(missing.stderr).toContain(`the built stylesheet has no ${label}`);
    } finally {
        rmSync(work, { recursive: true, force: true });
    }
});
