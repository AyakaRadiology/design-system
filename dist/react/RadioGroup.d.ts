import { type ReactNode } from "react";
export interface RadioGroupOption {
    value: string;
    label: ReactNode;
    disabled?: boolean;
}
export interface RadioGroupProps {
    options: RadioGroupOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    id?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    orientation?: "horizontal" | "vertical";
    dir?: "ltr" | "rtl";
    loop?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    className?: string;
}
/** Radix owns roving focus, arrow/Space selection and form participation. */
export declare function RadioGroup({ options, value, defaultValue, onValueChange, id, name, disabled, required, orientation, dir, loop, className, ...aria }: RadioGroupProps): import("react").JSX.Element;
