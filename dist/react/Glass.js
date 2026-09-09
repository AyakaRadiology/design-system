import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./cn.js";
/** Floating material only: layout, padding and accessible semantics belong to
 * the caller. Use ds-glass directly on buttons or dialog primitives. */
export function Glass({ className, ...props }) {
    return _jsx("div", { className: cn("ds-glass", className), ...props });
}
