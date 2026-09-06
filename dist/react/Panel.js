import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "./cn.js";
/**
 * A bordered surface with an optional header.
 *
 * The header renders only when there is something to put in it. An empty
 * header would still draw its bottom border, which reads as a divider above
 * nothing.
 */
export function Panel({ title, actions, children, className, ...props }) {
    const hasHeader = title !== undefined || actions !== undefined;
    return (_jsxs("div", { className: cn("rounded-lg border border-border bg-bg", className), ...props, children: [hasHeader && (_jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-2", children: [_jsx("div", { className: "text-sm font-semibold", children: title }), actions] })), _jsx("div", { className: "p-4", children: children })] }));
}
