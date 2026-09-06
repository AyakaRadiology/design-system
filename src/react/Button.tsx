import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn.js";

/**
 * The variant table. Every class here names a token role, never a value, which
 * is what lets a voice re-tone the whole system without touching this file.
 *
 * No focus classes anywhere: `tokens/scales.css` sets one global
 * `:focus-visible` outline, and a component that added its own would be the
 * second answer to a question already answered once.
 */
export const buttonVariants = cva(
    "inline-flex items-center gap-2 rounded-md font-medium disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-accent text-accent-fg hover:bg-accent-hover",
                secondary: "border border-border-strong bg-bg text-text hover:bg-bg-subtle",
                ghost: "text-text hover:bg-bg-subtle",
                danger: "bg-danger text-danger-fg hover:bg-danger-hover",
            },
            size: {
                md: "h-8 px-3 text-sm",
                sm: "h-7 px-2 text-xs",
            },
        },
        defaultVariants: { variant: "secondary", size: "md" },
    },
);

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type, ...props }: ButtonProps) {
    return (
        <button
            // Buttons inside a <form> submit it unless told otherwise, and a
            // toolbar button that reloads the page is the bug this default
            // exists to prevent. A caller that wants a submit says so.
            type={type ?? "button"}
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        />
    );
}
