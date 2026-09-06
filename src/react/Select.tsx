import * as SelectPrimitive from "@radix-ui/react-select";
import type { ReactNode } from "react";
import { cn } from "./cn.js";

export interface SelectOption {
    value: string;
    label: ReactNode;
}

export interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    /** Set by Field; also settable directly. */
    id?: string;
    name?: string;
    disabled?: boolean;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    className?: string;
}

/**
 * A single-choice control.
 *
 * Options are a prop rather than children, which is the whole reason this is
 * worth wrapping: it collapses the four-element Radix composition (Root,
 * Trigger, Value, Content + Item) that every call site would otherwise
 * assemble — and mis-assemble — into one list. Callers who genuinely need the
 * composition can reach for Radix directly; nothing here hides it.
 *
 * The trigger wears the Input classes on purpose: a select and a text field
 * sitting in the same form must be the same height and carry the same border,
 * and two independent class lists is how that stops being true.
 */
export function Select({
    value,
    onValueChange,
    options,
    placeholder,
    id,
    name,
    disabled,
    className,
    ...aria
}: SelectProps) {
    return (
        <SelectPrimitive.Root
            value={value}
            onValueChange={onValueChange}
            name={name}
            disabled={disabled}
        >
            <SelectPrimitive.Trigger
                id={id}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
                className={cn(
                    "inline-flex h-8 w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-bg px-3 text-sm aria-invalid:border-danger disabled:opacity-50",
                    className,
                )}
            >
                <SelectPrimitive.Value placeholder={placeholder} />
                <SelectPrimitive.Icon className="text-text-secondary">▾</SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    position="popper"
                    sideOffset={4}
                    className="z-overlay overflow-hidden rounded-md border border-border bg-bg shadow-sm"
                >
                    <SelectPrimitive.Viewport>
                        {options.map((option) => (
                            <SelectPrimitive.Item
                                key={option.value}
                                value={option.value}
                                className="flex h-8 cursor-default items-center px-3 text-sm data-[highlighted]:bg-bg-subtle data-[highlighted]:outline-none data-[state=checked]:text-accent"
                            >
                                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                            </SelectPrimitive.Item>
                        ))}
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}
