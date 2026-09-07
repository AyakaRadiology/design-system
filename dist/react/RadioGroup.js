import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useId } from "react";
import { cn } from "./cn.js";
/** Radix owns roving focus, arrow/Space selection and form participation. */
export function RadioGroup({ options, value, defaultValue, onValueChange, id, name, disabled, required, orientation = "vertical", dir, loop, className, ...aria }) {
    const groupId = useId();
    return (_jsx(RadioGroupPrimitive.Root, { id: id, name: name, value: value, defaultValue: defaultValue, onValueChange: onValueChange, disabled: disabled, required: required, orientation: orientation, dir: dir, loop: loop, "aria-label": aria["aria-label"], "aria-labelledby": aria["aria-labelledby"], "aria-describedby": aria["aria-describedby"], "aria-invalid": aria["aria-invalid"], className: cn("flex gap-2", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap", className), children: options.map((option, index) => (_jsxs("div", { className: "flex min-h-8 items-center gap-2", children: [_jsx(RadioGroupPrimitive.Item, { id: `${groupId}-${index}`, value: option.value, disabled: option.disabled, className: "peer flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg data-[state=checked]:border-accent disabled:opacity-50", children: _jsx(RadioGroupPrimitive.Indicator, { className: "size-2 rounded-full bg-accent" }) }), _jsx("label", { htmlFor: `${groupId}-${index}`, className: "text-sm text-text peer-disabled:opacity-50", children: option.label })] }, option.value))) }));
}
