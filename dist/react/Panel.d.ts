import type { HTMLAttributes, ReactNode } from "react";
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
export declare function Panel({ title, actions, children, className, ...props }: PanelProps): import("react").JSX.Element;
