import type { ReactNode } from "react";
export interface SelectOption {
    value: string;
    label: ReactNode;
}
export interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    /** Set by Field; also settable directly. */
    id?: string;
    name?: string;
    disabled?: boolean;
    /**
     * The control's accessible name, when there is no visible caption to point
     * at. Without it a trigger outside a Field announces only the value it
     * currently shows, which tells a listener what is selected and never what
     * is being selected.
     */
    "aria-label"?: string;
    /**
     * The id of a caption that is already on screen. Prefer this over
     * `aria-label` when the words exist: two sources for one name drift, and
     * the visible one is the one that gets corrected.
     */
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    className?: string;
}
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
 *
 * The aria props are forwarded by name rather than by spreading the rest onto
 * the trigger. A spread would also let a caller set `role` or `type` on a
 * Radix trigger and quietly break the control it is trying to label.
 */
export declare function Select({ value, onValueChange, options, placeholder, id, name, disabled, className, ...aria }: SelectProps): import("react").JSX.Element;
