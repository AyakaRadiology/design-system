import type { HTMLAttributes } from "react";
import { cn } from "./cn.js";

export interface BuildStampProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    name: string;
    /** The consumer's git describe output, including dirty suffix if present. */
    describe: string;
    /**
     * ISO 8601 build time, or a string the consumer has already worded
     * ("built 2026-01-01 00:00 UTC"). Displayed verbatim either way, without
     * locale or time-zone drift.
     */
    buildTime: string;
    /**
     * Wording for an ISO `buildTime`. Receives the ISO string and returns what
     * is displayed; the machine-readable value stays the ISO string. Left out,
     * the ISO string is displayed as it always was.
     */
    formatBuildTime?: (iso: string) => string;
}

/* A <time> element promises that its dateTime is a valid datetime, so a
 * buildTime that is prose gets a plain span rather than a lie in the markup.
 * The shape is checked before the value: Date.parse falls back to a lenient
 * parser that reads "built 2026-01-01 00:00 UTC" as a date, which is exactly
 * the preformatted string this must NOT stamp as machine-readable. */
const ISO_8601 =
    /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

function isMachineReadable(buildTime: string) {
    return ISO_8601.test(buildTime) && !Number.isNaN(Date.parse(buildTime));
}

/** Opaque plate keeps the voice's AA text/surface pair legible over any image. */
export function BuildStamp({
    name,
    describe,
    buildTime,
    formatBuildTime,
    className,
    ...props
}: BuildStampProps) {
    const shown = formatBuildTime ? formatBuildTime(buildTime) : buildTime;
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
            {isMachineReadable(buildTime) ? (
                <time dateTime={buildTime}>{shown}</time>
            ) : (
                <span>{shown}</span>
            )}
        </span>
    );
}
