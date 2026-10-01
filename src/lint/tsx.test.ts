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

describe("JSX attribute entities", () => {
    it.each(["&#35;", "&#x23;", "&num;"])("finds a colour encoded with %s", (entity) => {
        const text = `const view = <svg fill="${entity}ff0000" />;`;
        expect(L1.checkTsx?.("a.tsx", parseTsx("a.tsx", text), context)).toEqual([
            expect.objectContaining({
                rule: "L1",
                line: 1,
                col: text.indexOf(entity) + 1,
                message: expect.stringContaining("#ff0000"),
            }),
        ]);
    });

    it.each([
        ["&#35;f&#102;0000", "#ff0000"],
        ["rgb&lpar;255, 0, 0&rpar;", "rgb("],
    ])("decodes entities within a colour: %s", (value, colour) => {
        const text = `const view = <svg fill="${value}" />;`;
        expect(L1.checkTsx?.("a.tsx", parseTsx("a.tsx", text), context)).toEqual([
            expect.objectContaining({ message: expect.stringContaining(colour) }),
        ]);
    });

    it("preserves positions after entities and across source lines", () => {
        const text =
            'const view = <svg fill="&amp;&NotEqualTilde;&#x1F600; &#35;ff0000\n&#x23;00ff00" />;';
        expect(L1.checkTsx?.("a.tsx", parseTsx("a.tsx", text), context)).toEqual([
            expect.objectContaining({ line: 1, col: text.indexOf("&#35;") + 1 }),
            expect.objectContaining({ line: 2, col: 1 }),
        ]);
    });

    it.each([
        'const value = "&#35;ff0000";',
        'const view = <svg fill={"&#35;ff0000"} />;',
        'const view = <svg fill="&amp;#35;ff0000" />;',
        'const view = <svg fill="&unknown;ff0000" />;',
    ])("does not decode JavaScript strings, recursively, or unknown entities: %s", (text) => {
        expect(L1.checkTsx?.("a.tsx", parseTsx("a.tsx", text), context)).toEqual([]);
    });
});
