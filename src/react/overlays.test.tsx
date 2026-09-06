// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./Dialog.js";
import { IconButton } from "./IconButton.js";
import { Tooltip, TooltipProvider } from "./Tooltip.js";

function Example({ description }: { description?: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Open</Button>
            </DialogTrigger>
            <DialogContent
                title="Reset tracker"
                description={description}
                actions={
                    <DialogClose asChild>
                        <Button variant="danger">Reset</Button>
                    </DialogClose>
                }
            >
                This clears the current pairing.
            </DialogContent>
        </Dialog>
    );
}

describe("Dialog", () => {
    it("stays shut until the trigger is used", async () => {
        render(<Example />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    /* A dialog with no accessible name is announced as a nameless region,
     * which is why `title` is required in the type rather than optional. */
    it("takes its accessible name from the title", async () => {
        render(<Example />);
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        expect(await screen.findByRole("dialog", { name: "Reset tracker" })).toBeInTheDocument();
    });

    it("describes itself when given a description, and not otherwise", async () => {
        const { unmount } = render(<Example description="The pairing cannot be recovered." />);
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        expect(await screen.findByRole("dialog")).toHaveAccessibleDescription(
            "The pairing cannot be recovered.",
        );
        unmount();

        render(<Example />);
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        expect(await screen.findByRole("dialog")).not.toHaveAccessibleDescription();
    });

    it("renders its body and its actions", async () => {
        render(<Example />);
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        await screen.findByRole("dialog");
        expect(screen.getByText("This clears the current pairing.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    });

    it("closes on Escape", async () => {
        render(<Example />);
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        await screen.findByRole("dialog");
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("closes from an action wrapped in DialogClose", async () => {
        render(<Example />);
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        await screen.findByRole("dialog");
        await userEvent.click(screen.getByRole("button", { name: "Reset" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("sits on the modal layer, above its own scrim", async () => {
        render(<Example />);
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        expect(await screen.findByRole("dialog")).toHaveClass("z-modal");
    });

    /* A floating surface names the elevated role, not the card role. On a
     * voice that draws no shadows that step is the only thing saying it
     * floats. */
    it("draws itself on the elevated surface", async () => {
        render(<Example />);
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        expect(await screen.findByRole("dialog")).toHaveClass("bg-bg-elevated");
    });
});

describe("Tooltip", () => {
    const withProvider = (side?: "top" | "right") =>
        render(
            <TooltipProvider delayDuration={0}>
                <Tooltip content="Reset the pairing" side={side}>
                    <IconButton aria-label="Reset">×</IconButton>
                </Tooltip>
            </TooltipProvider>,
        );

    it("stays hidden until the trigger is reached", () => {
        withProvider();
        expect(screen.queryByText("Reset the pairing")).not.toBeInTheDocument();
    });

    it("shows on hover", async () => {
        withProvider();
        await userEvent.hover(screen.getByRole("button", { name: "Reset" }));
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Reset the pairing");
    });

    /* The half a hand-rolled tooltip always misses. */
    it("shows on keyboard focus too", async () => {
        withProvider();
        screen.getByRole("button", { name: "Reset" }).focus();
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Reset the pairing");
    });

    it("sits on the toast layer, so it clears a modal", async () => {
        withProvider();
        await userEvent.hover(screen.getByRole("button", { name: "Reset" }));
        await screen.findByRole("tooltip");
        expect(document.querySelector(".z-toast")).not.toBeNull();
    });

    it("draws itself on the elevated surface", async () => {
        withProvider();
        await userEvent.hover(screen.getByRole("button", { name: "Reset" }));
        expect(await screen.findByRole("tooltip")).toHaveClass("bg-bg-elevated");
    });

    it("does not swallow the trigger's own accessible name", async () => {
        withProvider();
        const trigger = screen.getByRole("button", { name: "Reset" });
        expect(trigger).toHaveAttribute("aria-label", "Reset");
    });
});

describe("no console noise from the overlays", () => {
    /* Radix warns at runtime about a missing dialog description or title.
     * A warning nobody reads is not a gate, so this makes it one. */
    it("renders a dialog and a tooltip without warning", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        render(<Example description="ok" />);
        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        await screen.findByRole("dialog");
        expect(warn).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
    });
});
