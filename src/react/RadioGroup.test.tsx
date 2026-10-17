// @vitest-environment jsdom
import { DirectionProvider } from "@radix-ui/react-direction";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { RadioGroup } from "./RadioGroup.js";

it.each([undefined, "vertical", "horizontal"] as const)(
    "ignores arrows on the other axis with orientation=%s",
    async (orientation) => {
        const user = userEvent.setup();
        const change = vi.fn();
        render(
            <RadioGroup
                orientation={orientation}
                defaultValue="a"
                onValueChange={change}
                options={["a", "b", "c"].map((value) => ({ value, label: value }))}
            />,
        );
        await user.tab();
        const first = screen.getByRole("radio", { name: "a" });
        expect(first).toHaveFocus();
        const keys =
            orientation === "horizontal" ? ["ArrowDown", "ArrowUp"] : ["ArrowRight", "ArrowLeft"];
        for (const key of keys) {
            expect(fireEvent.keyDown(first, { key })).toBe(true);
            fireEvent.keyUp(first, { key });
            await user.keyboard(`{${key}}`);
            expect(first).toHaveFocus();
            expect(first).toBeChecked();
            expect(screen.getAllByRole("radio", { checked: true })).toEqual([first]);
            expect(change).not.toHaveBeenCalled();
        }
    },
);

it.each(["vertical", "horizontal"] as const)(
    "preserves same-axis selection with orientation=%s",
    async (orientation) => {
        const user = userEvent.setup();
        render(
            <RadioGroup
                orientation={orientation}
                defaultValue="a"
                options={["a", "b", "c"].map((value) => ({ value, label: value }))}
            />,
        );
        await user.tab();
        await user.keyboard(orientation === "vertical" ? "{ArrowDown}" : "{ArrowRight}");
        expect(screen.getByRole("radio", { name: "b" })).toHaveFocus();
        expect(screen.getByRole("radio", { name: "b" })).toBeChecked();
        await user.keyboard(orientation === "vertical" ? "{ArrowUp}" : "{ArrowLeft}");
        expect(screen.getByRole("radio", { name: "a" })).toHaveFocus();
        expect(screen.getByRole("radio", { name: "a" })).toBeChecked();
    },
);

it("uses inherited RTL direction for horizontal arrow selection and wrapping", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
        <DirectionProvider dir="rtl">
            <RadioGroup
                aria-label="Source"
                orientation="horizontal"
                defaultValue="one"
                onValueChange={change}
                options={[
                    { value: "one", label: "One" },
                    { value: "two", label: "Two" },
                    { value: "three", label: "Three" },
                ]}
            />
        </DirectionProvider>,
    );
    await user.tab();
    expect(screen.getByRole("radio", { name: "One" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Three" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Three" })).toBeChecked();
    expect(change.mock.calls).toEqual([["three"]]);

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "One" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "One" })).toBeChecked();
    expect(change.mock.calls).toEqual([["three"], ["one"]]);
});
