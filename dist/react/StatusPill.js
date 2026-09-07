import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./cn.js";
import { Tooltip } from "./Tooltip.js";
/** Shared severity vocabulary. A lost stream is degraded; offline is an error. */
export const STATUS_STATES = {
    success: ["healthy", "live"],
    warning: ["degraded", "stale", "lost"],
    danger: ["error", "invalid", "offline"],
    info: ["connecting"],
    neutral: ["unknown", "loading"],
};
/**
 * A tint plus a label, never a bare dot: colour alone is not a status anyone
 * can read, and the tint+label pair is what the AA floor in
 * src/lint/voices.test.ts is measured on.
 */
const STATUS_CLASSES = {
    success: "bg-success-subtle text-success",
    warning: "bg-warning-subtle text-warning",
    danger: "bg-danger-subtle text-danger",
    info: "bg-info-subtle text-info",
    // Not a status hue: "nothing to report" is not an alarm.
    neutral: "bg-bg-muted text-text-secondary",
};
export function StatusPill({ status, detail, className, ...props }) {
    const hasDetail = detail !== undefined && detail !== null;
    const pill = (_jsx("span", { className: cn("ds-status-pill inline-flex h-5 items-center rounded-full px-2 text-xs font-medium", STATUS_CLASSES[status], className), ...props, tabIndex: hasDetail ? 0 : props.tabIndex }));
    return hasDetail ? _jsx(Tooltip, { content: detail, children: pill }) : pill;
}
