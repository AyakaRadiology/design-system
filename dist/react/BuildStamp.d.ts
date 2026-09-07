import type { HTMLAttributes } from "react";
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
/** Opaque plate keeps the voice's AA text/surface pair legible over any image. */
export declare function BuildStamp({ name, describe, buildTime, formatBuildTime, className, ...props }: BuildStampProps): import("react").JSX.Element;
