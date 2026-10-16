import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "./cn.js";

/**
 * Wrap the app once. Radix shares open/close timing across every tooltip
 * under one provider, which is what stops the second tooltip in a toolbar
 * re-running the whole delay.
 */
export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps {
    content: ReactNode;
    /** A single focusable trigger element, such as a Button or IconButton. */
    children: ReactElement;
    side?: "top" | "right" | "bottom" | "left";
    className?: string;
}

/**
 * A label that appears on hover AND on focus.
 *
 * Radix gives the focus half for free, which is the half a hand-rolled
 * tooltip always misses. A tooltip is never the only place a piece of
 * information lives: it sits at z-toast because it must clear a modal, not
 * because it is important.
 */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
    // JavaScript callers can still supply nodes that cannot receive Radix's
    // trigger props/ref. Give those nodes a concrete, keyboard-focusable host.
    const canSlot = isValidElement(children) && children.type !== Fragment;

    return (
        <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild tabIndex={canSlot ? undefined : 0}>
                {canSlot ? children : <span>{children}</span>}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    sideOffset={4}
                    className={cn(
                        "z-toast rounded-md border border-border bg-bg-elevated px-2 py-1 text-xs shadow-xs",
                        className,
                    )}
                >
                    {content}
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
}
