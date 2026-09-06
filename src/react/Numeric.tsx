import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

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
export function Numeric({ unit, children, className, ...props }: NumericProps) {
    return (
        <span className={cn("font-mono tabular-nums", className)} {...props}>
            {children}
            {unit !== undefined && unit !== null && (
                <span className="text-text-secondary"> {unit}</span>
            )}
        </span>
    );
}
