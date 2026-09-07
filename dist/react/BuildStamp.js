import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./Button.js";
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
function isInteractive(props) {
    return typeof props.onClick === "function";
}
function BuildStampParts({ name, describe, buildTime, shownBuildTime }) {
    return (_jsxs(_Fragment, { children: [_jsx("span", { children: name }), _jsx("span", { children: describe }), isMachineReadable(buildTime) ? (_jsx("time", { dateTime: buildTime, children: shownBuildTime })) : (_jsx("span", { children: shownBuildTime }))] }));
}
const PLATE_CLASSES = "inline-flex flex-wrap items-baseline gap-x-2 rounded-md border border-border bg-bg-elevated px-2 py-1 font-mono text-xs text-text-secondary normal-case tabular-nums";
/** Opaque plate keeps the voice's AA text/surface pair legible over any image. */
export function BuildStamp(props) {
    if (isInteractive(props)) {
        const { name, describe, buildTime, formatBuildTime, className, "aria-label": ariaLabel, ...buttonProps } = props;
        const shownBuildTime = formatBuildTime ? formatBuildTime(buildTime) : buildTime;
        return (_jsx(Button, { size: "sm", "aria-label": ariaLabel ?? `${name} ${describe} ${shownBuildTime}`, className: cn(PLATE_CLASSES, "h-auto font-normal hover:bg-bg-subtle", className), ...buttonProps, children: _jsx(BuildStampParts, { name: name, describe: describe, buildTime: buildTime, shownBuildTime: shownBuildTime }) }));
    }
    const { name, describe, buildTime, formatBuildTime, className, ...spanProps } = props;
    const shownBuildTime = formatBuildTime ? formatBuildTime(buildTime) : buildTime;
    return (_jsx("span", { className: cn(PLATE_CLASSES, className), ...spanProps, children: _jsx(BuildStampParts, { name: name, describe: describe, buildTime: buildTime, shownBuildTime: shownBuildTime }) }));
}
