import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children, cloneElement, isValidElement, useId, } from "react";
import { cn } from "./cn.js";
/**
 * A label, a control, and the wiring between them.
 *
 * The wiring is the whole point. A label needs a `for` that matches the
 * control's `id`; a hint and an error are only announced if the control names
 * them in `aria-describedby`; an invalid control has to say so in
 * `aria-invalid` or the error is visible to sighted users alone. Every one of
 * those is a step that gets skipped when a form is assembled by hand, so this
 * component does all four or none.
 *
 * `Children.only`, deliberately: two controls under one label is not a layout
 * this can wire correctly, and failing loudly beats labelling the first one
 * and silently orphaning the second.
 */
export function Field({ label, hint, error, htmlFor, children, className }) {
    const generated = useId();
    const child = Children.only(children);
    const existingId = isValidElement(child) ? child.props.id : undefined;
    const controlId = htmlFor ?? existingId ?? generated;
    const hintId = hint === undefined ? undefined : `${controlId}-hint`;
    const errorId = error === undefined ? undefined : `${controlId}-error`;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    const control = isValidElement(child)
        ? cloneElement(child, {
            id: controlId,
            "aria-describedby": describedBy,
            "aria-invalid": error === undefined ? undefined : true,
        })
        : child;
    return (_jsxs("div", { className: cn("flex flex-col gap-1", className), children: [_jsx("label", { htmlFor: controlId, className: "text-xs font-medium uppercase tracking-wide text-text-secondary", children: label }), control, hint !== undefined && (_jsx("p", { id: hintId, className: "text-xs text-text-secondary", children: hint })), error !== undefined && (_jsx("p", { id: errorId, className: "text-xs text-danger", children: error }))] }));
}
