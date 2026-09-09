/** Compare a saved adapter plan with a normalized Plugin API variable export. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type FigmaPlan, type VariableValue, variablesToTokens } from "./tokens-to-variables.js";

// Figma stores single-precision color channels. This absorbs storage noise only.
export const COLOR_STORAGE_TOLERANCE = 0.000001;

/** Figma persists FLOAT values as Float32 too. Accept only the authored number
 * or its exact storage representation, never a general numeric epsilon. */
export function equalStoredFloat(expected: number, actual: number): boolean {
    return actual === expected || actual === Math.fround(expected);
}
export interface LiveVariables {
    collections: {
        name: string;
        modes: string[];
        variables: {
            name: string;
            resolvedType: string;
            valuesByMode: Record<string, VariableValue>;
        }[];
    }[];
}
export interface VariableChange {
    path: string;
    before: unknown;
    after: unknown;
}

function validateValue(value: unknown): asserts value is VariableValue {
    if (typeof value === "number" && Number.isFinite(value)) return;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const channels = Object.entries(value);
        if (
            channels.length === 4 &&
            channels.every(
                ([key, channel]) =>
                    ["r", "g", "b", "a"].includes(key) &&
                    typeof channel === "number" &&
                    Number.isFinite(channel) &&
                    channel >= 0 &&
                    channel <= 1,
            )
        )
            return;
    }
    throw new Error(`Expected a resolved finite FLOAT or RGBA, got ${JSON.stringify(value)}`);
}

function flatten(snapshot: LiveVariables): Map<string, unknown> {
    const output = new Map<string, unknown>();
    const add = (path: string, value: unknown) => {
        if (output.has(path)) throw new Error(`Duplicate snapshot entry ${path}`);
        output.set(path, value);
    };
    for (const collection of snapshot.collections) {
        if (
            typeof collection.name !== "string" ||
            !collection.name ||
            collection.name.includes("/")
        )
            throw new Error("Invalid collection name");
        const modes = [...collection.modes].sort();
        if (
            !modes.length ||
            new Set(modes).size !== modes.length ||
            modes.some((mode) => typeof mode !== "string" || !mode || mode.includes("/"))
        )
            throw new Error(`Invalid modes in ${collection.name}`);
        add(`${collection.name}/modes`, modes);
        for (const variable of collection.variables) {
            if (typeof variable.name !== "string" || !variable.name || variable.name.includes("/"))
                throw new Error("Expected a semantic token name without slashes");
            if (!["COLOR", "FLOAT"].includes(variable.resolvedType))
                throw new Error(`Unsupported variable type ${variable.resolvedType}`);
            const path = `${collection.name}/${variable.name}`;
            add(`${path}/type`, variable.resolvedType);
            if (JSON.stringify(Object.keys(variable.valuesByMode).sort()) !== JSON.stringify(modes))
                throw new Error(`Missing or extra modes on ${path}`);
            for (const mode of modes) {
                const value = variable.valuesByMode[mode];
                validateValue(value);
                if ((typeof value === "number") !== (variable.resolvedType === "FLOAT"))
                    throw new Error(`Wrong value type on ${path}/${mode}`);
                add(`${path}/${mode}`, value);
            }
        }
    }
    return output;
}

function equal(a: unknown, b: unknown): boolean {
    if (typeof a === "number" && typeof b === "number") return equalStoredFloat(a, b);
    if (
        typeof a === "object" &&
        a !== null &&
        !Array.isArray(a) &&
        typeof b === "object" &&
        b !== null &&
        !Array.isArray(b)
    ) {
        return Object.entries(a).every(
            ([key, value]) =>
                key in b &&
                typeof value === "number" &&
                Math.abs(value - Reflect.get(b, key)) <= COLOR_STORAGE_TOLERANCE,
        );
    }
    return JSON.stringify(a) === JSON.stringify(b);
}

export function diffVariables(plan: FigmaPlan, live: LiveVariables): VariableChange[] {
    variablesToTokens(plan); // reject a stale/corrupted baseline rather than bless it
    const expected = flatten({
        collections: plan.collections.map((collection) => ({
            ...collection,
            variables: collection.variables.map((variable) => ({
                ...variable,
                valuesByMode: variable.valuesByMode,
            })),
        })),
    });
    const actual = flatten(live);
    return [...new Set([...expected.keys(), ...actual.keys()])].sort().flatMap((path) => {
        const before = expected.get(path);
        const after = actual.get(path);
        return equal(before, after) ? [] : [{ path, before: before ?? null, after: after ?? null }];
    });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const [, , baseline, live, ...extra] = process.argv;
    if (!baseline || !live || extra.length)
        throw new Error("Usage: bun scripts/figma/diff-variables.ts plan.json live.json");
    const changes = diffVariables(
        JSON.parse(readFileSync(baseline, "utf8")),
        JSON.parse(readFileSync(live, "utf8")),
    );
    process.stdout.write(`${JSON.stringify(changes, null, 4)}\n`);
    if (changes.length) process.exitCode = 1;
}
