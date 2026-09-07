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
     * Drop the unit's text while `value` is null, keeping its
     * reserved slot so nothing shifts when the reading arrives.
     */
    hideUnitWhenEmpty?: boolean;
    children?: never;
} | {
    /** Compatibility for preformatted figures; prefer value for new readouts. */
    children: ReactNode;
    unit?: ReactNode;
    value?: never;
    precision?: never;
    reservedChars?: never;
    reservedUnitChars?: never;
    hideUnitWhenEmpty?: never;
});
/** A fixed value slot and a separate, case-preserving unit slot. */
export declare function Numeric({ value, unit, precision, reservedChars, reservedUnitChars, hideUnitWhenEmpty, children, className, ...props }: NumericProps): import("react").JSX.Element;
export {};
