// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it } from "vitest";
import { Glass } from "./Glass.js";

it("forwards semantics, ref and density without adding layout or interaction", () => {
    const ref = createRef<HTMLDivElement>();
    render(
        <Glass ref={ref} role="region" aria-label="Inputs" data-glass="strong" className="p-4">
            Input
        </Glass>,
    );
    expect(screen.getByRole("region", { name: "Inputs" })).toBe(ref.current);
    expect(ref.current).toHaveClass("ds-glass", "p-4");
    expect(ref.current).toHaveAttribute("data-glass", "strong");
});

it("keeps every voice within the Surface blur budget", () => {
    for (const file of readdirSync("voices").filter((name) => name.endsWith(".css"))) {
        const css = readFileSync(`voices/${file}`, "utf8");
        const values = [...css.matchAll(/--x-glass-blur:\s*([^;]+);/g)];
        expect(values.length).toBeGreaterThan(0);
        for (const [, value] of values) {
            expect(value).toMatch(/^\d+(\.\d+)?px$/);
            expect(Number.parseFloat(value ?? "")).toBeLessThanOrEqual(12);
        }
    }
    expect(readFileSync("tokens/glass.css", "utf8")).not.toMatch(/\bwill-change\s*:/);
});
