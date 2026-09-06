import { type ReactNode } from "react";
export interface FieldProps {
    label: ReactNode;
    /** Guidance shown before the control is used. */
    hint?: ReactNode;
    /** What went wrong. Its presence is what marks the control invalid. */
    error?: ReactNode;
    /** Use when the control's id is already fixed by something else. */
    htmlFor?: string;
    /** Exactly one control. */
    children: ReactNode;
    className?: string;
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
export declare function Field({ label, hint, error, htmlFor, children, className }: FieldProps): import("react").JSX.Element;
