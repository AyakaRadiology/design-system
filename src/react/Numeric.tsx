import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

const DEFAULT_PRECISION = 0;
const MAX_PRECISION = 100;
const DEFAULT_RESERVED_CHARS = 6;
const EMPTY_GLYPH = "—";

/* React's CSSProperties has no room for a custom property, so the one this
 * component sets is declared here rather than asserted away with `any`. The
 * width itself is `.ds-numeric-slot` in tokens/scales.css: a slot width is a
 * count of monospace characters, and a class that reads the count off this
 * property keeps the width overridable from CSS — an inline `width` is the one
 * thing a consumer cannot reach. */
interface SlotStyle extends CSSProperties {
    "--ds-numeric-chars": number;
}

function assertSlotWidth(prop: string, chars: number) {
    if (!Number.isInteger(chars) || chars < 1) {
        throw new RangeError(`Numeric ${prop} must be a positive integer`);
    }
}

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
              /**
               * Fixed unit width in ch (default: the unit's own length). Pin it
               * for a unit that changes — ms/s/min — so the cells beside the
               * readout do not move when the unit does.
               */
              reservedUnitChars?: number;
              /**
               * Drop the unit's text while `value` is null, keeping its
               * reserved slot so nothing shifts when the reading arrives.
               */
              hideUnitWhenEmpty?: boolean;
              children?: never;
          }
        | {
              /** Compatibility for preformatted figures; prefer value for new readouts. */
              children: ReactNode;
              unit?: ReactNode;
              value?: never;
              precision?: never;
              reservedChars?: never;
              reservedUnitChars?: never;
              hideUnitWhenEmpty?: never;
          }
    );

/** A fixed value slot and a separate, case-preserving unit slot. */
export function Numeric({
    value,
    unit,
    precision = DEFAULT_PRECISION,
    reservedChars = DEFAULT_RESERVED_CHARS,
    reservedUnitChars,
    hideUnitWhenEmpty = false,
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
    assertSlotWidth("reservedChars", reservedChars);
    if (reservedUnitChars !== undefined) assertSlotWidth("reservedUnitChars", reservedUnitChars);
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
                className="ds-numeric-slot inline-block shrink-0 whitespace-nowrap text-right"
                style={{ "--ds-numeric-chars": reservedChars } as SlotStyle}
            >
                {empty ? (
                    <>
                        {/* No size of its own: the placeholder is the value, so
                         * it reads at whatever size the readout is set in — a
                         * fixed small step turns a hero reading into a speck
                         * beside its own unit. */}
                        <span aria-hidden="true" className="text-text-tertiary">
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
                        "ds-numeric-slot inline-block shrink-0 whitespace-nowrap normal-case",
                        empty ? "text-text-tertiary" : "text-text-secondary",
                    )}
                    style={
                        {
                            "--ds-numeric-chars": reservedUnitChars ?? unit.length,
                        } as SlotStyle
                    }
                >
                    {empty && hideUnitWhenEmpty ? null : unit}
                </span>
            )}
        </span>
    );
}
