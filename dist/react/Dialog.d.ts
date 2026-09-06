import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
/** The controlled root. Re-exported unchanged: it renders nothing to style. */
export declare const Dialog: import("react").FC<DialogPrimitive.DialogProps>;
/** Wraps its child as the opener. Pass `asChild` semantics a Button. */
export declare const DialogTrigger: import("react").ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
/** Closes the dialog from inside. Useful for a Cancel in `actions`. */
export declare const DialogClose: import("react").ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & import("react").RefAttributes<HTMLButtonElement>>;
export interface DialogContentProps {
    /**
     * Required. A dialog with no accessible name is announced as a nameless
     * region, so Radix warns about it at runtime — a warning nobody reads. In
     * the type it is a compile error instead.
     */
    title: ReactNode;
    description?: ReactNode;
    /** Footer controls, right-aligned. */
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}
export declare function DialogContent({ title, description, actions, children, className, }: DialogContentProps): import("react").JSX.Element;
