import type { HTMLAttributes } from "react";
export type ToolbarProps = HTMLAttributes<HTMLDivElement>;
/**
 * The row of controls at the top of a panel or a page.
 *
 * `role="toolbar"` is the reason this is a component: it tells a screen reader
 * that the buttons inside are one group, and it is the sort of attribute that
 * gets left off a hand-rolled div every second time.
 */
export declare function Toolbar({ className, ...props }: ToolbarProps): import("react").JSX.Element;
