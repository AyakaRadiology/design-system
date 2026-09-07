import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

/** The controlled root. Re-exported unchanged: it renders nothing to style. */
export const Dialog = DialogPrimitive.Root;
/** Wraps its child as the opener. Pass `asChild` semantics a Button. */
export const DialogTrigger = DialogPrimitive.Trigger;
/** Closes the dialog from inside. Useful for a Cancel in `actions`. */
export const DialogClose = DialogPrimitive.Close;

export type DialogBodyProps = HTMLAttributes<HTMLDivElement>;

/** Scrollable content; put the title/description and actions on DialogContent. */
export function DialogBody({ className, ...props }: DialogBodyProps) {
    return (
        <div
            className={cn("ds-dialog-body min-h-0 overflow-y-auto overscroll-contain", className)}
            {...props}
        />
    );
}

export interface DialogContentProps {
    /**
     * Required. A dialog with no accessible name is announced as a nameless
     * region, so Radix warns about it at runtime — a warning nobody reads. In
     * the type it is a compile error instead.
     */
    title: ReactNode;
    description?: ReactNode;
    /** Footer controls, right-aligned. */
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function DialogContent({
    title,
    description,
    actions,
    children,
    className,
}: DialogContentProps) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-bg-subtle/80" />
            <DialogPrimitive.Content
                {...(description === undefined ? { "aria-describedby": undefined } : {})}
                className={cn(
                    "ds-dialog-content fixed left-1/2 top-1/2 z-modal flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border bg-dialog-surface p-4 shadow-sm",
                    className,
                )}
            >
                <DialogPrimitive.Title className="shrink-0 text-sm font-semibold">
                    {title}
                </DialogPrimitive.Title>
                {description !== undefined && (
                    <DialogPrimitive.Description className="mt-1 shrink-0 text-sm text-text-secondary">
                        {description}
                    </DialogPrimitive.Description>
                )}
                <div className="mt-4 flex min-h-0 flex-col">{children}</div>
                {actions !== undefined && (
                    <div className="mt-4 flex shrink-0 justify-end gap-2">{actions}</div>
                )}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}
