import type { ComponentPropsWithRef } from "react";
export type GlassProps = ComponentPropsWithRef<"div"> & {
    /** Normal material, denser fill, or opaque elevated surface. */
    "data-glass"?: "on" | "strong" | "off";
};
/** Floating material only: layout, padding and accessible semantics belong to
 * the caller. Use ds-glass directly on buttons or dialog primitives. */
export declare function Glass({ className, ...props }: GlassProps): import("react").JSX.Element;
