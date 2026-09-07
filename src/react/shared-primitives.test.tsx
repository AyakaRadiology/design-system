// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parse } from "postcss";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import {
    BuildStamp,
    Button,
    Dialog,
    DialogBody,
    DialogContent,
    Numeric,
    type NumericProps,
    RadioGroup,
    STATUS_STATES,
    StatusPill,
    type StatusState,
    TooltipProvider,
} from "./index.js";

const scales = parse(readFileSync("tokens/scales.css", "utf8"));
function declarations(selector: string) {
    const result: Record<string, string> = {};
    scales.walkRules(selector, (rule) => {
        rule.walkDecls((decl) => {
            result[decl.prop] = `${decl.value}${decl.important ? " !important" : ""}`;
        });
    });
    return result;
}

describe("DialogBody", () => {
    it("shrinks only the body within the small viewport, preserving header and footer", () => {
        render(
            <Dialog open>
                <DialogContent title="Help" actions={<Button>Close</Button>}>
                    <DialogBody aria-label="Help content">Long help</DialogBody>
                </DialogContent>
            </Dialog>,
        );
        const dialog = screen.getByRole("dialog", { name: "Help" });
        const body = screen.getByLabelText("Help content");
        expect(dialog).toHaveClass("ds-dialog-content", "flex", "flex-col");
        expect(body).toHaveClass("ds-dialog-body", "min-h-0", "overflow-y-auto");
        expect(body.parentElement).toHaveClass("flex", "min-h-0", "flex-col");
        expect(screen.getByRole("heading")).toHaveClass("shrink-0");
        expect(screen.getByRole("button").parentElement).toHaveClass("shrink-0");
        expect(body).not.toContainElement(screen.getByRole("heading"));
        expect(body).not.toContainElement(screen.getByRole("button"));
        expect(declarations(".ds-dialog-content")["max-height"]).toBe(
            "calc(100svh - var(--spacing) * 8)",
        );
        expect(declarations(".ds-dialog-body")).toMatchObject({
            "max-height": "100svh",
            "scrollbar-width": "thin",
            "scrollbar-color": "var(--text-secondary) var(--bg-elevated)",
            "scrollbar-gutter": "stable",
        });
        expect(declarations(".ds-dialog-body::after")).toMatchObject({
            position: "sticky",
            bottom: "0",
            background: "linear-gradient(transparent, var(--bg-elevated))",
            "pointer-events": "none",
        });
    });
});

describe("Numeric value contract", () => {
    it("types value and children as mutually exclusive contracts", () => {
        expectTypeOf<{ value: number; children: string }>().not.toMatchTypeOf<NumericProps>();
        expectTypeOf<{ value: null; unit: string }>().toMatchTypeOf<NumericProps>();
        expectTypeOf<{ children: string; unit: string }>().toMatchTypeOf<NumericProps>();
    });

    it("keeps both widths across value, zero and empty, preserving unit case", () => {
        const { container, rerender } = render(
            <Numeric value={12.34} unit="mm" precision={1} reservedChars={5} />,
        );
        const value = container.querySelector<HTMLElement>('[data-slot="value"]');
        const unit = screen.getByText("mm");
        expect(container.firstChild).toHaveClass("font-mono", "tabular-nums");
        expect(value).toHaveTextContent("12.3");
        expect(value?.style.width).toBe("5ch");
        expect(value).toHaveClass("shrink-0");
        expect(unit.style.width).toBe("2ch");
        expect(unit).toHaveClass("shrink-0", "normal-case", "text-text-secondary");
        rerender(<Numeric value={0} unit="mm" precision={1} reservedChars={5} />);
        expect(value).toHaveTextContent("0.0");
        rerender(<Numeric value={null} unit="mm" precision={1} reservedChars={5} />);
        expect(screen.getByText("—")).toHaveClass("text-xs", "text-text-tertiary");
        expect(screen.getByText("—")).toHaveAttribute("aria-hidden", "true");
        expect(screen.getByText("No value")).toHaveClass("sr-only");
        expect(unit).toHaveClass("text-text-tertiary", "normal-case");
        expect(value?.style.width).toBe("5ch");
        expect(unit.style.width).toBe("2ch");
    });

    it("defaults to six reserved characters and zero decimals, without a phantom unit", () => {
        const { container } = render(<Numeric value={-12.4} />);
        expect(screen.getByText("-12").style.width).toBe("6ch");
        expect(container.querySelector('[data-slot="unit"]')).toBeNull();
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        "rejects invalid readings (%s) instead of silently treating them as missing",
        (value) => {
            expect(() => render(<Numeric value={value} />)).toThrow("finite or null");
        },
    );

    it.each([-1, 1.5, 101, Number.NaN])("rejects invalid precision %s", (precision) => {
        expect(() => render(<Numeric value={null} precision={precision} />)).toThrow("precision");
    });

    it.each([0, -1, 1.5, Number.POSITIVE_INFINITY])("rejects invalid width %s", (reservedChars) => {
        expect(() => render(<Numeric value={1} reservedChars={reservedChars} />)).toThrow(
            "reservedChars",
        );
    });
});

describe("StatusPill semantics", () => {
    it("keeps the typed mapping and consumer rules in agreement", () => {
        const rules = readFileSync("docs/ui-rules.md", "utf8");
        expectTypeOf<StatusState<"warning">>().toEqualTypeOf<"degraded" | "stale" | "lost">();
        expect(STATUS_STATES).toEqual({
            success: ["healthy", "live"],
            warning: ["degraded", "stale", "lost"],
            danger: ["error", "invalid", "offline"],
            info: ["connecting"],
            neutral: ["unknown", "loading"],
        });
        for (const [tone, states] of Object.entries(STATUS_STATES)) {
            expect(rules).toContain(`| ${tone} | ${states.join(", ")} |`);
        }
    });

    it("opens detail on keyboard focus and dismisses it on Escape", async () => {
        render(
            <TooltipProvider>
                <StatusPill status="warning" detail="No samples for 5 seconds" tabIndex={-1}>
                    Stale
                </StatusPill>
            </TooltipProvider>,
        );
        const trigger = screen.getByText("Stale");
        expect(trigger.tabIndex).toBe(0);
        expect(screen.queryByRole("tooltip")).toBeNull();
        await userEvent.tab();
        expect(trigger).toHaveFocus();
        expect(await screen.findByRole("tooltip")).toHaveTextContent("No samples for 5 seconds");
        expect(trigger).toHaveAccessibleDescription("No samples for 5 seconds");
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    });

    it("opens detail on hover and adds no tab stop without detail", async () => {
        render(
            <TooltipProvider delayDuration={0}>
                <StatusPill status="success">Live</StatusPill>
                <StatusPill status="info" detail="Waiting for handshake">
                    Connecting
                </StatusPill>
            </TooltipProvider>,
        );
        expect(screen.getByText("Live").tabIndex).toBe(-1);
        await userEvent.hover(screen.getByText("Connecting"));
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Waiting for handshake");
    });

    it("prevents animation utilities from blinking the pill or label", () => {
        render(
            <StatusPill status="danger" className="animate-pulse">
                Offline
            </StatusPill>,
        );
        expect(screen.getByText("Offline")).toHaveClass("ds-status-pill");
        expect(declarations(".ds-status-pill,\n.ds-status-pill *")).toMatchObject({
            animation: "none",
            transition: "none",
        });
    });
});

const options = [
    { value: "one", label: "One" },
    { value: "two", label: "Two", disabled: true },
    { value: "three", label: "Three" },
];

describe("RadioGroup", () => {
    it("tabs to the selection; arrows select, skip disabled items, and wrap", async () => {
        render(<RadioGroup aria-label="Source" options={options} defaultValue="one" />);
        expect(screen.getByRole("radiogroup", { name: "Source" })).toBeInTheDocument();
        const one = screen.getByRole("radio", { name: "One" });
        const three = screen.getByRole("radio", { name: "Three" });
        await userEvent.tab();
        expect(one).toHaveFocus();
        expect(one).toBeChecked();
        // Radix defers roving focus to a timer; keep the key held until that
        // focus event selects the item, as a physical keypress does.
        await userEvent.keyboard("{ArrowDown>}");
        await waitFor(() => expect(three).toBeChecked());
        await userEvent.keyboard("{/ArrowDown}");
        expect(three).toHaveFocus();
        expect(one).not.toBeChecked();
        await userEvent.keyboard("{ArrowDown>}");
        await waitFor(() => expect(one).toBeChecked());
        await userEvent.keyboard("{/ArrowDown}");
        expect(screen.getByRole("radio", { name: "Two" })).toBeDisabled();
    });

    it("Space selects an initially unchecked option and submits its value", async () => {
        const { container } = render(
            <form>
                <RadioGroup aria-label="Source" name="source" options={options} />
            </form>,
        );
        await userEvent.tab();
        const one = screen.getByRole("radio", { name: "One" });
        expect(one).not.toBeChecked();
        await userEvent.keyboard(" ");
        expect(one).toBeChecked();
        const form = container.querySelector("form");
        if (!form) throw new Error("Form missing");
        expect(new FormData(form).get("source")).toBe("one");
    });

    it("supports horizontal RTL arrows, controlled updates, and visible label clicks", async () => {
        const change = vi.fn();
        const { rerender } = render(
            <RadioGroup
                options={options}
                value="one"
                onValueChange={change}
                orientation="horizontal"
                dir="rtl"
            />,
        );
        await userEvent.tab();
        await userEvent.keyboard("{ArrowLeft>}");
        await waitFor(() => expect(change).toHaveBeenCalledWith("three"));
        await userEvent.keyboard("{/ArrowLeft}");
        expect(screen.getByRole("radio", { name: "One" })).toBeChecked();
        rerender(<RadioGroup options={options} value="three" onValueChange={change} />);
        expect(screen.getByRole("radio", { name: "Three" })).toBeChecked();
        fireEvent.click(screen.getByText("One"));
        expect(change).toHaveBeenLastCalledWith("one");
    });

    it("disables the whole group", async () => {
        const change = vi.fn();
        render(<RadioGroup options={options} disabled onValueChange={change} />);
        for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
        await userEvent.click(screen.getByText("One"));
        expect(change).not.toHaveBeenCalled();
    });
});

describe("BuildStamp", () => {
    it("puts unmodified build metadata on an opaque, contrast-tested voice plate", () => {
        render(
            <BuildStamp
                name="Guide"
                describe="v0.1.2-3-gabc-dirty"
                buildTime="2026-09-07T12:34:56Z"
            />,
        );
        const stamp = screen.getByText("Guide").parentElement;
        expect(stamp).toHaveClass(
            "bg-bg-elevated",
            "text-text-secondary",
            "text-xs",
            "normal-case",
        );
        expect(stamp?.className).not.toMatch(/opacity-|bg-bg-elevated\/|absolute|fixed/);
        expect(screen.getByText("v0.1.2-3-gabc-dirty")).toBeInTheDocument();
        expect(screen.getByText("2026-09-07T12:34:56Z")).toHaveAttribute(
            "datetime",
            "2026-09-07T12:34:56Z",
        );
    });
});
