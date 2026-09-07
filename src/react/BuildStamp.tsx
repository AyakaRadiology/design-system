import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { Button } from "./Button.js";
import { cn } from "./cn.js";

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

export interface StaticBuildStampProps
    extends BuildStampMetadata,
        Omit<HTMLAttributes<HTMLSpanElement>, "children" | "onClick"> {
    onClick?: never;
}

export interface InteractiveBuildStampProps
    extends BuildStampMetadata,
        Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "name"> {
    onClick: NonNullable<ButtonHTMLAttributes<HTMLButtonElement>["onClick"]>;
}

export type BuildStampProps = StaticBuildStampProps | InteractiveBuildStampProps;

/* A <time> element promises that its dateTime is a valid datetime, so a
 * buildTime that is prose gets a plain span rather than a lie in the markup.
 * The shape is checked before the value: Date.parse falls back to a lenient
 * parser that reads "built 2026-01-01 00:00 UTC" as a date, which is exactly
 * the preformatted string this must NOT stamp as machine-readable. */
const ISO_8601 =
    /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

function isMachineReadable(buildTime: string) {
    return ISO_8601.test(buildTime) && !Number.isNaN(Date.parse(buildTime));
}

function isInteractive(props: BuildStampProps): props is InteractiveBuildStampProps {
    return typeof props.onClick === "function";
}

interface BuildStampPartsProps extends Pick<BuildStampMetadata, "name" | "describe" | "buildTime"> {
    shownBuildTime: string;
}

function BuildStampParts({ name, describe, buildTime, shownBuildTime }: BuildStampPartsProps) {
    return (
        <>
            <span>{name}</span>
            <span>{describe}</span>
            {isMachineReadable(buildTime) ? (
                <time dateTime={buildTime}>{shownBuildTime}</time>
            ) : (
                <span>{shownBuildTime}</span>
            )}
        </>
    );
}

const PLATE_CLASSES =
    "inline-flex flex-wrap items-baseline gap-x-2 rounded-md border border-border bg-bg-elevated px-2 py-1 font-mono text-xs text-text-secondary normal-case tabular-nums";

/** Opaque plate keeps the voice's AA text/surface pair legible over any image. */
export function BuildStamp(props: BuildStampProps) {
    if (isInteractive(props)) {
        const {
            name,
            describe,
            buildTime,
            formatBuildTime,
            className,
            "aria-label": ariaLabel,
            ...buttonProps
        } = props;
        const shownBuildTime = formatBuildTime ? formatBuildTime(buildTime) : buildTime;
        return (
            <Button
                size="sm"
                aria-label={ariaLabel ?? `${name} ${describe} ${shownBuildTime}`}
                className={cn(PLATE_CLASSES, "h-auto font-normal hover:bg-bg-subtle", className)}
                {...buttonProps}
            >
                <BuildStampParts
                    name={name}
                    describe={describe}
                    buildTime={buildTime}
                    shownBuildTime={shownBuildTime}
                />
            </Button>
        );
    }

    const { name, describe, buildTime, formatBuildTime, className, ...spanProps } = props;
    const shownBuildTime = formatBuildTime ? formatBuildTime(buildTime) : buildTime;
    return (
        <span className={cn(PLATE_CLASSES, className)} {...spanProps}>
            <BuildStampParts
                name={name}
                describe={describe}
                buildTime={buildTime}
                shownBuildTime={shownBuildTime}
            />
        </span>
    );
}
