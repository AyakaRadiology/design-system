// @vitest-environment jsdom
import { DirectionProvider } from "@radix-ui/react-direction";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { RadioGroup } from "./RadioGroup.js";

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
