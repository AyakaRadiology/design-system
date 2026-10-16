import { expect, it } from "vitest";
import { compositedContrast, parseOklch, type Rgb } from "./color.js";
import { compositedContrast as internalCompositedContrast } from "./lint/contrast.js";

it("exports alpha-aware contrast through the public color entry point", () => {
    expect(compositedContrast).toBeTypeOf("function");
    expect(compositedContrast).toBe(internalCompositedContrast);

    const text = parseOklch("oklch(1 0 0 / 0.5)");
    const fill = parseOklch("oklch(0 0 0)");
    const backdrop: Rgb = [1, 1, 1];
    expect(compositedContrast(text, fill, backdrop)).toBe(
        internalCompositedContrast(text, fill, backdrop),
    );
});
