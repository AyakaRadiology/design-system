import { jsx as _jsx } from "react/jsx-runtime";
import { buttonVariants } from "./Button.js";
import { cn } from "./cn.js";
export function IconButton({ className, variant, type, ...props }) {
    return (_jsx("button", { type: type ?? "button", 
        // size-8 square, matching the md control height: an icon button
        // sits in the same row as a Button and has to line up with it.
        // No padding — the icon centres itself.
        className: cn(buttonVariants({ variant }), "size-8 justify-center px-0", className), ...props }));
}
