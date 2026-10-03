import type { SVGAttributes } from "react";
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
/**
 * A line with no axes or ticks, for a glance at a trend. The stroke is the
 * first chart colour and the comparison the second, so the pair keeps the
 * series-vs-status separation every voice is held to.
 */
export declare function Sparkline({ points, domain, comparison, label, className, ...props }: SparklineProps): import("react").JSX.Element;
