import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    title?: ReactNode;
    /** Controls pinned to the right of the header — a Button, an IconButton. */
    actions?: ReactNode;
    children: ReactNode;
}

/**
 * A bordered surface with an optional header.
 *
 * The header renders only when there is something to put in it. An empty
 * header would still draw its bottom border, which reads as a divider above
 * nothing.
 */
export function Panel({ title, actions, children, className, ...props }: PanelProps) {
    const hasHeader = title !== undefined || actions !== undefined;
    return (
        <div className={cn("rounded-lg border border-border bg-bg", className)} {...props}>
            {hasHeader && (
                <div className="flex items-center justify-between border-b border-border px-4 py-2">
                    <div className="text-sm font-semibold">{title}</div>
                    {actions}
                </div>
            )}
            <div className="p-4">{children}</div>
        </div>
    );
}
