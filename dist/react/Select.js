import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "./cn.js";
/**
 * A single-choice control.
 *
 * Options are a prop rather than children, which is the whole reason this is
 * worth wrapping: it collapses the four-element Radix composition (Root,
 * Trigger, Value, Content + Item) that every call site would otherwise
 * assemble — and mis-assemble — into one list. Callers who genuinely need the
 * composition can reach for Radix directly; nothing here hides it.
 *
 * The trigger wears the Input classes on purpose: a select and a text field
 * sitting in the same form must be the same height and carry the same border,
 * and two independent class lists is how that stops being true.
 */
export function Select({ value, onValueChange, options, placeholder, id, name, disabled, className, ...aria }) {
    return (_jsxs(SelectPrimitive.Root, { value: value, onValueChange: onValueChange, name: name, disabled: disabled, children: [_jsxs(SelectPrimitive.Trigger, { id: id, "aria-describedby": aria["aria-describedby"], "aria-invalid": aria["aria-invalid"], className: cn("inline-flex h-8 w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-bg px-3 text-sm aria-invalid:border-danger disabled:opacity-50", className), children: [_jsx(SelectPrimitive.Value, { placeholder: placeholder }), _jsx(SelectPrimitive.Icon, { className: "text-text-secondary", children: "\u25BE" })] }), _jsx(SelectPrimitive.Portal, { children: _jsx(SelectPrimitive.Content, { position: "popper", sideOffset: 4, className: "z-overlay overflow-hidden rounded-md border border-border bg-bg shadow-sm", children: _jsx(SelectPrimitive.Viewport, { children: options.map((option) => (_jsx(SelectPrimitive.Item, { value: option.value, className: "flex h-8 cursor-default items-center px-3 text-sm data-[highlighted]:bg-bg-subtle data-[highlighted]:outline-none data-[state=checked]:text-accent", children: _jsx(SelectPrimitive.ItemText, { children: option.label }) }, option.value))) }) }) })] }));
}
