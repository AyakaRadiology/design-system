import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { type FocusEvent, type KeyboardEvent, type ReactNode, useId, useRef } from "react";
import { cn } from "./cn.js";

/* The keys that move the roving focus and, per WAI-ARIA, must take the
 * selection with them. Home/End are deliberately absent: Radix does not select
 * on them either, and this component follows Radix's model rather than
 * inventing a second one. */
const SELECTING_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

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
export function RadioGroup({
    options,
    value,
    defaultValue,
    onValueChange,
    id,
    name,
    disabled,
    required,
    orientation = "vertical",
    dir,
    loop,
    className,
    ...aria
}: RadioGroupProps) {
    const groupId = useId();
    const selectingKeyHeld = useRef(false);
    const rememberSelectingKey = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (SELECTING_KEYS.has(event.key)) selectingKeyHeld.current = true;
    };
    /* One macrotask later, not immediately: the focus move this keypress
     * authorised is itself a macrotask, queued while the key was still down,
     * so it runs first. Clearing here rather than only on focus is what keeps
     * a keypress that moved nothing (the last item of a group that does not
     * loop) from selecting whatever is focused next. */
    const releaseSelectingKey = () => {
        setTimeout(() => {
            selectingKeyHeld.current = false;
        });
    };
    const selectOnKeyboardFocus = (event: FocusEvent<HTMLButtonElement>) => {
        if (selectingKeyHeld.current) event.currentTarget.click();
    };
    return (
        <RadioGroupPrimitive.Root
            id={id}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            disabled={disabled}
            required={required}
            orientation={orientation}
            dir={dir}
            loop={loop}
            aria-label={aria["aria-label"]}
            aria-labelledby={aria["aria-labelledby"]}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            className={cn(
                "flex gap-2",
                orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
                className,
            )}
        >
            {options.map((option, index) => (
                <div key={option.value} className="flex min-h-8 items-center gap-2">
                    <RadioGroupPrimitive.Item
                        id={`${groupId}-${index}`}
                        value={option.value}
                        disabled={option.disabled}
                        onKeyDown={rememberSelectingKey}
                        onKeyUp={releaseSelectingKey}
                        onFocus={selectOnKeyboardFocus}
                        className="peer flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg data-[state=checked]:border-accent disabled:opacity-50"
                    >
                        <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-accent" />
                    </RadioGroupPrimitive.Item>
                    <label
                        htmlFor={`${groupId}-${index}`}
                        className="text-sm text-text peer-disabled:opacity-50"
                    >
                        {option.label}
                    </label>
                </div>
            ))}
        </RadioGroupPrimitive.Root>
    );
}
