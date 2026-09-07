import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "./cn.js";
/** The controlled root. Re-exported unchanged: it renders nothing to style. */
export const Dialog = DialogPrimitive.Root;
/** Wraps its child as the opener. Pass `asChild` semantics a Button. */
export const DialogTrigger = DialogPrimitive.Trigger;
/** Closes the dialog from inside. Useful for a Cancel in `actions`. */
export const DialogClose = DialogPrimitive.Close;
/** Scrollable content; put the title/description and actions on DialogContent. */
export function DialogBody({ className, ...props }) {
    return (_jsx("div", { className: cn("ds-dialog-body min-h-0 overflow-y-auto overscroll-contain", className), ...props }));
}
export function DialogContent({ title, description, actions, children, className, }) {
    return (_jsxs(DialogPrimitive.Portal, { children: [_jsx(DialogPrimitive.Overlay, { className: "fixed inset-0 z-overlay bg-bg-subtle/80" }), _jsxs(DialogPrimitive.Content, { ...(description === undefined ? { "aria-describedby": undefined } : {}), className: cn("ds-dialog-content fixed left-1/2 top-1/2 z-modal flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border bg-bg-elevated p-4 shadow-sm", className), children: [_jsx(DialogPrimitive.Title, { className: "shrink-0 text-sm font-semibold", children: title }), description !== undefined && (_jsx(DialogPrimitive.Description, { className: "mt-1 shrink-0 text-sm text-text-secondary", children: description })), _jsx("div", { className: "mt-4 flex min-h-0 flex-col", children: children }), actions !== undefined && (_jsx("div", { className: "mt-4 flex shrink-0 justify-end gap-2", children: actions }))] })] }));
}
