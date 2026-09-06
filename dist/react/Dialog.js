import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "./cn.js";
/** The controlled root. Re-exported unchanged: it renders nothing to style. */
export const Dialog = DialogPrimitive.Root;
/** Wraps its child as the opener. Pass `asChild` semantics a Button. */
export const DialogTrigger = DialogPrimitive.Trigger;
/** Closes the dialog from inside. Useful for a Cancel in `actions`. */
export const DialogClose = DialogPrimitive.Close;
export function DialogContent({ title, description, actions, children, className, }) {
    return (_jsxs(DialogPrimitive.Portal, { children: [_jsx(DialogPrimitive.Overlay, { className: "fixed inset-0 z-overlay bg-bg-subtle/80" }), _jsxs(DialogPrimitive.Content, { className: cn("fixed left-1/2 top-1/2 z-modal w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg-elevated p-4 shadow-sm", className), children: [_jsx(DialogPrimitive.Title, { className: "text-sm font-semibold", children: title }), description !== undefined && (_jsx(DialogPrimitive.Description, { className: "mt-1 text-sm text-text-secondary", children: description })), _jsx("div", { className: "mt-4", children: children }), actions !== undefined && (_jsx("div", { className: "mt-4 flex justify-end gap-2", children: actions }))] })] }));
}
