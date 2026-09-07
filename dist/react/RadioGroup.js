import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useId } from "react";
import { cn } from "./cn.js";
const RADIOGROUP_SELECTOR = '[role="radiogroup"]';
const ENABLED_RADIO_SELECTOR = '[role="radio"]:not(:disabled)';
const SPACE_KEY = " ";
const ENTER_KEY = "Enter";
function navigationDirection(key, dir) {
    if (key === "ArrowDown")
        return 1;
    if (key === "ArrowUp")
        return -1;
    if (key === "ArrowRight")
        return dir === "rtl" ? -1 : 1;
    if (key === "ArrowLeft")
        return dir === "rtl" ? 1 : -1;
    return 0;
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
export function RadioGroup({ options, value, defaultValue, onValueChange, id, name, disabled, required, orientation = "vertical", dir, loop, className, ...aria }) {
    const groupId = useId();
    const handleItemKeyDown = (event) => {
        if (event.key === ENTER_KEY) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if (event.key === SPACE_KEY) {
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.click();
            return;
        }
        const direction = navigationDirection(event.key, dir);
        if (direction === 0)
            return;
        event.preventDefault();
        event.stopPropagation();
        const group = event.currentTarget.closest(RADIOGROUP_SELECTOR);
        if (!group)
            throw new Error("RadioGroup item is missing its radiogroup root");
        const items = Array.from(group.querySelectorAll(ENABLED_RADIO_SELECTOR));
        const currentIndex = items.indexOf(event.currentTarget);
        if (currentIndex === -1)
            throw new Error("Focused RadioGroup item is not in the roving order");
        let nextIndex = currentIndex + direction;
        if (nextIndex < 0 || nextIndex >= items.length) {
            if (loop === false)
                return;
            nextIndex = (nextIndex + items.length) % items.length;
        }
        const nextItem = items[nextIndex];
        if (!nextItem || nextItem === event.currentTarget)
            return;
        nextItem.click();
        nextItem.focus();
    };
    return (_jsx(RadioGroupPrimitive.Root, { id: id, name: name, value: value, defaultValue: defaultValue, onValueChange: onValueChange, disabled: disabled, required: required, orientation: orientation, dir: dir, loop: loop, "aria-label": aria["aria-label"], "aria-labelledby": aria["aria-labelledby"], "aria-describedby": aria["aria-describedby"], "aria-invalid": aria["aria-invalid"], className: cn("flex gap-2", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap", className), children: options.map((option, index) => (_jsxs("div", { className: "flex min-h-8 items-center gap-2", children: [_jsx(RadioGroupPrimitive.Item, { id: `${groupId}-${index}`, value: option.value, disabled: option.disabled, onKeyDown: handleItemKeyDown, className: "peer flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg data-[state=checked]:border-accent disabled:opacity-50", children: _jsx(RadioGroupPrimitive.Indicator, { className: "size-2 rounded-full bg-accent" }) }), _jsx("label", { htmlFor: `${groupId}-${index}`, className: "text-sm text-text peer-disabled:opacity-50", children: option.label })] }, option.value))) }));
}
