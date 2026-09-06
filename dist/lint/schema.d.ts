export declare const TOKEN_TYPES: readonly ["color", "font", "length", "integer", "duration", "easing", "shadow"];
export type TokenType = (typeof TOKEN_TYPES)[number];
export declare const TOKEN_ROLES: readonly ["surface", "border", "text", "accent", "status", "series", "signature", "type", "font", "z", "motion"];
export type TokenRole = (typeof TOKEN_ROLES)[number];
export interface TokenSpec {
    type: TokenType;
    role: TokenRole;
    required: boolean;
    doc: string;
}
export interface Schema {
    version: number;
    extensionPrefix: string;
    tokens: Record<string, TokenSpec>;
}
export interface Violation {
    code: "missing" | "unknown" | "type";
    token: string;
    where: string;
}
/**
 * Roles a VOICE owns: the same role in two voices takes different values, so
 * every voice file has to declare them itself.
 */
export declare const VOICE_ROLES: ReadonlySet<TokenRole>;
/**
 * Roles the SCALES own: voice-independent by definition (a type ramp does not
 * change when the palette does), so they are declared once in
 * `tokens/scales.css`, which every voice imports.
 */
export declare const SCALE_ROLES: ReadonlySet<TokenRole>;
/** Parse and shape-check a `tokens/schema.json`. A malformed schema is an
 * error, never a schema with fewer rules in it. */
export declare function parseSchema(json: unknown): Schema;
/**
 * This package's own schema, read from `tokens/schema.json` at runtime.
 *
 * Read rather than imported: `tokens/` sits outside the compiled `src/`, so an
 * `import` of it would either fall out of the emitted `dist/` or force the
 * whole tokens directory through the TypeScript build. The relative path is
 * the same two levels from `src/lint/` and from `dist/lint/`, so one
 * expression serves the test run and the shipped CLI.
 *
 * `fileURLToPath` rather than handing `readFileSync` the URL object: under a
 * jsdom test environment the global `URL` is jsdom's, and `node:fs` rejects it.
 */
export declare function schemaPath(): string;
export declare function loadPackageSchema(): Schema;
/**
 * Hold a voice file to the schema: every required voice-owned token declared
 * on `:root`, every required colour declared again on `.dark` if the voice has
 * a dark block at all, no custom property the schema does not know, and no
 * value that has drifted off its declared type.
 *
 * A voice with no `.dark` block is a dark-only voice and is checked once — one
 * set of values held to the floors once, which is the contract
 * `voices/biomonitor/VOICE.md` rule 1 states in prose.
 */
export declare function validateVoice(css: string, schema: Schema): Violation[];
/**
 * Hold `tokens/scales.css` to the schema. Split from `validateVoice` because
 * the two files answer different halves of the schema: a voice carries the
 * values that change between products, the scales carry the ones that do not.
 * Without this, the scale half of the schema would be declared by nothing and
 * checked by nobody.
 */
export declare function validateScales(css: string, schema: Schema): Violation[];
/**
 * Every colour token must have a `--color-<name>` line in `tailwind.css`.
 *
 * A colour with no mapping generates no utility, so the only way to reach it
 * from a component is the literal that rule L1 exists to reject — the token
 * would be present, unusable, and silent about it. AGENTS.md tells whoever
 * promotes a token to add the line; this is what makes forgetting a red build.
 */
export declare function validateTailwindMapping(css: string, schema: Schema): Violation[];
