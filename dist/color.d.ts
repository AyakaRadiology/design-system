/**
 * The colour maths behind the voice gate, as a public entry point.
 *
 * `@ayaka/design-system/color`.
 *
 * A consumer painting to a canvas or a WebGL uniform cannot hand the GPU an
 * `oklch()` string, and cannot ask the browser to resolve one in a Node test
 * either — so without this they would either hard-code the sRGB triple beside
 * the token (the drift rule L1 exists to prevent, moved one file over) or
 * reach into `dist/lint/contrast.js`, which is a build artifact and no
 * contract at all. This subpath makes the conversion part of the package's
 * public surface, so a token stays the single source of the value even where
 * the value has to leave CSS.
 *
 * Everything here is pure and dependency-free: four matrix multiplications and
 * a transfer function. It is the same code `src/lint/voices.test.ts` holds
 * every voice to, so a consumer's assertion about a colour and this package's
 * own gate cannot disagree about what that colour is.
 */
export { contrastRatio, deltaE, type Oklch, oklchToSrgb, parseOklch, parseTokens, type Rgb, relativeLuminance, } from "./lint/contrast.js";
