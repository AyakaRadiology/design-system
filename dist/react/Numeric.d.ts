import type { HTMLAttributes, ReactNode } from "react";
export interface NumericProps extends HTMLAttributes<HTMLSpanElement> {
    /** Rendered after the figure in secondary colour: "ms", "mm", "%". */
    unit?: ReactNode;
    children: ReactNode;
}
/**
 * Every reading a machine produced.
 *
 * `tabular-nums` is the whole point: without it, a counter ticking from 19 to
 * 20 shifts every digit beside it, and a column of figures does not line up.
 * Making this a component rather than a remembered pair of classes is what
 * stops half the figures in an app getting it and half not.
 */
export declare function Numeric({ unit, children, className, ...props }: NumericProps): import("react").JSX.Element;
