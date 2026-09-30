import { describe, expect, it } from "vitest";
import { globToRegExp, matchesAny } from "./glob.js";

const matches = (pattern: string, path: string) => globToRegExp(pattern).test(path);

describe("globToRegExp", () => {
    it("matches a literal path exactly", () => {
        expect(matches("src/legacy/OldButton.tsx", "src/legacy/OldButton.tsx")).toBe(true);
        expect(matches("src/legacy/OldButton.tsx", "src/legacy/OldButton.tsx.bak")).toBe(false);
    });

    it("keeps a single star inside one segment", () => {
        expect(matches("src/*.tsx", "src/App.tsx")).toBe(true);
        expect(matches("src/*.tsx", "src/panels/App.tsx")).toBe(false);
    });

    it("lets a double star cross separators, including zero of them", () => {
        expect(matches("**/*.test.*", "src/lint/run.test.ts")).toBe(true);
        expect(matches("**/*.test.*", "run.test.ts")).toBe(true);
        expect(matches("**/__fixtures__/**", "src/lint/rules/__fixtures__/L1/fail.tsx")).toBe(true);
        expect(matches("**/__fixtures__/**", "src/lint/rules/fail.tsx")).toBe(false);
    });

    it("expands brace alternation", () => {
        expect(matches("src/**/*.{ts,tsx,css}", "src/react/Button.tsx")).toBe(true);
        expect(matches("src/**/*.{ts,tsx,css}", "src/styles/theme.css")).toBe(true);
        expect(matches("src/**/*.{ts,tsx,css}", "src/logo.svg")).toBe(false);
        expect(matches("src/{legacy,{new,shared}}/Button.tsx", "src/shared/Button.tsx")).toBe(true);
    });

    it.each([
        "src/{legacy}/Button.tsx",
        "src/{legacy/Button.tsx",
        "src/{legacy,shared/Button.tsx",
        "src/legacy}/Button.tsx",
        "src/{{legacy}}/Button.tsx",
    ])("matches literal braces in %s without throwing", (path) => {
        expect(matches(path, path)).toBe(true);
    });

    it("preserves literal braces around nested alternation", () => {
        expect(matches("src/{{legacy,shared}}/Button.tsx", "src/{legacy}/Button.tsx")).toBe(true);
        expect(matches("src/{{legacy,shared}}/Button.tsx", "src/legacy/Button.tsx")).toBe(false);
    });

    it("treats a comma outside braces as a literal", () => {
        expect(matches("src/a,b.css", "src/a,b.css")).toBe(true);
        expect(matches("src/a,b.css", "src/a.css")).toBe(false);
    });

    it("does not let a regex metacharacter in a path act as one", () => {
        expect(matches("src/a.css", "src/axcss")).toBe(false);
        expect(matches("src/(x).css", "src/(x).css")).toBe(true);
    });
});

describe("matchesAny", () => {
    it.each([
        ["src/legacy/Button.tsx", false],
        ["src/{legacy}/Button.tsx", true],
    ])("matches an exact brace path against %s: %s", (path, expected) => {
        expect(matchesAny(path, ["src/{legacy}/Button.tsx"])).toBe(expected);
    });

    it("is true when any pattern matches and false for an empty list", () => {
        expect(matchesAny("src/x.test.ts", ["**/__fixtures__/**", "**/*.test.*"])).toBe(true);
        expect(matchesAny("src/x.ts", ["**/*.test.*"])).toBe(false);
        expect(matchesAny("src/x.ts", [])).toBe(false);
    });
});
