import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

const DEFAULT_PRECISION = 0;
const MAX_PRECISION = 100;
const DEFAULT_RESERVED_CHARS = 6;
const EMPTY_GLYPH = "—";

type NumericAttributes = Omit<HTMLAttributes<HTMLSpanElement>, "children">;

export type NumericProps = NumericAttributes &
    (
        | {
              value: number | null;
              unit?: string;
              /** Decimal places, 0–100 (default 0). */
              precision?: number;
              /** Fixed value width in ch, including sign/decimal point (default 6). */
              reservedChars?: number;
              children?: never;
          }
        | {
              /** Compatibility for preformatted figures; prefer value for new readouts. */
              children: ReactNode;
              unit?: ReactNode;
              value?: never;
              precision?: never;
              reservedChars?: never;
          }
    );

/** A fixed value slot and a separate, case-preserving unit slot. */
export function Numeric({
    value,
    unit,
    precision = DEFAULT_PRECISION,
    reservedChars = DEFAULT_RESERVED_CHARS,
    children,
    className,
    ...props
}: NumericProps) {
    if (value === undefined) {
        return (
            <span className={cn("font-mono tabular-nums", className)} {...props}>
                {children}
                {unit !== undefined && unit !== null && (
                    <span className="text-text-secondary normal-case"> {unit}</span>
                )}
            </span>
        );
    }
    if (!Number.isInteger(precision) || precision < 0 || precision > MAX_PRECISION) {
        throw new RangeError(`Numeric precision must be an integer from 0 to ${MAX_PRECISION}`);
    }
    if (!Number.isInteger(reservedChars) || reservedChars < 1) {
        throw new RangeError("Numeric reservedChars must be a positive integer");
    }
    if (value !== null && !Number.isFinite(value)) {
        throw new RangeError("Numeric value must be finite or null");
    }
    const empty = value === null;
    return (
        <span
            className={cn("inline-flex items-baseline gap-1 font-mono tabular-nums", className)}
            {...props}
        >
            <span
                data-slot="value"
                className="inline-block shrink-0 whitespace-nowrap text-right"
                style={{ width: `${reservedChars}ch` }}
            >
                {empty ? (
                    <>
                        <span aria-hidden="true" className="text-xs text-text-tertiary">
                            {EMPTY_GLYPH}
                        </span>
                        <span className="sr-only">No value</span>
                    </>
                ) : (
                    value.toFixed(precision)
                )}
            </span>
            {typeof unit === "string" && (
                <span
                    data-slot="unit"
                    className={cn(
                        "inline-block shrink-0 whitespace-nowrap normal-case",
                        empty ? "text-text-tertiary" : "text-text-secondary",
                    )}
                    style={{ width: `${unit.length}ch` }}
                >
                    {unit}
                </span>
            )}
        </span>
    );
}
