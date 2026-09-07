import type { HTMLAttributes, ReactNode } from "react";
/** Shared severity vocabulary. A lost stream is degraded; offline is an error. */
export declare const STATUS_STATES: {
    readonly success: readonly ["healthy", "live"];
    readonly warning: readonly ["degraded", "stale", "lost"];
    readonly danger: readonly ["error", "invalid", "offline"];
    readonly info: readonly ["connecting"];
    readonly neutral: readonly ["unknown", "loading"];
};
export type Status = keyof typeof STATUS_STATES;
export type StatusState<Tone extends Status = Status> = (typeof STATUS_STATES)[Tone][number];
export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
    status: Status;
    children: ReactNode;
    /** Supplementary text on hover/focus. Requires the app's TooltipProvider. */
    detail?: ReactNode;
}
export declare function StatusPill({ status, detail, className, ...props }: StatusPillProps): import("react").JSX.Element;
