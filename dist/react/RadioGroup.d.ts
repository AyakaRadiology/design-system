import { type ReactNode } from "react";
export interface RadioGroupOption {
    value: string;
    label: ReactNode;
    disabled?: boolean;
}
export interface RadioGroupProps {
    options: RadioGroupOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    id?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    orientation?: "horizontal" | "vertical";
    dir?: "ltr" | "rtl";
    loop?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    className?: string;
}
/**
 * Radix owns the radio semantics, roving tab stop and form participation.
 *
 * Keyboard selection is handled synchronously here. Radix 1.4.7 coordinates
 * arrow selection through a `document` listener, but React 19 handles the
 * root-container event first; depending on timing, focus can move before Radix
 * records that an arrow is held. Committing with the target item's click keeps
 * controlled and uncontrolled state, callbacks and the hidden form input on
 * Radix's normal path. Stopping the keydown prevents its document listener
 * from observing the same arrow and moving or selecting a second time.
 */
export declare function RadioGroup({ options, value, defaultValue, onValueChange, id, name, disabled, required, orientation, dir, loop, className, ...aria }: RadioGroupProps): import("react").JSX.Element;
