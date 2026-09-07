import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

const DEFAULT_PRECISION = 0;
const MAX_PRECISION = 100;
const DEFAULT_RESERVED_CHARS = 6;
const EMPTY_GLYPH = "—";
const COMPACT_UNIT = /^[°%]/u;
const EMPTY_ALIGN_CLASSES = {
    inherit: "text-right",
    start: "text-left",
    center: "text-center",
} as const;

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
               * Keep the unit visible, muted, while `value` is null. Off by
               * default: an empty readout should read as quiet, and a bright
               * unit beside a small dash is the loudest thing on the surface.
               */
              showUnitWhenEmpty?: boolean;
              /**
               * Keep the unit's reserved width while `value` is null, but do
               * not show its text. Useful when adjacent hero readouts must
               * not move as one sensor drops (default false).
               */
              reserveUnitSlotWhenEmpty?: boolean;
              /** Alignment of the empty glyph within the reserved value slot (default inherit). */
              emptyAlign?: "inherit" | "start" | "center";
              unitSeparator?: never;
              children?: never;
          }
        | {
              /** Compatibility for preformatted figures; prefer value for new readouts. */
              children: ReactNode;
              unit?: ReactNode;
              /** Separator before the unit (default auto: none for °/%; a space otherwise). */
              unitSeparator?: "auto" | "space" | "none";
              value?: never;
              precision?: never;
              reservedChars?: never;
              reservedUnitChars?: never;
              showUnitWhenEmpty?: never;
              reserveUnitSlotWhenEmpty?: never;
              emptyAlign?: never;
          }
    );

function unitSeparator(unit: ReactNode, separator: "auto" | "space" | "none") {
    if (separator === "none") return null;
    if (separator === "space") return " ";
    return typeof unit === "string" && COMPACT_UNIT.test(unit) ? null : " ";
}

/** A fixed value slot and a separate, case-preserving unit slot. */
export function Numeric({
    value,
    unit,
    precision = DEFAULT_PRECISION,
    reservedChars = DEFAULT_RESERVED_CHARS,
    reservedUnitChars,
    showUnitWhenEmpty = false,
    reserveUnitSlotWhenEmpty = false,
    emptyAlign = "inherit",
    unitSeparator: separator = "auto",
    children,
    className,
    ...props
}: NumericProps) {
    if (value === undefined) {
        return (
            <span className={cn("font-mono tabular-nums", className)} {...props}>
                {children}
                {unit !== undefined && unit !== null && (
                    <span className="text-text-secondary normal-case">
                        {unitSeparator(unit, separator)}
                        {unit}
                    </span>
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
                className={cn(
                    "ds-numeric-slot ds-numeric-value-slot shrink-0 whitespace-nowrap",
                    empty ? "ds-numeric-empty-slot" : "inline-block",
                    empty ? EMPTY_ALIGN_CLASSES[emptyAlign] : "text-right",
                )}
                style={{ "--ds-numeric-chars": reservedChars } as SlotStyle}
            >
                {empty ? (
                    <>
                        {/* Sized by `.ds-numeric-empty` against the readout's
                         * own size, never by a step chosen here: a fixed 12px
                         * dash is a speck under a hero reading, and a
                         * full-size one shouts about a value nobody has. */}
                        <span aria-hidden="true" className="ds-numeric-empty text-text-tertiary">
                            {EMPTY_GLYPH}
                        </span>
                        <span className="sr-only">No value</span>
                    </>
                ) : (
                    value.toFixed(precision)
                )}
            </span>
            {typeof unit === "string" &&
                (!empty || showUnitWhenEmpty || reserveUnitSlotWhenEmpty) && (
                    <span
                        data-slot="unit"
                        aria-hidden={empty && !showUnitWhenEmpty ? "true" : undefined}
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
                        {empty && !showUnitWhenEmpty ? null : unit}
                    </span>
                )}
        </span>
    );
}
