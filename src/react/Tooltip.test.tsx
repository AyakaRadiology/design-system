// @vitest-environment jsdom
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ts from "typescript";
import { expect, it } from "vitest";
import { Tooltip, TooltipProvider } from "./Tooltip.js";

it("requires a single trigger element at compile time", () => {
    // @ts-expect-error text cannot be cloned by the trigger's Slot
    void (<Tooltip content="x">Hello</Tooltip>);
    const triggers = [<button type="button" key="a" />, <button type="button" key="b" />];
    // @ts-expect-error an array is not a single trigger element
    void (<Tooltip content="x">{triggers}</Tooltip>);
    void (
        (
            // @ts-expect-error siblings cannot be cloned as a single trigger
            <Tooltip content="x">
                <button type="button" />
                <button type="button" />
            </Tooltip>
        )
    );

    void (
        <Tooltip content="x">
            <button type="button">Trigger</button>
        </Tooltip>
    );

    // Vitest only transpiles: compile this file to enforce the directives.
    const program = ts.createProgram([fileURLToPath(import.meta.url)], {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        jsx: ts.JsxEmit.ReactJSX,
    });
    expect(
        ts.formatDiagnostics(ts.getPreEmitDiagnostics(program), {
            getCanonicalFileName: (name) => name,
            getCurrentDirectory: () => process.cwd(),
            getNewLine: () => "\n",
        }),
    ).toBe("");
}, 10_000);

it("renders the single child as a keyboard-accessible tooltip trigger", async () => {
    const { container } = render(
        <TooltipProvider delayDuration={0}>
            <Tooltip content="Helpful label">
                <button type="button">Trigger</button>
            </Tooltip>
        </TooltipProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Trigger" });
    expect(container.firstElementChild).toBe(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger);
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toBe("Helpful label");
    expect(trigger.getAttribute("aria-describedby")).toBe(tooltip.id);
});
