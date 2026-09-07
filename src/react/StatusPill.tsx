import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";
import { Tooltip } from "./Tooltip.js";

/** Shared severity vocabulary. A lost stream is degraded; offline is an error. */
export const STATUS_STATES = {
    success: ["healthy", "live"],
    warning: ["degraded", "stale", "lost"],
    danger: ["error", "invalid", "offline"],
    info: ["connecting"],
    neutral: ["unknown", "loading"],
} as const;

export type Status = keyof typeof STATUS_STATES;
export type StatusState<Tone extends Status = Status> = (typeof STATUS_STATES)[Tone][number];

/**
 * A tint plus a label, never a bare dot: colour alone is not a status anyone
 * can read, and the tint+label pair is what the AA floor in
 * src/lint/voices.test.ts is measured on.
 */
const STATUS_CLASSES: Record<Status, string> = {
    success: "bg-success-subtle text-success",
    warning: "bg-warning-subtle text-warning",
    danger: "bg-danger-subtle text-danger",
    info: "bg-info-subtle text-info",
    // Not a status hue: "nothing to report" is not an alarm.
    neutral: "bg-bg-muted text-text-secondary",
};

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
    status: Status;
    children: ReactNode;
    /** Supplementary text on hover/focus. Requires the app's TooltipProvider. */
    detail?: ReactNode;
}

export function StatusPill({ status, detail, className, ...props }: StatusPillProps) {
    const hasDetail = detail !== undefined && detail !== null;
    const pill = (
        <span
            className={cn(
                "ds-status-pill inline-flex h-5 items-center rounded-full px-2 text-xs font-medium",
                STATUS_CLASSES[status],
                className,
            )}
            {...props}
            tabIndex={hasDetail ? 0 : props.tabIndex}
        />
    );
    return hasDetail ? <Tooltip content={detail}>{pill}</Tooltip> : pill;
}
