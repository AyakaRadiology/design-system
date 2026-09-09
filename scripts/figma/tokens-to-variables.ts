/** Offline projection. No Figma IDs, network access, timestamps, or MCP calls. */
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { oklchToSrgb, parseOklch } from "../../src/color.js";
import { collectCustomProperties } from "../../src/lint/css.js";
import {
    parseSchema,
    type Schema,
    type TokenSpec,
    validateScales,
    validateVoice,
} from "../../src/lint/schema.js";

export const ROOT_FONT_PX = 16;
// Below Figma float precision; removes V8/JavaScriptCore transcendental noise.
const COLOR_DECIMAL_PLACES = 8;
const MILLISECONDS_PER_SECOND = 1000;
export const PLAN_VERSION = 1;
export type Mode = "light" | "dark";
export type TokenValues = Record<string, string>;
export interface TokenSource {
    schema: Schema;
    voices: Record<string, Partial<Record<Mode, TokenValues>>>;
}
export interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}
export type VariableValue = number | Rgba;
export interface VariablePlan {
    name: string;
    resolvedType: "COLOR" | "FLOAT";
    description: string;
    codeSyntax: string;
    scopes: string[];
    valuesByMode: Partial<Record<Mode, VariableValue>>;
    /** Required for exact OKLCH and unit preservation; never substitutes for value validation. */
    sourceByMode: Partial<Record<Mode, string>>;
}
export interface CollectionPlan {
    name: string;
    modes: Mode[];
    variables: VariablePlan[];
    /** CSS concepts that COLOR/FLOAT cannot represent, retained rather than dropped. */
    nonVariables: { name: string; reason: string; valuesByMode: Partial<Record<Mode, string>> }[];
}
export interface FigmaPlan {
    version: number;
    rootFontPx: number;
    schema: Schema;
    collections: CollectionPlan[];
}

const sorted = <T>(record: Record<string, T>) =>
    Object.entries(record).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const supported = (spec: TokenSpec) =>
    ["color", "length", "duration", "integer", "ratio"].includes(spec.type);

/** CSS cascade for the package's deliberately restricted theme grammar. */
function declarations(css: string, selectors: string[]): TokenValues {
    const result: TokenValues = {};
    for (const [name, entries] of collectCustomProperties(css)) {
        for (const selector of selectors) {
            const matches = entries.filter((entry) => entry.selector === selector);
            if (matches.length > 1) throw new Error(`Duplicate --${name} in ${selector}`);
            if (matches[0]) result[name] = matches[0].value;
        }
    }
    return result;
}

export function loadTokenSource(
    root = fileURLToPath(new URL("../../", import.meta.url)),
): TokenSource {
    const schema = parseSchema(
        JSON.parse(readFileSync(resolve(root, "tokens/schema.json"), "utf8")),
    );
    const scalesCss = readFileSync(resolve(root, "tokens/scales.css"), "utf8");
    const scaleErrors = validateScales(scalesCss, schema);
    if (scaleErrors.length) throw new Error(`Invalid scales: ${JSON.stringify(scaleErrors)}`);
    const scales = declarations(scalesCss, ["@theme", ":root"]);
    const voices: TokenSource["voices"] = {};
    const files = readdirSync(resolve(root, "voices"))
        .filter((name) => name.endsWith(".css"))
        .sort();
    if (!files.length) throw new Error("No voices found");
    for (const file of files) {
        const css = readFileSync(resolve(root, "voices", file), "utf8");
        const errors = validateVoice(css, schema);
        if (errors.length) throw new Error(`Invalid ${file}: ${JSON.stringify(errors)}`);
        const properties = collectCustomProperties(css);
        for (const [name, entries] of properties) {
            if (entries.some((entry) => ![":root", ".dark"].includes(entry.selector)))
                throw new Error(`Unsupported selector for --${name} in ${file}`);
        }
        const rootValues = { ...scales, ...declarations(css, [":root"]) };
        const dark = declarations(css, [".dark"]);
        const hasDark = Object.keys(dark).length > 0;
        // Dark-only is an explicit source contract, not inferred from a filename.
        const scheme = css.match(/color-scheme:\s*(light|dark)\s*;/)?.[1];
        if (!scheme) throw new Error(`Missing explicit color-scheme in ${file}`);
        voices[file.slice(0, -4)] = hasDark
            ? { light: rootValues, dark: { ...rootValues, ...dark } }
            : { [scheme]: rootValues };
    }
    return { schema, voices };
}

export function projectValue(raw: string, spec: TokenSpec): VariableValue {
    if (spec.type === "color") {
        const color = parseOklch(raw);
        if (
            ![color.l, color.c, color.h, color.alpha].every(Number.isFinite) ||
            color.l < 0 ||
            color.l > 1 ||
            color.c < 0 ||
            color.alpha < 0 ||
            color.alpha > 1
        )
            throw new Error(`Invalid color: ${raw}`);
        const [r, g, b] = oklchToSrgb(color.l, color.c, color.h);
        const stable = (channel: number) => Number(channel.toFixed(COLOR_DECIMAL_PLACES));
        return { r: stable(r), g: stable(g), b: stable(b), a: color.alpha };
    }
    const match = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem|ms|s)?$/.exec(raw);
    if (!match) throw new Error(`Unsupported ${spec.type}: ${raw}`);
    const value = Number(match[1]);
    const unit = match[2];
    if (!Number.isFinite(value)) throw new Error(`Non-finite value: ${raw}`);
    switch (spec.type) {
        case "length":
            if (unit === "px") return value;
            if (unit === "rem") return value * ROOT_FONT_PX;
            break;
        case "duration":
            if (unit === "ms") return value;
            if (unit === "s") return value * MILLISECONDS_PER_SECOND;
            break;
        case "integer":
            if (!unit && Number.isInteger(value)) return value;
            break;
        case "ratio":
            if (!unit) return value;
            break;
    }
    throw new Error(`Unsupported ${spec.type} unit: ${raw}`);
}

function scopes(name: string, spec: TokenSpec): string[] {
    if (spec.type === "color") {
        if (spec.role === "text" || name.endsWith("-fg")) return ["TEXT_FILL", "SHAPE_FILL"];
        if (spec.role === "border") return ["STROKE_COLOR"];
        return ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"];
    }
    if (name.endsWith("radius")) return ["CORNER_RADIUS"];
    if (name.endsWith("--line-height")) return ["LINE_HEIGHT"];
    if (name.startsWith("text-")) return ["FONT_SIZE"];
    if (spec.type === "length") return ["WIDTH_HEIGHT"];
    return [];
}

export function tokensToVariables(source: TokenSource): FigmaPlan {
    const schema = parseSchema(source.schema);
    const collections: CollectionPlan[] = sorted(source.voices).map(([voice, values]) => {
        const modes = (["light", "dark"] as const).filter((mode) => values[mode] !== undefined);
        if (!modes.length) throw new Error(`No modes for ${voice}`);
        const collection: CollectionPlan = { name: voice, modes, variables: [], nonVariables: [] };
        for (const mode of modes) {
            for (const name of Object.keys(values[mode] ?? {})) {
                if (!schema.tokens[name]) throw new Error(`Unknown token ${voice}/${mode}/${name}`);
            }
        }
        for (const [name, spec] of sorted(schema.tokens)) {
            const sourceByMode: Partial<Record<Mode, string>> = {};
            for (const mode of modes) {
                const raw = values[mode]?.[name];
                if (raw === undefined && spec.required)
                    throw new Error(`Missing ${voice}/${mode}/${name}`);
                if (raw !== undefined) sourceByMode[mode] = raw;
            }
            if (!Object.keys(sourceByMode).length) continue;
            if (Object.keys(sourceByMode).length !== modes.length)
                throw new Error(`Token ${voice}/${name} missing in a mode`);
            if (!supported(spec)) {
                collection.nonVariables.push({
                    name,
                    reason: `${spec.type} is not a COLOR or FLOAT variable`,
                    valuesByMode: sourceByMode,
                });
                continue;
            }
            const valuesByMode: VariablePlan["valuesByMode"] = {};
            for (const mode of modes) {
                const raw = sourceByMode[mode];
                if (raw !== undefined) valuesByMode[mode] = projectValue(raw, spec);
            }
            collection.variables.push({
                name,
                resolvedType: spec.type === "color" ? "COLOR" : "FLOAT",
                description: `${spec.role}: ${spec.doc}`,
                codeSyntax: `var(--${name})`,
                scopes: scopes(name, spec),
                valuesByMode,
                sourceByMode,
            });
        }
        return collection;
    });
    return { version: PLAN_VERSION, rootFontPx: ROOT_FONT_PX, schema, collections };
}

/** Exact roundtrip of an unedited plan. Edited values require an explicit reviewed diff. */
export function variablesToTokens(plan: FigmaPlan): TokenSource {
    if (plan.version !== PLAN_VERSION || plan.rootFontPx !== ROOT_FONT_PX)
        throw new Error("Unsupported plan version or root font size");
    const voices: TokenSource["voices"] = {};
    for (const collection of plan.collections) {
        if (voices[collection.name]) throw new Error(`Duplicate collection ${collection.name}`);
        const modes: Partial<Record<Mode, TokenValues>> = {};
        for (const mode of collection.modes) {
            if (modes[mode]) throw new Error(`Duplicate mode ${mode}`);
            const tokens: TokenValues = {};
            for (const entry of [
                ...collection.variables.map((variable) => ({
                    name: variable.name,
                    valuesByMode: variable.sourceByMode,
                })),
                ...collection.nonVariables,
            ]) {
                if (entry.name in tokens) throw new Error(`Duplicate token ${entry.name}`);
                const raw = entry.valuesByMode[mode];
                if (raw === undefined)
                    throw new Error(`Missing source ${collection.name}/${mode}/${entry.name}`);
                tokens[entry.name] = raw;
            }
            modes[mode] = tokens;
        }
        voices[collection.name] = modes;
    }
    const result = { schema: plan.schema, voices };
    // Checks values, descriptions, scopes, types, completeness and provenance;
    // editing a Figma value can NEVER be silently replaced with its old source.
    if (serializePlan(tokensToVariables(result)) !== serializePlan(plan))
        throw new Error(
            "Plan differs from its source projection; extract and review the Figma diff before updating tokens",
        );
    return result;
}

export function serializePlan(plan: FigmaPlan): string {
    return `${JSON.stringify(plan, null, 4)}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.length > 2)
        throw new Error("Usage: bun scripts/figma/tokens-to-variables.ts (writes JSON to stdout)");
    process.stdout.write(serializePlan(tokensToVariables(loadTokenSource())));
}
