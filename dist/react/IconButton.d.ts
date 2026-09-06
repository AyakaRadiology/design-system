import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonVariants } from "./Button.js";
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">, Omit<VariantProps<typeof buttonVariants>, "size"> {
    /**
     * Required, and required in the TYPE rather than checked at runtime: an
     * icon-only control with no accessible name is invisible to a screen
     * reader, and a rule that only fired in a test would fire after the code
     * was written.
     */
    "aria-label": string;
    children: ReactNode;
}
export declare function IconButton({ className, variant, type, ...props }: IconButtonProps): import("react").JSX.Element;
