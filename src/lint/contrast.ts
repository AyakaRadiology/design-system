/* Colour maths for the voice gate.
 *
 * Ported from spine's `frontend/src/lib/contrast.ts` (the reference
 * implementation biomonitor's VOICE.md rule 7 names), generalised from one
 * dark-only palette to any number of voices in either one or two modes.
 *
 * The tokens are authored in oklch, but WCAG contrast is defined over sRGB, so
 * the gate needs a conversion. Browsers do it natively; a test in Node does
 * not, hence this hand-rolled OKLab pipeline — four matrix multiplications is
 * not a dependency.
 */

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

const DEG_TO_RAD = Math.PI / 180;

/** sRGB transfer function threshold and coefficients (IEC 61966-2-1). */
const GAMMA_LINEAR_CUTOFF = 0.0031308;
const GAMMA_SLOPE = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_EXP = 2.4;
/** Inverse transfer function cutoff — not `GAMMA_LINEAR_CUTOFF * GAMMA_SLOPE`
 * exactly; the sRGB spec rounds it. */
const DECODE_LINEAR_CUTOFF = 0.04045;

/** WCAG 2.x relative luminance weights and the ratio's flare constant. */
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;
const CONTRAST_FLARE = 0.05;

/** OKLab ΔE is reported ×100, which is the scale the dataviz validator's
 * separation floors are quoted on. */
const DELTA_E_SCALE = 100;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Linear-light channel → gamma-encoded sRGB, clamped into gamut. */
function encodeGamma(channel: number): number {
    const x = clamp01(channel);
    return x <= GAMMA_LINEAR_CUTOFF
        ? x * GAMMA_SLOPE
        : (1 + GAMMA_OFFSET) * x ** (1 / GAMMA_EXP) - GAMMA_OFFSET;
}

/** Gamma-encoded sRGB channel → linear light. */
function decodeGamma(channel: number): number {
    return channel <= DECODE_LINEAR_CUTOFF
        ? channel / GAMMA_SLOPE
        : ((channel + GAMMA_OFFSET) / (1 + GAMMA_OFFSET)) ** GAMMA_EXP;
}

/**
 * oklch → sRGB, via OKLab → LMS → linear sRGB → gamma encoding.
 * Out-of-gamut results are clamped per channel, matching how a browser
 * rasterises an unrepresentable oklch colour closely enough for contrast work.
 */
export function oklchToSrgb(l: number, c: number, h: number): Rgb {
    const a = c * Math.cos(h * DEG_TO_RAD);
    const b = c * Math.sin(h * DEG_TO_RAD);

    const lCbrt = l + 0.3963377774 * a + 0.2158037573 * b;
    const mCbrt = l - 0.1055613458 * a - 0.0638541728 * b;
    const sCbrt = l - 0.0894841775 * a - 1.291485548 * b;

    const lLms = lCbrt ** 3;
    const mLms = mCbrt ** 3;
    const sLms = sCbrt ** 3;

    return [
        encodeGamma(4.0767416621 * lLms - 3.3077115913 * mLms + 0.2309699292 * sLms),
        encodeGamma(-1.2684380046 * lLms + 2.6097574011 * mLms - 0.3413193965 * sLms),
        encodeGamma(-0.0041960863 * lLms - 0.7034186147 * mLms + 1.707614701 * sLms),
    ];
}

/** WCAG 2.x relative luminance of a gamma-encoded sRGB colour. */
export function relativeLuminance([r, g, b]: Rgb): number {
    return LUMA_R * decodeGamma(r) + LUMA_G * decodeGamma(g) + LUMA_B * decodeGamma(b);
}

const OKLCH_VALUE = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/i;

/**
 * Parse an `oklch(l c h)` or `oklch(l c h / a)` value.
 *
 * Throws on anything else, `color-mix()` included. That is the point rather
 * than an inconvenience: a token with no fixed rendered colour has no ratio to
 * assert about, so it must be left out of the contract deliberately, never
 * approximated into it.
 */
export function parseOklch(value: string): Oklch {
    const match = OKLCH_VALUE.exec(value.trim());
    if (!match) throw new Error(`"${value}" is not an oklch(l c h) colour`);
    const [, l, c, h, alpha, percent] = match;
    return {
        l: Number(l),
        c: Number(c),
        h: Number(h),
        alpha: alpha === undefined ? 1 : Number(alpha) / (percent === "%" ? 100 : 1),
    };
}

const asOklch = (colour: string | Oklch): Oklch =>
    typeof colour === "string" ? parseOklch(colour) : colour;

/** WCAG 2.x contrast ratio, 1..21; order-independent. */
export function contrastRatio(fg: string | Oklch, bg: string | Oklch): number {
    const foreground = asOklch(fg);
    const background = asOklch(bg);
    if (foreground.alpha !== 1 || background.alpha !== 1)
        throw new Error(
            "contrastRatio requires opaque colors; use compositedContrast with a backdrop",
        );
    const a = relativeLuminance(oklchToSrgb(foreground.l, foreground.c, foreground.h));
    const b = relativeLuminance(oklchToSrgb(background.l, background.c, background.h));
    const [hi, lo] = a >= b ? [a, b] : [b, a];
    return (hi + CONTRAST_FLARE) / (lo + CONTRAST_FLARE);
}

/**
 * OKLab ΔE ×100 — spine's definition, kept so the floors quoted in that repo
 * and in the dataviz validator mean the same thing here: plain Euclidean
 * distance in OKLab, not CIEDE2000.
 */
export function deltaE(a: string | Oklch, b: string | Oklch): number {
    const toLab = ({ l, c, h }: Oklch) => [
        l,
        c * Math.cos(h * DEG_TO_RAD),
        c * Math.sin(h * DEG_TO_RAD),
    ];
    const [al = 0, aa = 0, ab = 0] = toLab(asOklch(a));
    const [bl = 0, ba = 0, bb = 0] = toLab(asOklch(b));
    return Math.hypot(al - bl, aa - ba, ab - bb) * DELTA_E_SCALE;
}

/* Digits are part of a token name — the categorical chart slots are
 * `--chart-1`..`--chart-5`. */
const TOKEN_PATTERN = /--([a-z0-9-]+):\s*(oklch\([^)]*\))/g;

/**
 * Every `--name: oklch(…)` declaration in a CSS block, by token name.
 *
 * Opaque colours by default; includeAlpha opts into the compositing contract.
 * Alpha colors require a backdrop and compositedContrast. Derived
 * `color-mix()` colors such as --trace-glow are not parsed by this helper.
 */
export function parseTokens(css: string, includeAlpha = false): Map<string, Oklch> {
    const tokens = new Map<string, Oklch>();
    for (const [, name, value] of css.matchAll(TOKEN_PATTERN)) {
        if (!name || !value) continue;
        const parsed = parseOklch(value);
        if (includeAlpha || parsed.alpha === 1) tokens.set(name, parsed);
    }
    return tokens;
}

const LIGHT = ":root";
const DARK = ".dark";
const SCHEME_QUERY = "prefers-color-scheme";
const COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;

interface Block {
    /** Whatever precedes the braces: a selector, an at-rule, its prelude. */
    prelude: string;
    /** The braces' contents, nested rules and all. */
    body: string;
}

/**
 * Every outermost `{ … }` in the stylesheet, brace-matched so that a nested
 * rule — the `:root` inside a media query, say — stays part of its parent's
 * body instead of being counted as a block of its own.
 */
function topLevelBlocks(css: string): Block[] {
    const blocks: Block[] = [];
    let depth = 0;
    let openAt = -1;
    let preludeFrom = 0;

    for (let i = 0; i < css.length; i++) {
        if (css[i] === "{") {
            if (depth === 0) openAt = i;
            depth++;
        } else if (css[i] === "}") {
            if (depth === 0) throw new Error(`unbalanced "}" at index ${i} of the voice CSS`);
            if (--depth === 0) {
                blocks.push({
                    // Only the last statement is the prelude: a voice opens with
                    // `@import`s and possibly a `@custom-variant`, all of them
                    // brace-less and all of them swept up here otherwise.
                    prelude: (css.slice(preludeFrom, openAt).split(";").pop() ?? "").trim(),
                    body: css.slice(openAt + 1, i),
                });
                preludeFrom = i + 1;
            }
        }
    }
    if (depth !== 0) throw new Error(`unterminated block at index ${openAt} of the voice CSS`);
    return blocks;
}

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
export function tokenBlocks(css: string, includeAlpha = false): Map<string, Map<string, Oklch>> {
    // Comments first: a voice explains in prose why it is dark-only — including
    // the words this function refuses to see in code — and the braces in a
    // commented-out rule would confuse the brace matcher besides.
    const code = css.replace(COMMENT_PATTERN, "");

    if (code.includes(SCHEME_QUERY))
        throw new Error(
            `the voice CSS declares a "${SCHEME_QUERY}" block, but the floors only iterate ` +
                `"${LIGHT}" and "${DARK}" — a mode selected by the OS is a palette nothing checks`,
        );

    const declaring = topLevelBlocks(code)
        .map((block) => ({ prelude: block.prelude, tokens: parseTokens(block.body, includeAlpha) }))
        .filter((block) => block.tokens.size > 0);

    if (declaring.length === 0)
        throw new Error("no block in the voice CSS declares any oklch token");

    const blocks = new Map<string, Map<string, Oklch>>();
    for (const block of declaring) {
        if (block.prelude !== LIGHT && block.prelude !== DARK)
            throw new Error(
                `the voice CSS declares oklch tokens on "${block.prelude}", but the floors only ` +
                    `iterate "${LIGHT}" and "${DARK}" — a palette on any other selector goes unchecked`,
            );
        if (blocks.has(block.prelude))
            throw new Error(
                `the voice CSS declares "${block.prelude}" twice, so one of the two would go unchecked`,
            );
        blocks.set(block.prelude, block.tokens);
    }

    if (!blocks.has(LIGHT))
        throw new Error(`the voice CSS declares no "${LIGHT}" block, so it has no default palette`);

    // `:root` first, so a failure names the mode the reader expects to see first.
    return new Map([...blocks].sort(([a], [b]) => (a === LIGHT ? -1 : b === LIGHT ? 1 : 0)));
}

/** Source-over compositing in gamma-encoded sRGB, as used by CSS surfaces. */
export function composite(foreground: Oklch, background: Rgb): Rgb {
    const [r, g, b] = oklchToSrgb(foreground.l, foreground.c, foreground.h);
    const alpha = foreground.alpha;
    return [
        r * alpha + background[0] * (1 - alpha),
        g * alpha + background[1] * (1 - alpha),
        b * alpha + background[2] * (1 - alpha),
    ];
}

/** Text over a translucent fill over an opaque backdrop (including text alpha). */
export function compositedContrast(text: Oklch, fill: Oklch, backdrop: Rgb): number {
    const surface = composite(fill, backdrop);
    const a = relativeLuminance(composite(text, surface));
    const b = relativeLuminance(surface);
    return (Math.max(a, b) + CONTRAST_FLARE) / (Math.min(a, b) + CONTRAST_FLARE);
}
