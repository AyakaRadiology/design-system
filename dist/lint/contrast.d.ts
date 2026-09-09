/** A parsed `oklch(l c h)` token value: L in 0..1, chroma, hue in degrees. */
export interface Oklch {
    l: number;
    c: number;
    h: number;
    /** 1 unless the value carried a `/ alpha` component. */
    alpha: number;
}
/** Gamma-encoded sRGB, each channel in 0..1. */
export type Rgb = [number, number, number];
/**
 * oklch → sRGB, via OKLab → LMS → linear sRGB → gamma encoding.
 * Out-of-gamut results are clamped per channel, matching how a browser
 * rasterises an unrepresentable oklch colour closely enough for contrast work.
 */
export declare function oklchToSrgb(l: number, c: number, h: number): Rgb;
/** WCAG 2.x relative luminance of a gamma-encoded sRGB colour. */
export declare function relativeLuminance([r, g, b]: Rgb): number;
/**
 * Parse an `oklch(l c h)` or `oklch(l c h / a)` value.
 *
 * Throws on anything else, `color-mix()` included. That is the point rather
 * than an inconvenience: a token with no fixed rendered colour has no ratio to
 * assert about, so it must be left out of the contract deliberately, never
 * approximated into it.
 */
export declare function parseOklch(value: string): Oklch;
/** WCAG 2.x contrast ratio, 1..21; order-independent. */
export declare function contrastRatio(fg: string | Oklch, bg: string | Oklch): number;
/**
 * OKLab ΔE ×100 — spine's definition, kept so the floors quoted in that repo
 * and in the dataviz validator mean the same thing here: plain Euclidean
 * distance in OKLab, not CIEDE2000.
 */
export declare function deltaE(a: string | Oklch, b: string | Oklch): number;
/**
 * Every `--name: oklch(…)` declaration in a CSS block, by token name.
 *
 * Opaque colours by default; includeAlpha opts into the compositing contract.
 * Alpha colors require a backdrop and compositedContrast. Derived
 * `color-mix()` colors such as --trace-glow are not parsed by this helper.
 */
export declare function parseTokens(css: string, includeAlpha?: boolean): Map<string, Oklch>;
/**
 * The token declarations of a voice, by mode.
 *
 * A voice is one palette (`:root`, dark-only) or two (`:root` plus `.dark`).
 * This is a function rather than a regex at the call site because of what it
 * refuses. A parse that simply found the blocks would happily read `:root` and
 * let a whole third palette past it untested, so anything that could BE another
 * palette is rejected outright:
 *
 *   - a `prefers-color-scheme` query anywhere, named for the specific case of
 *     a mode coming back through the OS rather than through the `dark` class;
 *   - a colour-declaring block on any other selector — `[data-theme="light"]`,
 *     a re-theme nested in some other at-rule — because the floors iterate the
 *     modes this returns and nothing else;
 *   - the same mode declared twice, which would leave one of the two
 *     unexamined.
 *
 * Blocks that declare no colour tokens are none of this gate's business and
 * pass without comment: `@theme`'s type scale, the `@theme inline` mappings,
 * `@layer base`.
 */
export declare function tokenBlocks(css: string, includeAlpha?: boolean): Map<string, Map<string, Oklch>>;
/** Source-over compositing in gamma-encoded sRGB, as used by CSS surfaces. */
export declare function composite(foreground: Oklch, background: Rgb): Rgb;
/** Text over a translucent fill over an opaque backdrop (including text alpha). */
export declare function compositedContrast(text: Oklch, fill: Oklch, backdrop: Rgb): number;
