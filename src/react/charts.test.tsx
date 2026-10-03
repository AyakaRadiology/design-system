// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CHART_SLOTS, MiniBars, Sparkline } from "./index.js";

function d(container: HTMLElement, series: "primary" | "comparison") {
    return container.querySelector(`[data-ds-series="${series}"]`)?.getAttribute("d");
}

describe("Sparkline", () => {
    it("draws the points left to right, low values at the bottom", () => {
        const { container } = render(<Sparkline points={[0, 10]} />);
        expect(d(container, "primary")).toBe("M1.00 23.00L99.00 1.00");
    });

    it("is named by its label and hidden without one", () => {
        const { rerender } = render(<Sparkline points={[1, 2]} label="Latency, last hour" />);
        expect(screen.getByRole("img", { name: "Latency, last hour" })).toBeInTheDocument();
        rerender(<Sparkline points={[1, 2]} />);
        expect(screen.queryByRole("img")).toBeNull();
    });

    it("puts the comparison on the same scale in the second chart colour", () => {
        const { container } = render(<Sparkline points={[0, 5]} comparison={[10, 5]} />);
        // 10 is the shared maximum, so the comparison starts at the top.
        expect(d(container, "comparison")).toBe("M1.00 1.00L99.00 12.00");
        expect(container.querySelector('[data-ds-series="comparison"]')).toHaveClass(
            "text-chart-2",
        );
        expect(container.querySelector('[data-ds-series="primary"]')).toHaveClass("text-chart-1");
    });

    it("honours an explicit domain and clamps what falls outside it", () => {
        const { container } = render(<Sparkline points={[-5, 50, 200]} domain={[0, 100]} />);
        expect(d(container, "primary")).toBe("M1.00 23.00L50.00 12.00L99.00 1.00");
    });

    it("leaves a gap at a non-finite value instead of drawing a false line", () => {
        const { container } = render(<Sparkline points={[0, Number.NaN, 10]} />);
        expect(d(container, "primary")).toBe("M1.00 23.00M99.00 1.00");
    });

    it("centres a flat series and draws nothing for no data", () => {
        const flat = render(<Sparkline points={[3, 3, 3]} />);
        expect(d(flat.container, "primary")).toBe("M1.00 12.00L50.00 12.00L99.00 12.00");
        const none = render(<Sparkline points={[]} />);
        expect(d(none.container, "primary")).toBe("");
    });
});

describe("MiniBars", () => {
    const heights = (container: HTMLElement) =>
        [...container.querySelectorAll<HTMLElement>('[data-ds-chart="mini-bars"] > div > div')].map(
            (bar) => bar.style.height,
        );

    it("scales bars to the largest value, or to `max` when given", () => {
        const auto = render(<MiniBars values={[5, 10]} />);
        expect(heights(auto.container)).toEqual(["50%", "100%"]);
        const capped = render(<MiniBars values={[5, 10]} max={20} />);
        expect(heights(capped.container)).toEqual(["25%", "50%"]);
    });

    it("clamps to the box and keeps a hairline for a tiny value, none for zero", () => {
        const { container } = render(<MiniBars values={[0, 0.1, 99]} max={10} />);
        expect(heights(container)).toEqual(["0%", "4%", "100%"]);
    });

    it("treats negative and non-finite values as zero", () => {
        const { container } = render(<MiniBars values={[-3, Number.NaN, 4]} />);
        expect(heights(container)).toEqual(["0%", "0%", "100%"]);
    });

    it("fills from a chart colour by default and from a status when asked", () => {
        const slot = render(<MiniBars values={[1]} />);
        expect(slot.container.querySelector(".bg-chart-1")).not.toBeNull();
        const status = render(<MiniBars values={[1]} series="danger" />);
        expect(status.container.querySelector(".bg-danger")).not.toBeNull();
        for (const name of CHART_SLOTS) {
            const view = render(<MiniBars values={[1]} series={name} />);
            expect(view.container.querySelector(`.bg-${name}`)).not.toBeNull();
        }
    });

    it("names each bar when labels are given and is hidden from assistive tech otherwise", () => {
        const named = render(<MiniBars values={[1, 2]} labels={["10:00: 1", "11:00: 2"]} />);
        expect(named.getAllByRole("img").map((item) => item.getAttribute("aria-label"))).toEqual([
            "10:00: 1",
            "11:00: 2",
        ]);
        const plain = render(<MiniBars values={[1, 2]} />);
        expect(plain.container.querySelector('[data-ds-chart="mini-bars"]')).toHaveAttribute(
            "aria-hidden",
            "true",
        );
    });
});
