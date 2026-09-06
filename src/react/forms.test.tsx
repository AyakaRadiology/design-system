// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Field } from "./Field.js";
import { Input } from "./Input.js";
import { Select } from "./Select.js";
import { Switch } from "./Switch.js";

describe("Field", () => {
    it("points the label at the control it wraps", () => {
        render(
            <Field label="Port">
                <Input />
            </Field>,
        );
        expect(screen.getByLabelText("Port")).toBe(screen.getByRole("textbox"));
    });

    it("uses the id the caller fixed rather than inventing one", () => {
        render(
            <Field label="Port" htmlFor="port">
                <Input />
            </Field>,
        );
        expect(screen.getByRole("textbox")).toHaveAttribute("id", "port");
    });

    it("keeps an id the control already had", () => {
        render(
            <Field label="Port">
                <Input id="preset" />
            </Field>,
        );
        expect(screen.getByRole("textbox")).toHaveAttribute("id", "preset");
    });

    /* A hint that is not named in aria-describedby is invisible to a screen
     * reader, which is the whole reason this component wires it. */
    it("announces a hint through aria-describedby", () => {
        render(
            <Field label="Port" hint="8790 by default">
                <Input />
            </Field>,
        );
        expect(screen.getByRole("textbox")).toHaveAccessibleDescription("8790 by default");
    });

    it("announces an error and marks the control invalid", () => {
        render(
            <Field label="Port" error="must be a number">
                <Input />
            </Field>,
        );
        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAccessibleDescription("must be a number");
        expect(screen.getByText("must be a number")).toHaveClass("text-danger");
    });

    it("announces a hint and an error together", () => {
        render(
            <Field label="Port" hint="8790 by default" error="must be a number">
                <Input />
            </Field>,
        );
        expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
            "8790 by default must be a number",
        );
    });

    it("marks nothing invalid when there is no error", () => {
        render(
            <Field label="Port">
                <Input />
            </Field>,
        );
        expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    });

    /* Two controls under one label is not a layout this can wire correctly,
     * and labelling the first while silently orphaning the second is worse
     * than refusing. */
    it("refuses more than one control", () => {
        expect(() =>
            render(
                <Field label="Port">
                    <Input />
                    <Input />
                </Field>,
            ),
        ).toThrow();
    });

    it("labels a Select the same way it labels an Input", () => {
        render(
            <Field label="Mode">
                <Select options={[{ value: "a", label: "A" }]} placeholder="pick" />
            </Field>,
        );
        expect(screen.getByLabelText("Mode")).toBe(screen.getByRole("combobox"));
    });
});

describe("Input", () => {
    it("follows the accessible invalid state for its border", () => {
        render(<Input aria-invalid />);
        expect(screen.getByRole("textbox")).toHaveClass("aria-invalid:border-danger");
    });

    it("accepts typing", async () => {
        render(<Input />);
        await userEvent.type(screen.getByRole("textbox"), "8790");
        expect(screen.getByRole("textbox")).toHaveValue("8790");
    });
});

describe("Select", () => {
    it("shows the placeholder until something is chosen", () => {
        render(<Select options={[{ value: "v1", label: "v1" }]} placeholder="protocol" />);
        expect(screen.getByRole("combobox")).toHaveTextContent("protocol");
    });

    it("opens and reports the chosen value", async () => {
        const onValueChange = vi.fn();
        render(
            <Select
                options={[
                    { value: "v1", label: "v1" },
                    { value: "v2", label: "v2" },
                ]}
                placeholder="protocol"
                onValueChange={onValueChange}
            />,
        );
        await userEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByRole("option", { name: "v2" })).toBeInTheDocument());
        await userEvent.click(screen.getByRole("option", { name: "v2" }));
        expect(onValueChange).toHaveBeenCalledWith("v2");
    });

    it("wears the same height and border as an Input", () => {
        render(<Select options={[]} />);
        expect(screen.getByRole("combobox")).toHaveClass("h-8", "border-border-strong");
    });

    /* The menu floats over the page, so it names the elevated surface; the
     * trigger sits in the page and does not. */
    it("draws its menu on the elevated surface", async () => {
        render(<Select options={[{ value: "v1", label: "v1" }]} placeholder="protocol" />);
        await userEvent.click(screen.getByRole("combobox"));
        await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());
        expect(screen.getByRole("listbox").closest(".bg-bg-elevated")).not.toBeNull();
    });
});

describe("Switch", () => {
    it("toggles its state and reports the change", async () => {
        const onCheckedChange = vi.fn();
        render(<Switch aria-label="Follow" onCheckedChange={onCheckedChange} />);
        const toggle = screen.getByRole("switch", { name: "Follow" });
        expect(toggle).toHaveAttribute("data-state", "unchecked");
        await userEvent.click(toggle);
        expect(onCheckedChange).toHaveBeenCalledWith(true);
        expect(toggle).toHaveAttribute("data-state", "checked");
    });

    it("honours a controlled checked prop", () => {
        render(<Switch aria-label="Follow" checked onCheckedChange={() => {}} />);
        expect(screen.getByRole("switch")).toHaveAttribute("data-state", "checked");
    });

    /* The travel is arithmetic: w-8 track minus p-0.5 either side minus a
     * size-3 knob leaves exactly the 16px translate-x-4 moves. */
    it("moves the knob exactly the width the track leaves it", () => {
        render(<Switch aria-label="Follow" defaultChecked />);
        const track = screen.getByRole("switch");
        expect(track).toHaveClass("h-4", "w-8", "p-0.5");
        expect(track.firstElementChild).toHaveClass("size-3", "data-[state=checked]:translate-x-4");
    });

    it("is disabled when told to be", async () => {
        const onCheckedChange = vi.fn();
        render(<Switch aria-label="Follow" disabled onCheckedChange={onCheckedChange} />);
        await userEvent.click(screen.getByRole("switch"));
        expect(onCheckedChange).not.toHaveBeenCalled();
    });
});

describe("Field wires a Switch too", () => {
    it("labels it", () => {
        render(
            <Field label="Follow live">
                <Switch />
            </Field>,
        );
        expect(screen.getByLabelText("Follow live")).toBe(screen.getByRole("switch"));
    });
});
