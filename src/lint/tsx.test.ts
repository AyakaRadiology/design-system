import ts from "typescript";
import { describe, expect, it } from "vitest";
import { L1 } from "./rules/L1-color-literal.js";
import { parseTsx } from "./tsx.js";
import type { RuleContext } from "./types.js";

const context: RuleContext = {
    themeFile: "theme.css",
    schemaTokens: new Set(),
    extensionPrefix: "x-",
};

describe("parseTsx", () => {
    it.each(["ts", "mts", "cts"])("finds colours after a generic arrow in .%s", (extension) => {
        const file = `a.${extension}`;
        const source = parseTsx(
            file,
            'const identity = <T>(value: T) => value; const color = "#ff0000";',
        );
        expect(L1.checkTsx?.(file, source, context)).toEqual([
            expect.objectContaining({
                rule: "L1",
                file,
                message: expect.stringContaining("#ff0000"),
            }),
        ]);
        expect(source.languageVariant).toBe(ts.LanguageVariant.Standard);
    });

    it.each(["tsx", "jsx"])("preserves JSX parsing for .%s", (extension) => {
        const file = `a.${extension}`;
        const source = parseTsx(file, 'const view = <div color="#ff0000" />;');
        expect(source.languageVariant).toBe(ts.LanguageVariant.JSX);
        expect(L1.checkTsx?.(file, source, context)).toHaveLength(1);
    });
});
