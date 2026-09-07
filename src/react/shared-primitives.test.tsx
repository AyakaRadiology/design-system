// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parse } from "postcss";
import { version } from "react";
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

/* The reserved width travels as a count of monospace characters on a custom
 * property; `.ds-numeric-slot` is what turns it into a width. */
function slotChars(slot: HTMLElement | null | undefined) {
    return slot?.style.getPropertyValue("--ds-numeric-chars");
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
        expect(slotChars(value)).toBe("5");
        expect(value).toHaveClass("ds-numeric-slot", "shrink-0");
        expect(slotChars(unit)).toBe("2");
        expect(unit).toHaveClass(
            "ds-numeric-slot",
            "shrink-0",
            "normal-case",
            "text-text-secondary",
        );
        rerender(<Numeric value={0} unit="mm" precision={1} reservedChars={5} />);
        expect(value).toHaveTextContent("0.0");
        rerender(
            <Numeric value={null} unit="mm" precision={1} showUnitWhenEmpty reservedChars={5} />,
        );
        expect(screen.getByText("—")).toHaveClass("text-text-tertiary");
        expect(screen.getByText("—")).toHaveAttribute("aria-hidden", "true");
        expect(screen.getByText("No value")).toHaveClass("sr-only");
        expect(screen.getByText("mm")).toHaveClass("text-text-tertiary", "normal-case");
        expect(slotChars(value)).toBe("5");
        expect(slotChars(screen.getByText("mm"))).toBe("2");
    });

    /* The count is only half the contract; the other half is the rule that
     * turns it into a width, which ships in the package's own CSS and is the
     * half a consumer's build can drop. */
    it("sizes both slots from the shipped class, not from an inline width", () => {
        const { container } = render(<Numeric value={1} unit="mm" reservedChars={4} />);
        for (const slot of container.querySelectorAll<HTMLElement>("[data-slot]")) {
            expect(slot).toHaveClass("ds-numeric-slot");
            expect(slot.style.width).toBe("");
        }
        expect(declarations(".ds-numeric-slot")).toMatchObject({
            width: "calc(var(--ds-numeric-chars) * 1ch)",
        });
    });

    it("defaults to six reserved characters and zero decimals, without a phantom unit", () => {
        const { container } = render(<Numeric value={-12.4} />);
        expect(slotChars(screen.getByText("-12"))).toBe("6");
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

    it.each([0, -1, 1.5, Number.NaN])("rejects invalid unit width %s", (reservedUnitChars) => {
        expect(() =>
            render(<Numeric value={1} unit="ms" reservedUnitChars={reservedUnitChars} />),
        ).toThrow("reservedUnitChars");
    });

    /* A latency readout counts in ms, then s, then min. Sized from the string,
     * the unit slot is three widths, and everything to its right moves twice
     * while the machine is doing nothing unusual. */
    it("pins the unit slot so a changing unit does not move the cells beside it", () => {
        const { rerender } = render(
            <Numeric value={900} unit="ms" reservedChars={4} reservedUnitChars={3} />,
        );
        const pinned = slotChars(screen.getByText("ms"));
        rerender(<Numeric value={1} unit="min" reservedChars={4} reservedUnitChars={3} />);
        expect(slotChars(screen.getByText("min"))).toBe(pinned);
        expect(pinned).toBe("3");
    });

    it("defaults the unit slot to the unit's own length", () => {
        render(<Numeric value={1} unit="mm/s" />);
        expect(slotChars(screen.getByText("mm/s"))).toBe("4");
    });

    /* The empty readout is deliberately quiet, and both halves of that are
     * contract: needle-simulator #1020 gates the widest light run in an empty
     * CT-console hero at 40px, and needle-guide #551 was a 12px dash beside a
     * 112px unit in full value colour. The dash was never the problem. */
    it("keeps the empty readout quiet at a hero size", () => {
        const heroPx = 112;
        render(
            <div style={{ fontSize: `${heroPx / 16}rem` }}>
                <Numeric value={null} unit="mm" reservedChars={4} />
            </div>,
        );
        const glyph = screen.getByText("—");
        expect(glyph).toHaveClass("ds-numeric-empty", "text-text-tertiary");
        expect(screen.queryByText("mm")).toBeNull();
        /* The box the reading will land in does not shrink with its
         * placeholder: only the glyph is scaled. */
        expect(getComputedStyle(glyph.parentElement as Element).fontSize).toBe(`${heroPx}px`);

        /* jsdom loads no stylesheet, so the size itself is asserted where it
         * is declared, and the ratio is read back rather than restated: 0.25
         * of a 112px hero is the 28px this contract promises. */
        const scale = Number(declarations(":root")["--numeric-empty-scale"]);
        expect(scale).toBe(0.25);
        expect(scale * heroPx).toBe(28);
        expect(declarations(".ds-numeric-empty")["font-size"]).toBe(
            "max(calc(var(--numeric-empty-scale) * 1em), var(--text-xs))",
        );
    });

    it("keeps the floor above the smallest legible step in a dense row", () => {
        /* A 14px row scaled by the ratio is 3.5px, which is why the rule is a
         * max() against the xs step rather than a bare multiplication. */
        const scale = Number(declarations(":root")["--numeric-empty-scale"]);
        expect(scale * 14).toBeLessThan(12);
        expect(declarations(".ds-numeric-empty")["font-size"]).toContain("var(--text-xs)");
    });

    it("brings the unit back, muted, only when asked", () => {
        const { container, rerender } = render(
            <Numeric value={null} unit="mm" reservedChars={4} />,
        );
        expect(container.querySelector('[data-slot="unit"]')).toBeNull();
        rerender(<Numeric value={null} unit="mm" reservedChars={4} showUnitWhenEmpty />);
        const unit = screen.getByText("mm");
        expect(unit).toHaveClass("text-text-tertiary");
        expect(slotChars(unit)).toBe("2");
        rerender(<Numeric value={12} unit="mm" reservedChars={4} />);
        expect(screen.getByText("mm")).toHaveClass("text-text-secondary");
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

    /* React 19 delivers a keydown to the root container before it reaches
     * `document`, and Radix arms its "an arrow key is down" flag from a
     * `document` listener. Roving focus has therefore already moved by the
     * time that flag is set, so the focused option was never checked: arrows
     * moved focus and only Space selected. This asserts the WAI-ARIA radio
     * behaviour with a single, released keypress — a held key would hide the
     * regression, because the second keydown arms the flag for the first
     * item's focus. */
    it("selects the option the arrow key moved to, under React 19", async () => {
        expect(version).toMatch(/^19\./);
        const change = vi.fn();
        render(
            <RadioGroup
                aria-label="Source"
                options={options}
                defaultValue="one"
                onValueChange={change}
            />,
        );
        await userEvent.tab();
        await userEvent.keyboard("{ArrowDown}");
        expect(screen.getByRole("radio", { name: "Three" })).toBeChecked();
        expect(screen.getByRole("radio", { name: "Three" })).toHaveFocus();
        expect(screen.getByRole("radio", { name: "One" })).not.toBeChecked();
        expect(change).toHaveBeenLastCalledWith("three");
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

    /* The intent to select outlives the keypress by one macrotask, because
     * the focus move it authorises is itself deferred. This is the other end
     * of that: an arrow that moved nothing must not follow the user back into
     * the group and check whatever they land on. */
    it("does not carry a spent arrow key into a later focus", async () => {
        const change = vi.fn();
        render(
            <>
                <RadioGroup
                    aria-label="Source"
                    options={[{ value: "one", label: "One" }]}
                    onValueChange={change}
                />
                <button type="button">Elsewhere</button>
            </>,
        );
        await userEvent.tab();
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.tab();
        expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
        await userEvent.tab({ shift: true });
        expect(screen.getByRole("radio", { name: "One" })).toHaveFocus();
        expect(screen.getByRole("radio", { name: "One" })).not.toBeChecked();
        expect(change).not.toHaveBeenCalled();
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

    it("keeps a consumer's existing wording, and does not call it a datetime", () => {
        const { container } = render(
            <BuildStamp name="Guide" describe="v0.1.2" buildTime="built 2026-01-01 00:00 UTC" />,
        );
        expect(screen.getByText("built 2026-01-01 00:00 UTC")).toBeInTheDocument();
        expect(container.querySelector("time")).toBeNull();
    });

    it("applies a formatter to the display while the ISO value stays machine-readable", () => {
        const format = vi.fn((iso: string) => `built ${iso.slice(0, 10)}`);
        render(
            <BuildStamp
                name="Guide"
                describe="v0.1.2"
                buildTime="2026-09-07T12:34:56Z"
                formatBuildTime={format}
            />,
        );
        expect(format).toHaveBeenCalledWith("2026-09-07T12:34:56Z");
        expect(screen.getByText("built 2026-09-07")).toHaveAttribute(
            "datetime",
            "2026-09-07T12:34:56Z",
        );
    });
});
