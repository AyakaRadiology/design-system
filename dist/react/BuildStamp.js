import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "./cn.js";
/** Opaque plate keeps the voice's AA text/surface pair legible over any image. */
export function BuildStamp({ name, describe, buildTime, className, ...props }) {
    return (_jsxs("span", { className: cn("inline-flex flex-wrap items-baseline gap-x-2 rounded-md border border-border bg-bg-elevated px-2 py-1 font-mono text-xs text-text-secondary normal-case tabular-nums", className), ...props, children: [_jsx("span", { children: name }), _jsx("span", { children: describe }), _jsx("time", { dateTime: buildTime, children: buildTime })] }));
}
