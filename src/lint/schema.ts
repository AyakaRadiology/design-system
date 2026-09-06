import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { collectCustomProperties } from "./css.js";

export const TOKEN_TYPES = [
    "color",
    "font",
    "length",
    "integer",
    "duration",
    "easing",
    "shadow",
] as const;
export type TokenType = (typeof TOKEN_TYPES)[number];

export const TOKEN_ROLES = [
    "surface",
    "border",
    "text",
    "accent",
    "status",
    "series",
    "signature",
    "type",
    "font",
    "z",
    "motion",
] as const;
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
export const VOICE_ROLES: ReadonlySet<TokenRole> = new Set<TokenRole>([
    "surface",
    "border",
    "text",
    "accent",
    "status",
    "series",
    "signature",
]);

/**
 * Roles the SCALES own: voice-independent by definition (a type ramp does not
 * change when the palette does), so they are declared once in
 * `tokens/scales.css`, which every voice imports.
 */
export const SCALE_ROLES: ReadonlySet<TokenRole> = new Set<TokenRole>([
    "type",
    "font",
    "z",
    "motion",
]);

const ROOT = ":root";
const DARK = ".dark";
const THEME_INLINE = "@theme inline";

/**
 * Tailwind v4 theme namespaces that produce utilities rather than name a
 * design token. They only ever appear inside `@theme`, and they are the
 * package's own output — `--z-index-modal` exists so that `z-modal` does —
 * so the "unknown token" check has to let them through. A namespace prefix
 * outside `@theme` is still an unknown token, because there it generates
 * nothing.
 */
const TAILWIND_NAMESPACES = ["color-", "z-index-", "text-", "font-", "container-"];

/**
 * What a value has to look like for its declared type. Deliberately shallow:
 * the point is to catch a token that changed meaning (a colour slot holding a
 * length), not to reimplement CSS value parsing.
 *
 * `shadow` and `font` accept any non-empty value. A font stack is a
 * comma-separated list of quoted and bare family names with no shape worth
 * asserting, and the one `shadow` token — `--trace-glow` — holds the COLOUR
 * that the signature element's glow is drawn in, so there is no box-shadow
 * grammar to check either.
 */
const TYPE_PATTERNS: Record<TokenType, RegExp> = {
    color: /^(oklch\(|oklab\(|rgba?\(|hsla?\(|color-mix\(|color\(|var\(|#)/i,
    font: /\S/,
    length: /^(-?[\d.]+(rem|em|px|ch|vh|vw|%)$|0$|calc\(|var\()/,
    integer: /^-?\d+$/,
    duration: /^[\d.]+m?s$/,
    easing: /^(cubic-bezier\(|linear$|linear\(|ease|steps\()/,
    shadow: /\S/,
};

function isTailwindNamespace(name: string, selector: string): boolean {
    if (!selector.startsWith("@theme")) return false;
    return TAILWIND_NAMESPACES.some((prefix) => name.startsWith(prefix));
}

/** Parse and shape-check a `tokens/schema.json`. A malformed schema is an
 * error, never a schema with fewer rules in it. */
export function parseSchema(json: unknown): Schema {
    if (typeof json !== "object" || json === null) throw new Error("schema is not an object");
    const raw = json as Record<string, unknown>;
    if (typeof raw.version !== "number") throw new Error("schema.version must be a number");
    if (typeof raw.extensionPrefix !== "string")
        throw new Error("schema.extensionPrefix must be a string");
    if (typeof raw.tokens !== "object" || raw.tokens === null)
        throw new Error("schema.tokens must be an object");

    const tokens: Record<string, TokenSpec> = {};
    for (const [name, value] of Object.entries(raw.tokens as Record<string, unknown>)) {
        if (typeof value !== "object" || value === null)
            throw new Error(`schema token ${name} is not an object`);
        const spec = value as Record<string, unknown>;
        if (!TOKEN_TYPES.includes(spec.type as TokenType))
            throw new Error(`schema token ${name} has unknown type ${String(spec.type)}`);
        if (!TOKEN_ROLES.includes(spec.role as TokenRole))
            throw new Error(`schema token ${name} has unknown role ${String(spec.role)}`);
        if (typeof spec.required !== "boolean")
            throw new Error(`schema token ${name} has no boolean "required"`);
        if (typeof spec.doc !== "string" || spec.doc.trim() === "")
            throw new Error(`schema token ${name} has no "doc"`);
        tokens[name] = {
            type: spec.type as TokenType,
            role: spec.role as TokenRole,
            required: spec.required,
            doc: spec.doc,
        };
    }
    return { version: raw.version, extensionPrefix: raw.extensionPrefix, tokens };
}

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
export function schemaPath(): string {
    return fileURLToPath(new URL("../../tokens/schema.json", import.meta.url).href);
}

export function loadPackageSchema(): Schema {
    return parseSchema(JSON.parse(readFileSync(schemaPath(), "utf8")));
}

function checkKnownAndTyped(
    declared: Map<string, { selector: string; value: string }[]>,
    schema: Schema,
): Violation[] {
    const violations: Violation[] = [];
    for (const [name, occurrences] of declared) {
        const spec = schema.tokens[name];
        for (const occurrence of occurrences) {
            if (!spec) {
                if (!isTailwindNamespace(name, occurrence.selector))
                    violations.push({ code: "unknown", token: name, where: occurrence.selector });
                continue;
            }
            if (!TYPE_PATTERNS[spec.type].test(occurrence.value))
                violations.push({ code: "type", token: name, where: occurrence.selector });
        }
    }
    return violations;
}

function missingFrom(
    declared: Map<string, { selector: string; value: string }[]>,
    schema: Schema,
    roles: ReadonlySet<TokenRole>,
    where: string,
    predicate: (spec: TokenSpec) => boolean = () => true,
): Violation[] {
    const violations: Violation[] = [];
    for (const [name, spec] of Object.entries(schema.tokens)) {
        if (!spec.required || !roles.has(spec.role) || !predicate(spec)) continue;
        const occurrences = declared.get(name) ?? [];
        if (!occurrences.some((occurrence) => occurrence.selector === where))
            violations.push({ code: "missing", token: name, where });
    }
    return violations;
}

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
export function validateVoice(css: string, schema: Schema): Violation[] {
    const declared = collectCustomProperties(css);
    const violations = missingFrom(declared, schema, VOICE_ROLES, ROOT);
    const hasDark = [...declared.values()].some((occurrences) =>
        occurrences.some((occurrence) => occurrence.selector === DARK),
    );
    if (hasDark)
        violations.push(
            ...missingFrom(declared, schema, VOICE_ROLES, DARK, (spec) => spec.type === "color"),
        );
    violations.push(...checkKnownAndTyped(declared, schema));
    return violations;
}

/**
 * Hold `tokens/scales.css` to the schema. Split from `validateVoice` because
 * the two files answer different halves of the schema: a voice carries the
 * values that change between products, the scales carry the ones that do not.
 * Without this, the scale half of the schema would be declared by nothing and
 * checked by nobody.
 */
export function validateScales(css: string, schema: Schema): Violation[] {
    const declared = collectCustomProperties(css);
    const violations: Violation[] = [];
    for (const [name, spec] of Object.entries(schema.tokens)) {
        if (!spec.required || !SCALE_ROLES.has(spec.role)) continue;
        if (!declared.has(name)) violations.push({ code: "missing", token: name, where: ROOT });
    }
    violations.push(...checkKnownAndTyped(declared, schema));
    return violations;
}

/**
 * Every colour token must have a `--color-<name>` line in `tailwind.css`.
 *
 * A colour with no mapping generates no utility, so the only way to reach it
 * from a component is the literal that rule L1 exists to reject — the token
 * would be present, unusable, and silent about it. AGENTS.md tells whoever
 * promotes a token to add the line; this is what makes forgetting a red build.
 */
export function validateTailwindMapping(css: string, schema: Schema): Violation[] {
    const declared = collectCustomProperties(css);
    const violations: Violation[] = [];
    for (const [name, spec] of Object.entries(schema.tokens)) {
        if (spec.type !== "color") continue;
        if (!declared.has(`color-${name}`))
            violations.push({ code: "missing", token: name, where: THEME_INLINE });
    }
    return violations;
}
