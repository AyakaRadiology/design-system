import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { type ReactNode, useId } from "react";
import { cn } from "./cn.js";

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
export function RadioGroup({
    options,
    value,
    defaultValue,
    onValueChange,
    id,
    name,
    disabled,
    required,
    orientation = "vertical",
    dir,
    loop,
    className,
    ...aria
}: RadioGroupProps) {
    const groupId = useId();
    return (
        <RadioGroupPrimitive.Root
            id={id}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            disabled={disabled}
            required={required}
            orientation={orientation}
            dir={dir}
            loop={loop}
            aria-label={aria["aria-label"]}
            aria-labelledby={aria["aria-labelledby"]}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            className={cn(
                "flex gap-2",
                orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
                className,
            )}
        >
            {options.map((option, index) => (
                <div key={option.value} className="flex min-h-8 items-center gap-2">
                    <RadioGroupPrimitive.Item
                        id={`${groupId}-${index}`}
                        value={option.value}
                        disabled={option.disabled}
                        className="peer flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg data-[state=checked]:border-accent disabled:opacity-50"
                    >
                        <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-accent" />
                    </RadioGroupPrimitive.Item>
                    <label
                        htmlFor={`${groupId}-${index}`}
                        className="text-sm text-text peer-disabled:opacity-50"
                    >
                        {option.label}
                    </label>
                </div>
            ))}
        </RadioGroupPrimitive.Root>
    );
}
