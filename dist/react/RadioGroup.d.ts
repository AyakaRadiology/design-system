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
 * Radix owns roving focus, Space selection and form participation.
 *
 * Selection-follows-focus is ours, because Radix's own version does not fire
 * under React 19. Radix arms an "an arrow key is down" ref from a listener on
 * `document` and reads it when the item receives focus; React 19 delivers the
 * event to the handlers on its root container first, and the roving-focus
 * handler there defers the focus move to a macrotask. What survives is arrows
 * that move focus and a Space that selects — not the radio pattern a keyboard
 * user expects.
 *
 * So the intent is recorded here instead, from the item's own React keydown
 * handler (item handlers run before the group's, so it is recorded before
 * anything moves) and cleared one macrotask after the key is released, which
 * is necessarily after the deferred focus move it authorised. The commit is a
 * `click()` on the newly focused item — the same move Radix makes — so the
 * change event, the controlled/uncontrolled split and the hidden form input
 * all behave exactly as they do for a mouse click. Radix's own handler runs
 * after this one and finds the item already checked, where its `if (!checked)`
 * guard makes it a no-op rather than a second selection.
 */
export declare function RadioGroup({ options, value, defaultValue, onValueChange, id, name, disabled, required, orientation, dir, loop, className, ...aria }: RadioGroupProps): import("react").JSX.Element;
