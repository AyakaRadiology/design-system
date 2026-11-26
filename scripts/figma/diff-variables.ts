/** Compare a saved adapter plan with a normalized Plugin API variable export. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type FigmaPlan, type Rgba, variablesToTokens } from "./tokens-to-variables.js";

const rgbChannels = ["r", "g", "b"] as const;
type LiveValue = number | (Omit<Rgba, "a"> & { a?: number });
type SnapshotValue = LiveValue | string | string[];

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
        defaultMode?: string | null;
        variables: {
            name: string;
            resolvedType: string;
            valuesByMode: Record<string, LiveValue>;
        }[];
    }[];
}
export interface VariableChange {
    path: string;
    before: unknown;
    after: unknown;
}

function validateValue(value: unknown): asserts value is LiveValue {
    if (typeof value === "number" && Number.isFinite(value)) return;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const channels = Object.entries(value);
        if (
            rgbChannels.every((key) => Object.hasOwn(value, key)) &&
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
    throw new Error(`Expected a resolved finite FLOAT, RGB or RGBA, got ${JSON.stringify(value)}`);
}

function flatten(snapshot: LiveVariables): Map<string, SnapshotValue> {
    const output = new Map<string, SnapshotValue>();
    const add = (path: string, value: SnapshotValue) => {
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
        // Plans and older exports represent the default as the first mode.
        const defaultMode =
            collection.defaultMode === undefined ? collection.modes[0] : collection.defaultMode;
        if (typeof defaultMode !== "string" || !modes.includes(defaultMode))
            throw new Error(`Invalid default mode in ${collection.name}`);
        add(`${collection.name}/defaultMode`, defaultMode);
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

function equal(a: SnapshotValue | undefined, b: SnapshotValue | undefined): boolean {
    if (typeof a === "number" && typeof b === "number") return equalStoredFloat(a, b);
    if (typeof a === "object" && !Array.isArray(a) && typeof b === "object" && !Array.isArray(b)) {
        return (
            rgbChannels.every((key) => Math.abs(a[key] - b[key]) <= COLOR_STORAGE_TOLERANCE) &&
            Math.abs((a.a ?? 1) - (b.a ?? 1)) <= COLOR_STORAGE_TOLERANCE
        );
    }
    return JSON.stringify(a) === JSON.stringify(b);
}

export function diffVariables(plan: FigmaPlan, live: LiveVariables): VariableChange[] {
    variablesToTokens(plan); // reject a stale/corrupted baseline rather than bless it
    const expected = flatten({
        collections: plan.collections.map((collection) => ({
            ...collection,
            defaultMode: collection.modes[0],
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

function readSnapshot(path: string) {
    return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const [, , baseline, live, ...extra] = process.argv;
    if (!baseline || !live || extra.length)
        throw new Error("Usage: bun scripts/figma/diff-variables.ts plan.json live.json");
    const changes = diffVariables(readSnapshot(baseline), readSnapshot(live));
    process.stdout.write(`${JSON.stringify(changes, null, 4)}\n`);
    if (changes.length) process.exitCode = 1;
}
