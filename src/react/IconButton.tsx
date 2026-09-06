import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonVariants } from "./Button.js";
import { cn } from "./cn.js";

export interface IconButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">,
        Omit<VariantProps<typeof buttonVariants>, "size"> {
    /**
     * Required, and required in the TYPE rather than checked at runtime: an
     * icon-only control with no accessible name is invisible to a screen
     * reader, and a rule that only fired in a test would fire after the code
     * was written.
     */
    "aria-label": string;
    children: ReactNode;
}

export function IconButton({ className, variant, type, ...props }: IconButtonProps) {
    return (
        <button
            type={type ?? "button"}
            // size-8 square, matching the md control height: an icon button
            // sits in the same row as a Button and has to line up with it.
            // No padding — the icon centres itself.
            className={cn(buttonVariants({ variant }), "size-8 justify-center px-0", className)}
            {...props}
        />
    );
}
