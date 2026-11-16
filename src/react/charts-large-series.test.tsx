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

    it("keeps an hour of MiniBars samples within the window and scales to the largest value", () => {
        const values = Array.from({ length: HOUR_AT_60_HZ }, (_, i) => i % 101);
        const markup = renderToStaticMarkup(<MiniBars values={values} style={{ width: 200 }} />);
        expect(markup.match(/style="height:/g)).toHaveLength(HOUR_AT_60_HZ);
        // No browser layout in this SSR test: verify the CSS sizing contract.
        expect(markup).not.toMatch(/min-w-px|gap-px/);
        expect(markup.match(/class="flex h-full min-w-0 flex-1 items-end"/g)).toHaveLength(
            HOUR_AT_60_HZ,
        );
        expect(markup).toContain("overflow-hidden");
        // Spacing is subtracted from each slot's width, never added between slots.
        expect(markup.match(/width:calc\(100% - min\(1px, 50%\)\)/g)).toHaveLength(HOUR_AT_60_HZ);
        for (const percent of [0, 50, 100]) {
            expect(markup).toContain(`style="height:${percent}%;`);
        }
    });
});
