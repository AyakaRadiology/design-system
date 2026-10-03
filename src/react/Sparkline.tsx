import type { SVGAttributes } from "react";
import { cn } from "./cn.js";

/** Drawing space of the SVG; the element scales to its box (`preserveAspectRatio="none"`). */
const WIDTH = 100;
const HEIGHT = 24;
/** Keeps a stroke centred on the first/last/min/max point inside the viewBox. */
const PAD = 1;

export interface SparklineProps extends Omit<SVGAttributes<SVGSVGElement>, "points"> {
    /** Oldest first. Non-finite values leave a gap in the line. */
    points: readonly number[];
    /**
     * The value range the full height maps to. Defaults to the min..max of
     * `points` and `comparison` together, so the two series share one scale.
     */
    domain?: readonly [number, number];
    /** A second series on the same scale, drawn behind in the second chart colour. */
    comparison?: readonly number[];
    /** The accessible name. Without one the sparkline is decorative and hidden. */
    label?: string;
}

function extent(values: readonly number[]): [number, number] | null {
    const finite = values.filter(Number.isFinite);
    return finite.length === 0 ? null : [Math.min(...finite), Math.max(...finite)];
}

function path(values: readonly number[], [low, high]: readonly [number, number]): string {
    const span = high - low;
    const step = values.length > 1 ? (WIDTH - 2 * PAD) / (values.length - 1) : 0;
    let drawing = false;
    const commands: string[] = [];
    values.forEach((value, index) => {
        if (!Number.isFinite(value)) {
            drawing = false;
            return;
        }
        // A flat series sits in the middle rather than on an edge.
        const ratio = span === 0 ? 0.5 : (value - low) / span;
        const clamped = Math.min(1, Math.max(0, ratio));
        const x = PAD + index * step;
        const y = HEIGHT - PAD - clamped * (HEIGHT - 2 * PAD);
        commands.push(`${drawing ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`);
        drawing = true;
    });
    return commands.join("");
}

/**
 * A line with no axes or ticks, for a glance at a trend. The stroke is the
 * first chart colour and the comparison the second, so the pair keeps the
 * series-vs-status separation every voice is held to.
 */
export function Sparkline({
    points,
    domain,
    comparison,
    label,
    className,
    ...props
}: SparklineProps) {
    const range = domain ?? extent([...points, ...(comparison ?? [])]) ?? ([0, 0] as const);
    return (
        <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            fill="none"
            data-ds-chart="sparkline"
            className={cn("h-6 w-full overflow-visible", className)}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            {...props}
        >
            {comparison ? (
                <path
                    d={path(comparison, range)}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    className="text-chart-2"
                    data-ds-series="comparison"
                />
            ) : null}
            <path
                d={path(points, range)}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="text-chart-1"
                data-ds-series="primary"
            />
        </svg>
    );
}
