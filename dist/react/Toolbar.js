import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./cn.js";
/**
 * The row of controls at the top of a panel or a page.
 *
 * `role="toolbar"` is the reason this is a component: it tells a screen reader
 * that the buttons inside are one group, and it is the sort of attribute that
 * gets left off a hand-rolled div every second time.
 */
export function Toolbar({ className, ...props }) {
    return (_jsx("div", { role: "toolbar", className: cn("flex items-center gap-2 border-b border-border bg-bg px-3 py-2", className), ...props }));
}
