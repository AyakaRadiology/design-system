import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { cn } from "./cn.js";

/**
 * Wrap the app once. Radix shares open/close timing across every tooltip
 * under one provider, which is what stops the second tooltip in a toolbar
 * re-running the whole delay.
 */
export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps {
    content: ReactNode;
    /** The trigger. Anything focusable — a Button, an IconButton. */
    children: ReactNode;
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
    return (
        <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
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
