import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

export type Status = "success" | "warning" | "danger" | "info" | "neutral";

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
}

export function StatusPill({ status, className, ...props }: StatusPillProps) {
    return (
        <span
            className={cn(
                "inline-flex h-5 items-center rounded-full px-2 text-xs font-medium",
                STATUS_CLASSES[status],
                className,
            )}
            {...props}
        />
    );
}
