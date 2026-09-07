import type { HTMLAttributes, ReactNode } from "react";
type NumericAttributes = Omit<HTMLAttributes<HTMLSpanElement>, "children">;
export type NumericProps = NumericAttributes & ({
    value: number | null;
    unit?: string;
    /** Decimal places, 0–100 (default 0). */
    precision?: number;
    /** Fixed value width in ch, including sign/decimal point (default 6). */
    reservedChars?: number;
    children?: never;
} | {
    /** Compatibility for preformatted figures; prefer value for new readouts. */
    children: ReactNode;
    unit?: ReactNode;
    value?: never;
    precision?: never;
    reservedChars?: never;
});
/** A fixed value slot and a separate, case-preserving unit slot. */
export declare function Numeric({ value, unit, precision, reservedChars, children, className, ...props }: NumericProps): import("react").JSX.Element;
export {};
