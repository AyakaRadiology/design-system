import {
    Children,
    cloneElement,
    isValidElement,
    type ReactElement,
    type ReactNode,
    useId,
} from "react";
import { cn } from "./cn.js";

export interface FieldProps {
    label: ReactNode;
    /** Guidance shown before the control is used. */
    hint?: ReactNode;
    /**
     * What went wrong. Its presence is what marks the control invalid — so
     * anything React would render as nothing counts as no error, not as an
     * empty one. `error={touched && message}`, `error={errors.port ?? null}`
     * and `error=""` are all "this field is fine".
     */
    error?: ReactNode;
    /** Use when the control's id is already fixed by something else. */
    htmlFor?: string;
    /** Exactly one control. */
    children: ReactNode;
    className?: string;
}

interface WiredProps {
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
}

/**
 * Would React render this as nothing?
 *
 * `null`, `undefined`, either boolean and the empty string all produce no
 * output, so none of them is a message. Checking `!== undefined` instead — as
 * this did — turned the ordinary `error={errors.port ?? null}` into an invalid
 * control with an empty red paragraph under it, on a field with nothing wrong.
 */
function rendersNothing(node: ReactNode): boolean {
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
export function Field({ label, hint, error, htmlFor, children, className }: FieldProps) {
    const generated = useId();
    const child = Children.only(children);
    const existingId = isValidElement<WiredProps>(child) ? child.props.id : undefined;
    const controlId = htmlFor ?? existingId ?? generated;

    const hasHint = !rendersNothing(hint);
    const hasError = !rendersNothing(error);
    const hintId = hasHint ? `${controlId}-hint` : undefined;
    const errorId = hasError ? `${controlId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    const control = isValidElement<WiredProps>(child)
        ? cloneElement(child as ReactElement<WiredProps>, {
              id: controlId,
              "aria-describedby": describedBy,
              "aria-invalid": hasError ? true : undefined,
          })
        : child;

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {/* No `uppercase`. CSS text-transform is not case-folding: it
             * ran "Plan θ" through the same rule as the Latin letters and
             * printed "Plan Θ", a different character from the one the other
             * apps show for the same quantity. A label that must shout in a
             * pure-ASCII product adds the class itself (see README). */}
            <label
                htmlFor={controlId}
                className="text-xs font-medium tracking-wide text-text-secondary"
            >
                {label}
            </label>
            {control}
            {hasHint && (
                <p id={hintId} className="text-xs text-text-secondary">
                    {hint}
                </p>
            )}
            {/* role="alert" so an error that appears AFTER the control was
             * used is announced. aria-describedby alone only reaches a reader
             * that moves back to the control, which is not what happens when
             * validation fires on blur. */}
            {hasError && (
                <p id={errorId} role="alert" className="text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
