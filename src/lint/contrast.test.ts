import { describe, expect, it } from "vitest";
import {
    composite,
    compositedContrast,
    contrastRatio,
    deltaE,
    oklchToSrgb,
    parseOklch,
    parseTokens,
    relativeLuminance,
    tokenBlocks,
} from "./contrast.js";

const WHITE = "oklch(1 0 0)";
const BLACK = "oklch(0 0 0)";

describe("parseOklch", () => {
    it("reads lightness, chroma and hue", () => {
        expect(parseOklch("oklch(0.42 0.15 195)")).toEqual({ l: 0.42, c: 0.15, h: 195, alpha: 1 });
    });

    it("reads a percentage alpha", () => {
        expect(parseOklch("oklch(0.5 0.1 200 / 50%)").alpha).toBeCloseTo(0.5, 6);
    });

    it("reads a fractional alpha", () => {
        expect(parseOklch("oklch(0.5 0.1 200 / 0.25)").alpha).toBeCloseTo(0.25, 6);
    });

    it("refuses a value that is not an opaque oklch colour", () => {
        expect(() => parseOklch("color-mix(in oklab, var(--accent) 45%, transparent)")).toThrow(
            /not an oklch/,
        );
    });
});

describe("oklchToSrgb", () => {
    it("maps the achromatic ends to black and white", () => {
        expect(oklchToSrgb(0, 0, 0)).toEqual([0, 0, 0]);
        for (const channel of oklchToSrgb(1, 0, 0)) expect(channel).toBeCloseTo(1, 6);
    });

    it("clamps a colour outside the sRGB gamut rather than returning nonsense", () => {
        for (const channel of oklchToSrgb(0.5, 0.9, 150)) {
            expect(channel).toBeGreaterThanOrEqual(0);
            expect(channel).toBeLessThanOrEqual(1);
        }
    });
});

describe("relativeLuminance", () => {
    it("is 0 for black and 1 for white", () => {
        expect(relativeLuminance([0, 0, 0])).toBeCloseTo(0, 6);
        expect(relativeLuminance([1, 1, 1])).toBeCloseTo(1, 6);
    });

    /* #767676 is the canonical WCAG mid-grey: the darkest grey that still
     * clears 4.5 against white, and #777777 does not. Pinning the property
     * rather than the luminance constant, because the property is the thing
     * every floor in voices.test.ts is expressed in. */
    it("puts the WCAG mid-grey exactly where AA starts", () => {
        const grey = (byte: number) => {
            const channel = byte / 255;
            return 1.05 / (relativeLuminance([channel, channel, channel]) + 0.05);
        };
        expect(grey(0x76)).toBeGreaterThanOrEqual(4.5);
        expect(grey(0x77)).toBeLessThan(4.5);
    });
});

describe("contrastRatio", () => {
    it("refuses to silently discard alpha in opaque-pair gates", () => {
        expect(() => contrastRatio("oklch(1 0 0 / 0.5)", BLACK)).toThrow("requires opaque");
        expect(() => contrastRatio(WHITE, "oklch(0 0 0 / 0.5)")).toThrow("requires opaque");
    });
    it("is 21 for white on black", () => {
        expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 2);
    });

    it("is 1 for a colour on itself", () => {
        expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 6);
    });

    it("does not depend on which colour is named first", () => {
        const accent = "oklch(0.51 0.09 183)";
        expect(contrastRatio(accent, WHITE)).toBeCloseTo(contrastRatio(WHITE, accent), 10);
    });
});

describe("deltaE", () => {
    it("is 0 for a colour against itself", () => {
        expect(deltaE("oklch(0.5 0.1 200)", "oklch(0.5 0.1 200)")).toBeCloseTo(0, 10);
    });

    /* OKLab Euclidean distance ×100, spine's definition: two colours that
     * differ only in lightness are exactly that difference apart. */
    it("is the lightness difference ×100 when only lightness differs", () => {
        expect(deltaE("oklch(0.4 0 0)", "oklch(0.6 0 0)")).toBeCloseTo(20, 6);
    });

    it("grows with hue separation at equal lightness and chroma", () => {
        const near = deltaE("oklch(0.5 0.15 100)", "oklch(0.5 0.15 120)");
        const far = deltaE("oklch(0.5 0.15 100)", "oklch(0.5 0.15 180)");
        expect(far).toBeGreaterThan(near);
    });
});

describe("parseTokens", () => {
    it("reads every opaque oklch declaration", () => {
        const tokens = parseTokens("--bg: oklch(0.2 0.015 225); --text: oklch(0.94 0.008 100);");
        expect(tokens.get("bg")).toEqual({ l: 0.2, c: 0.015, h: 225, alpha: 1 });
        expect(tokens.size).toBe(2);
    });

    /* A token built with color-mix() or carrying an alpha has no fixed
     * rendered colour, so there is no ratio to assert about it. Such tokens are
     * left out rather than approximated. */
    it("leaves out a token that has no fixed rendered colour", () => {
        const tokens = parseTokens(
            "--accent: oklch(0.8 0.12 178); --trace-glow: color-mix(in oklab, var(--accent) 45%, transparent);",
        );
        expect(tokens.has("trace-glow")).toBe(false);
        expect(tokens.size).toBe(1);
    });
});

/* The floors below hold one palette at a time. This holds the PARSE, because a
 * theme block that slipped past it would go uninspected while every assertion
 * in voices.test.ts still passed. */
describe("tokenBlocks — the theme guard", () => {
    const ROOT = ":root { --bg: oklch(0.2 0.015 225); --text: oklch(0.94 0.008 100); }";
    const DARK = ".dark { --bg: oklch(0.235 0.006 265); --text: oklch(0.93 0.005 265); }";
    /* Declares no colour of its own, like the real files' @theme blocks. */
    const MAPPINGS = "@theme inline { --color-bg: var(--bg); }";

    it("reads a dark-only voice as one block", () => {
        const blocks = tokenBlocks(`${ROOT} ${MAPPINGS}`);
        expect([...blocks.keys()]).toEqual([":root"]);
        expect(blocks.get(":root")?.size).toBe(2);
    });

    it("reads a light+dark voice as two", () => {
        expect([...tokenBlocks(`${ROOT}\n${DARK}`).keys()]).toEqual([":root", ".dark"]);
    });

    it("ignores blocks that declare no colour tokens", () => {
        const scales = "@theme { --text-xs: 0.75rem; }";
        const base = "@layer base { body { background: var(--bg-subtle); } }";
        expect(tokenBlocks(`${ROOT} ${scales} ${MAPPINGS} ${base}`).get(":root")?.size).toBe(2);
    });

    it("looks past the at-rules a voice opens with", () => {
        const preamble =
            '@import "../tokens/scales.css";\n@custom-variant dark (&:where(.dark, .dark *));\n';
        expect([...tokenBlocks(`${preamble}${ROOT}`).keys()]).toEqual([":root"]);
    });

    it("rejects a theme hiding in a scheme query", () => {
        const query =
            "@media (prefers-color-scheme: dark) { :root { --bg: oklch(0.2 0.01 265); } }";
        expect(() => tokenBlocks(`${ROOT} ${query}`)).toThrow(/prefers-color-scheme/);
    });

    /* The case the scheme-query check alone would miss: a theme selected by an
       attribute rather than by the OS. */
    it("rejects a theme on a selector the floors do not iterate", () => {
        expect(() => tokenBlocks(`${ROOT} [data-theme="light"] { --bg: oklch(1 0 0); }`)).toThrow(
            /\[data-theme="light"\]/,
        );
    });

    it("rejects a second block re-declaring the same mode", () => {
        expect(() => tokenBlocks(`${ROOT} :root { --bg: oklch(0.5 0.01 225); }`)).toThrow(/twice/);
    });

    it("says so when there are no tokens to read at all", () => {
        expect(() => tokenBlocks(MAPPINGS)).toThrow(/no block/);
    });

    it("refuses to guess at malformed CSS", () => {
        expect(() => tokenBlocks(":root { --bg: oklch(0.2 0.015 225);")).toThrow(/unterminated/);
        expect(() => tokenBlocks(`${ROOT} }`)).toThrow(/unbalanced/);
    });
});

describe("glass compositing", () => {
    it("composites alpha in sRGB, not OKLCH or linear light", () => {
        const halfWhite = parseOklch("oklch(1 0 0 / 0.5)");
        for (const channel of composite(halfWhite, [0, 0, 0])) expect(channel).toBeCloseTo(0.5);
        expect(compositedContrast(parseOklch("oklch(0 0 0)"), halfWhite, [0, 0, 0])).toBeCloseTo(
            5.28,
            2,
        );
        expect(compositedContrast(halfWhite, parseOklch("oklch(0 0 0)"), [1, 1, 1])).toBeCloseTo(
            5.28,
            2,
        );
    });
    it("includes translucent tokens only when explicitly requested", () => {
        const css = ":root { --x-glass-fill: oklch(1 0 0 / 0.92); }";
        expect(tokenBlocks(css, true).get(":root")?.get("x-glass-fill")?.alpha).toBe(0.92);
        expect(parseTokens(css).size).toBe(0);
    });
});
