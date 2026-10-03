import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "./cn.js";
/**
 * A bordered surface with an optional header.
 *
 * The header renders only when there is something to put in it. An empty
 * header would still draw its bottom border, which reads as a divider above
 * nothing.
 */
export function Panel({ title, description, actions, contentClassName, children, className, ...props }) {
    const hasHeader = title !== undefined || description !== undefined || actions !== undefined;
    return (_jsxs("div", { className: cn("rounded-lg border border-border bg-bg", className), ...props, children: [hasHeader && (_jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-2", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold", children: title }), description !== undefined && (_jsx("div", { className: "text-sm text-text-secondary", children: description }))] }), actions] })), _jsx("div", { className: cn("p-4", contentClassName), children: children })] }));
}
