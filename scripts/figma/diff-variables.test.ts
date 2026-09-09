import { describe, expect, it } from "vitest";
import { diffVariables, equalStoredFloat, type LiveVariables } from "./diff-variables.js";
import { loadTokenSource, tokensToVariables } from "./tokens-to-variables.js";

const plan = tokensToVariables(loadTokenSource());
const snapshot = (): LiveVariables => structuredClone(plan);

describe("Figma diff extraction", () => {
    it("is empty for a matching snapshot", () =>
        expect(diffVariables(plan, snapshot())).toEqual([]));
    it("accepts exact Float32 storage but reports even adjacent representable edits", () => {
        const live = snapshot();
        const variable = live.collections[0]?.variables.find(
            (item) => item.name === "x-glass-saturate",
        );
        if (!variable) throw new Error("Missing saturation");
        // Observed from the first real Plugin API import/export on 2026-09-09.
        variable.valuesByMode.light = 1.0800000429153442;
        expect(diffVariables(plan, live)).toEqual([]);
        const nextFloat = new DataView(new ArrayBuffer(4));
        nextFloat.setFloat32(0, 1.08);
        nextFloat.setUint32(0, nextFloat.getUint32(0) + 1);
        variable.valuesByMode.light = nextFloat.getFloat32(0);
        expect(diffVariables(plan, live)).toHaveLength(1);
        expect(equalStoredFloat(1.08, 1.08 + Number.EPSILON)).toBe(false);
        expect(equalStoredFloat(10, 10.0000001)).toBe(false);
    });
    it("reports edited numeric values without manually copying tokens", () => {
        const live = snapshot();
        const variable = live.collections[0]?.variables.find(
            (item) => item.name === "x-glass-blur",
        );
        if (!variable) throw new Error("Missing blur");
        variable.valuesByMode.light = 12;
        expect(diffVariables(plan, live)).toEqual([
            { path: "base/x-glass-blur/light", before: 10, after: 12 },
        ]);
    });
    it("reports deleted collections and rejects unresolved aliases or incomplete modes", () => {
        const live = snapshot();
        live.collections.pop();
        expect(
            diffVariables(plan, live).some(
                (change) => change.path === "biomonitor/modes" && change.after === null,
            ),
        ).toBe(true);
        const broken = snapshot();
        const variable = broken.collections[0]?.variables[0];
        if (!variable) throw new Error("Missing variable");
        delete variable.valuesByMode.dark;
        expect(() => diffVariables(plan, broken)).toThrow("Missing or extra modes");
    });
    it("ignores float color storage noise but detects visible color changes", () => {
        const live = snapshot();
        const variable = live.collections[0]?.variables[0];
        const color = variable?.valuesByMode.light;
        if (!color || typeof color === "number") throw new Error("Missing color");
        color.r += 0.0000001;
        expect(diffVariables(plan, live)).toEqual([]);
        color.r += 0.01;
        expect(diffVariables(plan, live)).toHaveLength(1);
    });
});
