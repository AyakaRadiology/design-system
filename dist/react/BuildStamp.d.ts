import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
interface BuildStampMetadata {
    name: string;
    /** The consumer's git describe output, including dirty suffix if present. */
    describe: string;
    /**
     * ISO 8601 build time, or a string the consumer has already worded
     * ("built 2026-01-01 00:00 UTC"). Displayed verbatim either way, without
     * locale or time-zone drift.
     */
    buildTime: string;
    /**
     * Wording for an ISO `buildTime`. Receives the ISO string and returns what
     * is displayed; the machine-readable value stays the ISO string. Left out,
     * the ISO string is displayed as it always was.
     */
    formatBuildTime?: (iso: string) => string;
}
export interface StaticBuildStampProps extends BuildStampMetadata, Omit<HTMLAttributes<HTMLSpanElement>, "children" | "onClick"> {
    onClick?: never;
}
export interface InteractiveBuildStampProps extends BuildStampMetadata, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "name"> {
    onClick: NonNullable<ButtonHTMLAttributes<HTMLButtonElement>["onClick"]>;
}
export type BuildStampProps = StaticBuildStampProps | InteractiveBuildStampProps;
/** Opaque plate keeps the voice's AA text/surface pair legible over any image. */
export declare function BuildStamp(props: BuildStampProps): import("react").JSX.Element;
export {};
