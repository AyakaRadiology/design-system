// @vitest-environment jsdom
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import ts from "typescript";
import { expect, it } from "vitest";
import { Tooltip, TooltipProvider } from "./Tooltip.js";

it("accepts the supported text and multi-node triggers at compile time", () => {
    void (<Tooltip content="x">Hello</Tooltip>);
    void (
        <Tooltip content="x">
            {[<button type="button" key="a" />, <button type="button" key="b" />]}
        </Tooltip>
    );
    void (
        <Tooltip content="x">
            <button type="button" />
            <button type="button" />
        </Tooltip>
    );
    // Vitest transpiles without checking types, so run the compiler explicitly.
    const program = ts.createProgram([fileURLToPath(import.meta.url), "vitest.setup.ts"], {
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

const cases: { name: string; nodes: ReactNode[]; text: string }[] = [
    { name: "text", nodes: ["Label"], text: "Label" },
    {
        name: "multiple children",
        nodes: [<span key="a">a</span>, <span key="b">b</span>],
        text: "ab",
    },
    {
        name: "an array",
        nodes: [[<span key="a">a</span>, <span key="b">b</span>]],
        text: "ab",
    },
    {
        name: "a Fragment",
        nodes: [
            <>
                <button type="button">a</button>
            </>,
        ],
        text: "a",
    },
];

it.each(cases)("provides a working focus trigger for $name at runtime", async ({ nodes, text }) => {
    const { container } = render(
        <TooltipProvider>
            <Tooltip content="x">{nodes.length === 1 ? nodes[0] : nodes}</Tooltip>
        </TooltipProvider>,
    );
    const trigger = container.querySelector<HTMLElement>("[data-state]");
    expect(trigger).not.toBeNull();
    expect(trigger).toHaveTextContent(text);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    const content = await screen.findByRole("tooltip");
    expect(content).toHaveTextContent("x");
    expect(trigger).toHaveAttribute("aria-describedby", content.id);
});

it("keeps a single element as the direct keyboard-accessible trigger", async () => {
    const { container } = render(
        <TooltipProvider>
            <Tooltip content="Helpful label">
                <button type="button">Trigger</button>
            </Tooltip>
        </TooltipProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Trigger" });
    expect(container.firstElementChild).toBe(trigger);
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    const content = await screen.findByRole("tooltip");
    expect(content).toHaveTextContent("Helpful label");
    expect(trigger).toHaveAttribute("aria-describedby", content.id);
});
