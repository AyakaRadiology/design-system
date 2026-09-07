import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from "./cn.js";
const DEFAULT_PRECISION = 0;
const MAX_PRECISION = 100;
const DEFAULT_RESERVED_CHARS = 6;
const EMPTY_GLYPH = "—";
const EMPTY_ALIGN_CLASSES = {
    inherit: "text-right",
    start: "text-left",
    center: "text-center",
};
function assertSlotWidth(prop, chars) {
    if (!Number.isInteger(chars) || chars < 1) {
        throw new RangeError(`Numeric ${prop} must be a positive integer`);
    }
}
/** A fixed value slot and a separate, case-preserving unit slot. */
export function Numeric({ value, unit, precision = DEFAULT_PRECISION, reservedChars = DEFAULT_RESERVED_CHARS, reservedUnitChars, showUnitWhenEmpty = false, emptyAlign = "inherit", children, className, ...props }) {
    if (value === undefined) {
        return (_jsxs("span", { className: cn("font-mono tabular-nums", className), ...props, children: [children, unit !== undefined && unit !== null && (_jsxs("span", { className: "text-text-secondary normal-case", children: [" ", unit] }))] }));
    }
    if (!Number.isInteger(precision) || precision < 0 || precision > MAX_PRECISION) {
        throw new RangeError(`Numeric precision must be an integer from 0 to ${MAX_PRECISION}`);
    }
    assertSlotWidth("reservedChars", reservedChars);
    if (reservedUnitChars !== undefined)
        assertSlotWidth("reservedUnitChars", reservedUnitChars);
    if (value !== null && !Number.isFinite(value)) {
        throw new RangeError("Numeric value must be finite or null");
    }
    const empty = value === null;
    return (_jsxs("span", { className: cn("inline-flex items-baseline gap-1 font-mono tabular-nums", className), ...props, children: [_jsx("span", { "data-slot": "value", className: cn("ds-numeric-slot ds-numeric-value-slot shrink-0 whitespace-nowrap", empty ? "ds-numeric-empty-slot" : "inline-block", empty ? EMPTY_ALIGN_CLASSES[emptyAlign] : "text-right"), style: { "--ds-numeric-chars": reservedChars }, children: empty ? (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", className: "ds-numeric-empty text-text-tertiary", children: EMPTY_GLYPH }), _jsx("span", { className: "sr-only", children: "No value" })] })) : (value.toFixed(precision)) }), typeof unit === "string" && (!empty || showUnitWhenEmpty) && (_jsx("span", { "data-slot": "unit", className: cn("ds-numeric-slot inline-block shrink-0 whitespace-nowrap normal-case", empty ? "text-text-tertiary" : "text-text-secondary"), style: {
                    "--ds-numeric-chars": reservedUnitChars ?? unit.length,
                }, children: unit }))] }));
}
