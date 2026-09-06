import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children, cloneElement, isValidElement, useId, } from "react";
import { cn } from "./cn.js";
/**
 * Would React render this as nothing?
 *
 * `null`, `undefined`, either boolean and the empty string all produce no
 * output, so none of them is a message. Checking `!== undefined` instead — as
 * this did — turned the ordinary `error={errors.port ?? null}` into an invalid
 * control with an empty red paragraph under it, on a field with nothing wrong.
 */
function rendersNothing(node) {
    return node === null || node === undefined || typeof node === "boolean" || node === "";
}
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
    const hasHint = !rendersNothing(hint);
    const hasError = !rendersNothing(error);
    const hintId = hasHint ? `${controlId}-hint` : undefined;
    const errorId = hasError ? `${controlId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    const control = isValidElement(child)
        ? cloneElement(child, {
            id: controlId,
            "aria-describedby": describedBy,
            "aria-invalid": hasError ? true : undefined,
        })
        : child;
    return (_jsxs("div", { className: cn("flex flex-col gap-1", className), children: [_jsx("label", { htmlFor: controlId, className: "text-xs font-medium tracking-wide text-text-secondary", children: label }), control, hasHint && (_jsx("p", { id: hintId, className: "text-xs text-text-secondary", children: hint })), hasError && (_jsx("p", { id: errorId, role: "alert", className: "text-xs text-danger", children: error }))] }));
}
