import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MiniBars } from "./MiniBars.js";
import { Sparkline } from "./Sparkline.js";

const SAMPLES_PER_DAY = 86_400;

describe("charts with large data sets", () => {
    it("scales two full-day sparklines to their combined range without an explicit domain", () => {
        const points = Array.from({ length: SAMPLES_PER_DAY }, (_, i) => (i % 2 === 0 ? -3 : -1));
        const comparison = Array.from({ length: SAMPLES_PER_DAY }, (_, i) => (i % 2 === 0 ? 2 : 7));
        const automatic = renderToStaticMarkup(
            <Sparkline points={points} comparison={comparison} />,
        );
        const explicit = renderToStaticMarkup(
            <Sparkline points={points} comparison={comparison} domain={[-3, 7]} />,
        );
        expect(automatic).toBe(explicit);
        expect(automatic.match(/<path /g)).toHaveLength(2);
        expect(automatic).toContain('d="M1.00 23.00');
        expect(automatic).toContain('L99.00 1.00"');
    });

    it("scales a large bar series to its largest value without an explicit max", () => {
        const values = Array.from({ length: SAMPLES_PER_DAY * 2 }, (_, i) => (i % 3) + 1);
        const automatic = renderToStaticMarkup(<MiniBars values={values} />);
        const explicit = renderToStaticMarkup(<MiniBars values={values} max={3} />);
        expect(automatic).toBe(explicit);
        expect(automatic.match(/style="height:/g)).toHaveLength(values.length);
        expect(automatic).toContain('style="height:100%"');
    });
});
