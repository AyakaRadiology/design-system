import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./cn.js";
/**
 * A single-line text control at the standard control height.
 *
 * `aria-invalid:border-danger` rather than an `invalid` prop: Field already
 * sets `aria-invalid` when it has an error to show, so the border follows the
 * accessible state instead of a second prop that could disagree with it.
 */
export function Input({ className, ...props }) {
    return (_jsx("input", { className: cn("h-8 w-full rounded-md border border-border-strong bg-bg px-3 text-sm placeholder:text-text-tertiary aria-invalid:border-danger disabled:opacity-50", className), ...props }));
}
