// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneElement, type ReactElement, type ReactNode } from "react";
import { expect, expectTypeOf, it } from "vitest";
import { Tooltip, type TooltipProps, TooltipProvider } from "./Tooltip.js";

it("requires a single React element in the public type", () => {
    expectTypeOf<TooltipProps["children"]>().toEqualTypeOf<ReactElement>();
});

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
    // Replace a valid element's children to exercise untyped JavaScript callers.
    const tooltip = cloneElement(
        <Tooltip content="x">
            <span />
        </Tooltip>,
        {},
        ...nodes,
    );
    const { container } = render(<TooltipProvider>{tooltip}</TooltipProvider>);
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
