import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Fragment, isValidElement } from "react";
import { cn } from "./cn.js";
/**
 * Wrap the app once. Radix shares open/close timing across every tooltip
 * under one provider, which is what stops the second tooltip in a toolbar
 * re-running the whole delay.
 */
export const TooltipProvider = TooltipPrimitive.Provider;
/**
 * A label that appears on hover AND on focus.
 *
 * Radix gives the focus half for free, which is the half a hand-rolled
 * tooltip always misses. A tooltip is never the only place a piece of
 * information lives: it sits at z-toast because it must clear a modal, not
 * because it is important.
 */
export function Tooltip({ content, children, side = "top", className }) {
    // JavaScript callers can still supply nodes that cannot receive Radix's
    // trigger props/ref. Give those nodes a concrete, keyboard-focusable host.
    const canSlot = isValidElement(children) && children.type !== Fragment;
    return (_jsxs(TooltipPrimitive.Root, { children: [_jsx(TooltipPrimitive.Trigger, { asChild: true, tabIndex: canSlot ? undefined : 0, children: canSlot ? children : _jsx("span", { children: children }) }), _jsx(TooltipPrimitive.Portal, { children: _jsx(TooltipPrimitive.Content, { side: side, sideOffset: 4, className: cn("z-toast rounded-md border border-border bg-bg-elevated px-2 py-1 text-xs shadow-xs", className), children: content }) })] }));
}
