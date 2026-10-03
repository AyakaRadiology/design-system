import type { HTMLAttributes } from "react";
import type { ChartSlot } from "./chart.js";
import type { Status } from "./StatusPill.js";
export interface MiniBarsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** Oldest first, newest on the right. Negative and non-finite values count as 0. */
    values: readonly number[];
    /** The value a full-height bar stands for. Defaults to the largest value. */
    max?: number;
    /** Fill: a chart colour for a series, or a status colour for a state. */
    series?: ChartSlot | Status;
    /** One accessible name per bar, e.g. "14:00: 12 ms". Without them the strip is decorative. */
    labels?: readonly string[];
}
/** A fixed-height strip of bars for the last N samples, with no axes. */
export declare function MiniBars({ values, max, series, labels, className, ...props }: MiniBarsProps): import("react").JSX.Element;
