import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MiniBars } from "./MiniBars.js";
import { Sparkline } from "./Sparkline.js";

const HOUR_AT_60_HZ = 60 * 60 * 60;

describe("large chart series", () => {
    it("scales a Sparkline to its minimum and maximum without an explicit domain", () => {
        const points = Array.from({ length: HOUR_AT_60_HZ }, (_, i) => i % 100);
        const markup = renderToStaticMarkup(<Sparkline points={points} />);
        const path = markup.match(/ d="([^"]*)"/)?.[1];
        expect(path).toMatch(/^M1\.00 23\.00/);
        expect(path).toMatch(/L99\.00 1\.00$/);
        expect(path?.match(/[ML]/g)).toHaveLength(HOUR_AT_60_HZ);
    });

    it("scales MiniBars to the largest value without an explicit maximum", () => {
        const values = Array.from({ length: HOUR_AT_60_HZ }, (_, i) => i % 101);
        const markup = renderToStaticMarkup(<MiniBars values={values} />);
        expect(markup.match(/style="height:/g)).toHaveLength(HOUR_AT_60_HZ);
        for (const percent of [0, 50, 100]) {
            expect(markup).toContain(`style="height:${percent}%"`);
        }
    });
});
