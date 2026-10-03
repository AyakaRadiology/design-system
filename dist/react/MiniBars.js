import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./cn.js";
/**
 * Written out in full: Tailwind finds a class by scanning for the whole
 * string, so a template like `bg-${slot}` would never be generated.
 */
const FILL = {
    "chart-1": "bg-chart-1",
    "chart-2": "bg-chart-2",
    "chart-3": "bg-chart-3",
    "chart-4": "bg-chart-4",
    "chart-5": "bg-chart-5",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    neutral: "bg-text-tertiary",
};
/** A bar for a value of zero would be indistinguishable from none; keep a hairline. */
const MIN_VISIBLE_PERCENT = 4;
function height(value, max) {
    const safe = Number.isFinite(value) && value > 0 ? value : 0;
    if (safe === 0 || max <= 0)
        return 0;
    return Math.max(MIN_VISIBLE_PERCENT, Math.min(100, (safe / max) * 100));
}
const SLOT_CLASSES = "flex h-full min-w-px flex-1 items-end";
function Bar({ percent, fill, label }) {
    const bar = _jsx("div", { className: cn("w-full rounded-sm", fill), style: { height: `${percent}%` } });
    return label === undefined ? (_jsx("div", { className: SLOT_CLASSES, children: bar })) : (_jsx("div", { role: "img", "aria-label": label, className: SLOT_CLASSES, children: bar }));
}
/** A fixed-height strip of bars for the last N samples, with no axes. */
export function MiniBars({ values, max, series = "chart-1", labels, className, ...props }) {
    const ceiling = max ?? Math.max(0, ...values.filter(Number.isFinite));
    const named = labels !== undefined;
    // A window of samples has no ids; the position in it is the identity.
    const bars = values.map((value, position) => ({
        id: position,
        percent: height(value, ceiling),
        label: labels?.[position],
    }));
    return (_jsx("div", { "data-ds-chart": "mini-bars", role: named ? "group" : undefined, "aria-hidden": named ? undefined : true, className: cn("flex h-6 items-end gap-px", className), ...props, children: bars.map((bar) => (_jsx(Bar, { percent: bar.percent, fill: FILL[series], label: bar.label }, bar.id))) }));
}
