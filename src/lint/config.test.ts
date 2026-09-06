import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "./config.js";

const VALID = {
    include: ["src/**/*.{ts,tsx,css}"],
    exclude: ["**/*.test.*"],
    themeFile: "src/styles/theme.css",
    rules: {
        L1: "error",
        L2: "error",
        L3: "error",
        L4: "error",
        L5: "error",
        L6: "error",
        L7: "error",
    },
    allow: [{ rule: "L5", path: "src/legacy/OldButton.tsx", reason: "replaced in #123" }],
};

function configFile(contents: unknown): string {
    const dir = mkdtempSync(join(tmpdir(), "design-lint-config-"));
    const path = join(dir, "design-lint.json");
    writeFileSync(path, typeof contents === "string" ? contents : JSON.stringify(contents));
    return path;
}

const load = (contents: unknown) => loadConfig(configFile(contents));

describe("loadConfig", () => {
    it("reads a complete config and anchors it to its own directory", () => {
        const path = configFile(VALID);
        const config = loadConfig(path);
        expect(config.themeFile).toBe("src/styles/theme.css");
        expect(config.rules.L1).toBe("error");
        expect(config.allow).toEqual(VALID.allow);
        expect(path.startsWith(config.root)).toBe(true);
    });

    it("treats a rule the config never names as off", () => {
        expect(load({ ...VALID, rules: { L1: "error" } }).rules).toEqual({
            L1: "error",
            L2: "off",
            L3: "off",
            L4: "off",
            L5: "off",
            L6: "off",
            L7: "off",
        });
    });

    it("defaults an absent allowlist to empty", () => {
        expect(load({ ...VALID, allow: undefined }).allow).toEqual([]);
    });

    /* The rule this file exists for. An allowlist without reasons becomes a
     * list nobody can shorten, because nobody remembers which entries were
     * meant to be temporary. */
    it("refuses an allowlist entry with no reason", () => {
        expect(() => load({ ...VALID, allow: [{ rule: "L5", path: "src/x.tsx" }] })).toThrow(
            ConfigError,
        );
        expect(() =>
            load({ ...VALID, allow: [{ rule: "L5", path: "src/x.tsx", reason: "  " }] }),
        ).toThrow(/no reason/);
    });

    it("refuses an allowlist entry with no path", () => {
        expect(() => load({ ...VALID, allow: [{ rule: "L5", reason: "why" }] })).toThrow(/path/);
    });

    it("refuses an unknown rule id, wherever it appears", () => {
        expect(() => load({ ...VALID, rules: { L9: "error" } })).toThrow(/L9/);
        expect(() =>
            load({ ...VALID, allow: [{ rule: "L9", path: "src/x.tsx", reason: "why" }] }),
        ).toThrow(/L9/);
    });

    it("refuses a severity that is not error, warn or off", () => {
        expect(() => load({ ...VALID, rules: { ...VALID.rules, L1: "fatal" } })).toThrow(/fatal/);
    });

    it("refuses a config with no themeFile", () => {
        expect(() => load({ ...VALID, themeFile: undefined })).toThrow(/themeFile/);
    });

    it("refuses a config with no include list", () => {
        expect(() => load({ ...VALID, include: "src" })).toThrow(/include/);
    });

    it("says which file it could not read or parse", () => {
        expect(() => loadConfig("/nonexistent/design-lint.json")).toThrow(/cannot read/);
        expect(() => load("{ not json")).toThrow(/not valid JSON/);
    });
});
