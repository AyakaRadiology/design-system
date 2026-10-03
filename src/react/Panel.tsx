import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    title?: ReactNode;
    /** Supporting text displayed under the title. */
    description?: ReactNode;
    /** Controls pinned to the right of the header — a Button, an IconButton. */
    actions?: ReactNode;
    /** Body layout classes, merged with the default padding. */
    contentClassName?: string;
    children: ReactNode;
}

/**
 * A bordered surface with an optional header.
 *
 * The header renders only when there is something to put in it. An empty
 * header would still draw its bottom border, which reads as a divider above
 * nothing.
 */
export function Panel({
    title,
    description,
    actions,
    contentClassName,
    children,
    className,
    ...props
}: PanelProps) {
    const hasHeader = title !== undefined || description !== undefined || actions !== undefined;
    return (
        <div className={cn("rounded-lg border border-border bg-bg", className)} {...props}>
            {hasHeader && (
                <div className="flex items-center justify-between border-b border-border px-4 py-2">
                    <div>
                        <div className="text-sm font-semibold">{title}</div>
                        {description !== undefined && (
                            <div className="text-sm text-text-secondary">{description}</div>
                        )}
                    </div>
                    {actions}
                </div>
            )}
            <div className={cn("p-4", contentClassName)}>{children}</div>
        </div>
    );
}
