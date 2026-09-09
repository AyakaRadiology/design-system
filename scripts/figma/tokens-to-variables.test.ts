import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
    loadTokenSource,
    projectValue,
    serializePlan,
    tokensToVariables,
    variablesToTokens,
} from "./tokens-to-variables.js";

const source = loadTokenSource();
const plan = tokensToVariables(source);

describe("offline Figma adapter", () => {
    it("roundtrips the JSON-serialized plan to every source token, including non-variable CSS", () => {
        expect(variablesToTokens(JSON.parse(serializePlan(plan)))).toEqual(source);
    });
    it("is deterministic across processes, independent of the working directory", () => {
        const script = new URL("./tokens-to-variables.ts", import.meta.url).pathname;
        const first = execFileSync("bun", [script], { encoding: "utf8" });
        const second = execFileSync("bun", [script], { cwd: "/", encoding: "utf8" });
        expect(first).toBe(second);
        expect(first).toBe(serializePlan(plan));
    });
    it("preserves source modes, semantic names and every schema role", () => {
        expect(plan.collections.map(({ name, modes }) => ({ name, modes }))).toEqual([
            { name: "base", modes: ["light", "dark"] },
            { name: "biomonitor", modes: ["dark"] },
        ]);
        for (const collection of plan.collections) {
            for (const variable of collection.variables) {
                const spec = source.schema.tokens[variable.name];
                expect(variable.description).toBe(`${spec?.role}: ${spec?.doc}`);
                expect(variable.codeSyntax).toBe(`var(--${variable.name})`);
                expect(variable.scopes).not.toContain("ALL_SCOPES");
            }
            const glass = collection.variables.filter((variable) =>
                variable.name.startsWith("x-glass-"),
            );
            expect(glass.map((variable) => variable.name)).toEqual([
                "x-glass-blur",
                "x-glass-border",
                "x-glass-fill",
                "x-glass-fill-strong",
                "x-glass-highlight",
                "x-glass-radius",
                "x-glass-saturate",
            ]);
            expect(
                collection.nonVariables.find((token) => token.name === "x-glass-shadow"),
            ).toBeDefined();
        }
    });
    it("converts dimensions, durations and translucent colors without discarding alpha", () => {
        const base = plan.collections.find((collection) => collection.name === "base");
        expect(
            base?.variables.find((variable) => variable.name === "text-sm")?.valuesByMode.light,
        ).toBe(14);
        expect(
            base?.variables.find((variable) => variable.name === "motion-fast")?.valuesByMode.dark,
        ).toBe(120);
        expect(
            base?.variables.find((variable) => variable.name === "x-glass-fill")?.valuesByMode
                .light,
        ).toEqual({ r: expect.closeTo(1), g: expect.closeTo(1), b: expect.closeTo(1), a: 0.92 });
        const length = source.schema.tokens["text-sm"];
        const duration = source.schema.tokens["motion-fast"];
        if (!length || !duration) throw new Error("Required schema specs missing");
        expect(projectValue("2rem", length)).toBe(32);
        expect(projectValue("0.2s", duration)).toBe(200);
        expect(() => projectValue("2em", length)).toThrow("Unsupported");
    });
    it("detects a missing required token, an unknown token and unsupported CSS", () => {
        const missing = structuredClone(source);
        delete missing.voices.base?.light?.accent;
        expect(() => tokensToVariables(missing)).toThrow("Missing base/light/accent");
        const unknown = structuredClone(source);
        if (!unknown.voices.base?.light) throw new Error("Missing base/light");
        unknown.voices.base.light.surprise = "1";
        expect(() => tokensToVariables(unknown)).toThrow("Unknown token");
        const invalid = structuredClone(source);
        if (!invalid.voices.base?.light) throw new Error("Missing base/light");
        invalid.voices.base.light.accent = "var(--other)";
        expect(() => tokensToVariables(invalid)).toThrow("not an oklch");
    });
    it("rejects edited Figma values instead of returning the old source", () => {
        const edited = structuredClone(plan);
        const blur = edited.collections[0]?.variables.find(
            (variable) => variable.name === "x-glass-blur",
        );
        if (!blur) throw new Error("Missing glass blur");
        blur.valuesByMode.light = 12;
        expect(() => variablesToTokens(edited)).toThrow("differs from its source");
    });
    it("rejects deleted variables, duplicate collections and future plan versions", () => {
        const removed = structuredClone(plan);
        removed.collections[0]?.variables.shift();
        expect(() => variablesToTokens(removed)).toThrow("Missing");
        const duplicate = structuredClone(plan);
        const collection = duplicate.collections[0];
        if (!collection) throw new Error("Missing collection");
        duplicate.collections.push(collection);
        expect(() => variablesToTokens(duplicate)).toThrow("Duplicate collection");
        expect(() => variablesToTokens({ ...plan, version: 2 })).toThrow("Unsupported plan");
    });
});
