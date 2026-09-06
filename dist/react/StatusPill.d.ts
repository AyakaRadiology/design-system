import type { HTMLAttributes, ReactNode } from "react";
export type Status = "success" | "warning" | "danger" | "info" | "neutral";
export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
    status: Status;
    children: ReactNode;
}
export declare function StatusPill({ status, className, ...props }: StatusPillProps): import("react").JSX.Element;
