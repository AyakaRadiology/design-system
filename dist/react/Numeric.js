import { jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "./cn.js";
/**
 * Every reading a machine produced.
 *
 * `tabular-nums` is the whole point: without it, a counter ticking from 19 to
 * 20 shifts every digit beside it, and a column of figures does not line up.
 * Making this a component rather than a remembered pair of classes is what
 * stops half the figures in an app getting it and half not.
 */
export function Numeric({ unit, children, className, ...props }) {
    return (_jsxs("span", { className: cn("font-mono tabular-nums", className), ...props, children: [children, unit !== undefined && unit !== null && (_jsxs("span", { className: "text-text-secondary", children: [" ", unit] }))] }));
}
