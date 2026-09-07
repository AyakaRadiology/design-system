import type { HTMLAttributes, ReactNode } from "react";
type NumericAttributes = Omit<HTMLAttributes<HTMLSpanElement>, "children">;
export type NumericProps = NumericAttributes & ({
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
} | {
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
});
/** A fixed value slot and a separate, case-preserving unit slot. */
export declare function Numeric({ value, unit, precision, reservedChars, reservedUnitChars, showUnitWhenEmpty, reserveUnitSlotWhenEmpty, emptyAlign, unitSeparator: separator, children, className, ...props }: NumericProps): import("react").JSX.Element;
export {};
