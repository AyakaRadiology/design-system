import type { HTMLAttributes } from "react";
export interface BuildStampProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    name: string;
    /** The consumer's git describe output, including dirty suffix if present. */
    describe: string;
    /** ISO 8601 build time. Displayed verbatim, without locale/time-zone drift. */
    buildTime: string;
}
/** Opaque plate keeps the voice's AA text/surface pair legible over any image. */
export declare function BuildStamp({ name, describe, buildTime, className, ...props }: BuildStampProps): import("react").JSX.Element;
