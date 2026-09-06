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
 */
export declare function Select({ value, onValueChange, options, placeholder, id, name, disabled, className, ...aria }: SelectProps): import("react").JSX.Element;
