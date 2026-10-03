/** The five series colours of the active voice, as Tailwind colour names. */
export const CHART_SLOTS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const;
export type ChartSlot = (typeof CHART_SLOTS)[number];
