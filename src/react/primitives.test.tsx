// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button.js";
import { cn } from "./cn.js";
import { IconButton } from "./IconButton.js";
import { Numeric } from "./Numeric.js";
import { Panel } from "./Panel.js";
import { type Status, StatusPill } from "./StatusPill.js";
import { Toolbar } from "./Toolbar.js";

describe("cn", () => {
    it("lets the later class win a Tailwind conflict", () => {
        expect(cn("bg-bg", "bg-accent")).toBe("bg-accent");
        expect(cn("h-8", "h-7")).toBe("h-7");
    });

    /* tailwind-merge reads z-* as numbers, so without the extension in cn.ts
     * both survive and stylesheet order decides — the ambiguity L7 exists to
     * remove. */
    it("resolves a stacking-layer conflict", () => {
        expect(cn("z-overlay", "z-modal")).toBe("z-modal");
    });

    it("drops falsy inputs rather than printing them", () => {
        expect(cn("bg-bg", false, null, undefined, "text-text")).toBe("bg-bg text-text");
    });
});

describe("Button", () => {
    it("renders its children", () => {
        render(<Button>Reset</Button>);
        expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    });

    /* A button inside a form submits it unless told otherwise. */
    it("defaults to type=button, and yields when told otherwise", () => {
        render(
            <>
                <Button>a</Button>
                <Button type="submit">b</Button>
            </>,
        );
        expect(screen.getByRole("button", { name: "a" })).toHaveAttribute("type", "button");
        expect(screen.getByRole("button", { name: "b" })).toHaveAttribute("type", "submit");
    });

    it("defaults to the secondary variant at the md size", () => {
        render(<Button>a</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass("border-border-strong", "bg-bg", "h-8", "px-3", "text-sm");
    });

    it.each([
        ["primary", "bg-accent"],
        ["secondary", "border-border-strong"],
        ["ghost", "hover:bg-bg-subtle"],
        ["danger", "bg-danger"],
    ] as const)("carries the %s variant class", (variant, expected) => {
        render(<Button variant={variant}>a</Button>);
        expect(screen.getByRole("button")).toHaveClass(expected);
    });

    it("shrinks to the sm size", () => {
        render(<Button size="sm">a</Button>);
        expect(screen.getByRole("button")).toHaveClass("h-7", "px-2", "text-xs");
    });

    it("disables and dims", () => {
        render(<Button disabled>a</Button>);
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
        expect(button).toHaveClass("disabled:opacity-50", "disabled:pointer-events-none");
    });

    it("lets a caller's class beat the variant's", () => {
        render(<Button className="bg-info">a</Button>);
        expect(screen.getByRole("button")).toHaveClass("bg-info");
        expect(screen.getByRole("button")).not.toHaveClass("bg-bg");
    });

    /* No component adds a focus ring: tokens/scales.css sets one global
     * :focus-visible outline, and a second answer to that question is how
     * focus styling stops being consistent. */
    it("adds no focus classes of its own", () => {
        render(<Button>a</Button>);
        expect(screen.getByRole("button").className).not.toMatch(/focus/);
    });
});

describe("IconButton", () => {
    it("is named by its aria-label and is square", () => {
        render(<IconButton aria-label="Close">×</IconButton>);
        const button = screen.getByRole("button", { name: "Close" });
        expect(button).toHaveClass("size-8");
        expect(button).toHaveAttribute("type", "button");
    });

    it("refuses to compile without an accessible name", () => {
        // @ts-expect-error aria-label is required: an icon-only control with no
        // accessible name is invisible to a screen reader.
        const missing = <IconButton>×</IconButton>;
        expect(missing).toBeTruthy();
    });
});

describe("Numeric", () => {
    it("sets mono tabular figures", () => {
        render(<Numeric>1234</Numeric>);
        expect(screen.getByText("1234")).toHaveClass("font-mono", "tabular-nums");
    });

    it("renders a unit in secondary colour", () => {
        render(<Numeric unit="ms">42</Numeric>);
        expect(screen.getByText("ms")).toHaveClass("text-text-secondary");
    });

    it("renders no unit element when there is no unit", () => {
        const { container } = render(<Numeric>42</Numeric>);
        expect(container.querySelectorAll("span")).toHaveLength(1);
    });
});

describe("StatusPill", () => {
    it.each([
        ["success", "bg-success-subtle text-success"],
        ["warning", "bg-warning-subtle text-warning"],
        ["danger", "bg-danger-subtle text-danger"],
        ["info", "bg-info-subtle text-info"],
        ["neutral", "bg-bg-muted text-text-secondary"],
    ] as [Status, string][])("maps %s to its tint and label colour", (status, expected) => {
        render(<StatusPill status={status}>state</StatusPill>);
        expect(screen.getByText("state")).toHaveClass(...expected.split(" "));
    });

    /* Colour alone is not a status anyone can read. */
    it("always carries a label, not just a tint", () => {
        render(<StatusPill status="danger">lost</StatusPill>);
        expect(screen.getByText("lost")).toHaveTextContent("lost");
    });
});

describe("Toolbar", () => {
    it("groups its controls for a screen reader", () => {
        render(
            <Toolbar>
                <Button>a</Button>
            </Toolbar>,
        );
        const toolbar = screen.getByRole("toolbar");
        expect(toolbar).toContainElement(screen.getByRole("button"));
        expect(toolbar).toHaveClass("border-b", "border-border", "px-3", "py-2");
    });
});

describe("Panel", () => {
    it("renders a header when there is a title", () => {
        render(<Panel title="Tracker">body</Panel>);
        expect(screen.getByText("Tracker")).toHaveClass("text-sm", "font-semibold");
        expect(screen.getByText("body")).toBeInTheDocument();
    });

    it("renders a header when there are only actions", () => {
        const { container } = render(<Panel actions={<Button>Reset</Button>}>body</Panel>);
        expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
        expect(container.querySelector(".border-b")).not.toBeNull();
    });

    /* An empty header still draws its bottom border, which reads as a divider
     * above nothing. */
    it("renders no header when there is neither a title nor actions", () => {
        const { container } = render(<Panel>body</Panel>);
        expect(container.querySelector(".border-b")).toBeNull();
        expect(screen.getByText("body")).toBeInTheDocument();
    });
});
