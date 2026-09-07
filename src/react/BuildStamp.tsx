import type { HTMLAttributes } from "react";
import { cn } from "./cn.js";

export interface BuildStampProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    name: string;
    /** The consumer's git describe output, including dirty suffix if present. */
    describe: string;
    /** ISO 8601 build time. Displayed verbatim, without locale/time-zone drift. */
    buildTime: string;
}

/** Opaque plate keeps the voice's AA text/surface pair legible over any image. */
export function BuildStamp({ name, describe, buildTime, className, ...props }: BuildStampProps) {
    return (
        <span
            className={cn(
                "inline-flex flex-wrap items-baseline gap-x-2 rounded-md border border-border bg-bg-elevated px-2 py-1 font-mono text-xs text-text-secondary normal-case tabular-nums",
                className,
            )}
            {...props}
        >
            <span>{name}</span>
            <span>{describe}</span>
            <time dateTime={buildTime}>{buildTime}</time>
        </span>
    );
}
