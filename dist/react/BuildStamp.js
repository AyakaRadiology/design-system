import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "./cn.js";
/* A <time> element promises that its dateTime is a valid datetime, so a
 * buildTime that is prose gets a plain span rather than a lie in the markup.
 * The shape is checked before the value: Date.parse falls back to a lenient
 * parser that reads "built 2026-01-01 00:00 UTC" as a date, which is exactly
 * the preformatted string this must NOT stamp as machine-readable. */
const ISO_8601 = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
function isMachineReadable(buildTime) {
    return ISO_8601.test(buildTime) && !Number.isNaN(Date.parse(buildTime));
}
/** Opaque plate keeps the voice's AA text/surface pair legible over any image. */
export function BuildStamp({ name, describe, buildTime, formatBuildTime, className, ...props }) {
    const shown = formatBuildTime ? formatBuildTime(buildTime) : buildTime;
    return (_jsxs("span", { className: cn("inline-flex flex-wrap items-baseline gap-x-2 rounded-md border border-border bg-bg-elevated px-2 py-1 font-mono text-xs text-text-secondary normal-case tabular-nums", className), ...props, children: [_jsx("span", { children: name }), _jsx("span", { children: describe }), isMachineReadable(buildTime) ? (_jsx("time", { dateTime: buildTime, children: shown })) : (_jsx("span", { children: shown }))] }));
}
