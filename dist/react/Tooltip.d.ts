import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
/**
 * Wrap the app once. Radix shares open/close timing across every tooltip
 * under one provider, which is what stops the second tooltip in a toolbar
 * re-running the whole delay.
 */
export declare const TooltipProvider: import("react").FC<TooltipPrimitive.TooltipProviderProps>;
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
export declare function Tooltip({ content, children, side, className }: TooltipProps): import("react").JSX.Element;
