import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from "./cn.js";
const DEFAULT_PRECISION = 0;
const MAX_PRECISION = 100;
const DEFAULT_RESERVED_CHARS = 6;
const EMPTY_GLYPH = "—";
/** A fixed value slot and a separate, case-preserving unit slot. */
export function Numeric({ value, unit, precision = DEFAULT_PRECISION, reservedChars = DEFAULT_RESERVED_CHARS, children, className, ...props }) {
    if (value === undefined) {
        return (_jsxs("span", { className: cn("font-mono tabular-nums", className), ...props, children: [children, unit !== undefined && unit !== null && (_jsxs("span", { className: "text-text-secondary normal-case", children: [" ", unit] }))] }));
    }
    if (!Number.isInteger(precision) || precision < 0 || precision > MAX_PRECISION) {
        throw new RangeError(`Numeric precision must be an integer from 0 to ${MAX_PRECISION}`);
    }
    if (!Number.isInteger(reservedChars) || reservedChars < 1) {
        throw new RangeError("Numeric reservedChars must be a positive integer");
    }
    if (value !== null && !Number.isFinite(value)) {
        throw new RangeError("Numeric value must be finite or null");
    }
    const empty = value === null;
    return (_jsxs("span", { className: cn("inline-flex items-baseline gap-1 font-mono tabular-nums", className), ...props, children: [_jsx("span", { "data-slot": "value", className: "inline-block shrink-0 whitespace-nowrap text-right", style: { width: `${reservedChars}ch` }, children: empty ? (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", className: "text-xs text-text-tertiary", children: EMPTY_GLYPH }), _jsx("span", { className: "sr-only", children: "No value" })] })) : (value.toFixed(precision)) }), typeof unit === "string" && (_jsx("span", { "data-slot": "unit", className: cn("inline-block shrink-0 whitespace-nowrap normal-case", empty ? "text-text-tertiary" : "text-text-secondary"), style: { width: `${unit.length}ch` }, children: unit }))] }));
}
