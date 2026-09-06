import type { HTMLAttributes } from "react";
import { cn } from "./cn.js";

export type ToolbarProps = HTMLAttributes<HTMLDivElement>;

/**
 * The row of controls at the top of a panel or a page.
 *
 * `role="toolbar"` is the reason this is a component: it tells a screen reader
 * that the buttons inside are one group, and it is the sort of attribute that
 * gets left off a hand-rolled div every second time.
 */
export function Toolbar({ className, ...props }: ToolbarProps) {
    return (
        <div
            role="toolbar"
            className={cn(
                "flex items-center gap-2 border-b border-border bg-bg px-3 py-2",
                className,
            )}
            {...props}
        />
    );
}
