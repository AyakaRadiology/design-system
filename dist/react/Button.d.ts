import { type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
/**
 * The variant table. Every class here names a token role, never a value, which
 * is what lets a voice re-tone the whole system without touching this file.
 *
 * No focus classes anywhere: `tokens/scales.css` sets one global
 * `:focus-visible` outline, and a component that added its own would be the
 * second answer to a question already answered once.
 */
export declare const buttonVariants: (props?: ({
    variant?: "primary" | "secondary" | "ghost" | "danger" | null | undefined;
    size?: "md" | "sm" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
}
export declare function Button({ className, variant, size, type, ...props }: ButtonProps): import("react").JSX.Element;
