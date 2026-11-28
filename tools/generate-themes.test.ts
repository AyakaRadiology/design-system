import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseTokens } from "../src/lint/contrast.js";
import { renderSet, rootBody, THEME_SETS } from "./generate-themes.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (path: string) => readFileSync(`${ROOT}${path}`, "utf8");

/** Body of the block opened by exactly `selector {`. */
function block(css: string, selector: string): string {
    const open = css.indexOf(`${selector} {`);
    if (open === -1) throw new Error(`no ${selector} block`);
    return css.slice(open, css.indexOf("}", open));
}

describe("theme sets", () => {
    for (const set of THEME_SETS) {
        const css = read(`themes/${set.name}.css`);

        it(`themes/${set.name}.css is what the generator writes`, () => {
            expect(css).toBe(renderSet(set, (voice) => read(`voices/${voice}.css`)));
        });

        it(`every ${set.name} member carries its voice's palette, value for value`, () => {
            for (const [theme, voice] of Object.entries(set.members)) {
                const source = parseTokens(rootBody(read(`voices/${voice}.css`), voice), true);
                const member = parseTokens(block(css, `:root[data-theme="${theme}"]`), true);
                expect(source.size).toBeGreaterThan(30);
                expect(member).toEqual(source);
            }
        });

        it(`bare :root in ${set.name} draws the default member`, () => {
            const voice = set.members[set.defaultTheme] ?? "";
            const css_ = read(`voices/${voice}.css`);
            const bare = css.slice(0, css.indexOf(":root[data-theme="));
            expect(parseTokens(block(bare, ":root"), true)).toEqual(
                parseTokens(rootBody(css_, voice), true),
            );
        });
    }

    it("refuses a two-mode voice as a member", () => {
        expect(() =>
            rootBody(":root { --bg: oklch(1 0 0); } .dark { --bg: oklch(0 0 0); }", "x"),
        ).toThrow(/single-mode/);
    });
});
