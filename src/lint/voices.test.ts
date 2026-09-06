import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrastRatio, deltaE, type Oklch, tokenBlocks } from "./contrast.js";

/* Every voice, every mode it ships, held to the same floors — the point of
 * putting the palettes in one package is that none of them gets its own. A
 * voice added to voices/ is picked up here without touching this file, which
 * is what keeps "the contrast test covers every voice" true rather than
 * remembered. */

const voicesDir = fileURLToPath(new URL("../../voices/", import.meta.url).href);
const voices = readdirSync(voicesDir)
    .filter((name) => name.endsWith(".css"))
    .sort();

/** WCAG AA for body text. */
const AA = 4.5;
/** WCAG AA for non-text marks, and the floor for text that is decorative on purpose. */
const NON_TEXT = 3.0;
/** The dataviz validator's floor for telling two ADJACENT series apart with
 * full colour vision: OKLab ΔE ×100. It runs the CVD-simulated pairs too; this
 * keeps the cheap half of that check in CI. */
const SERIES_SEPARATION = 15;
/** How far a series colour must sit from a status colour before the two can be
 * confused. Lower than the series floor on purpose: two series sit side by side
 * in one chart, where a series and a status hue only ever share a page. A
 * series that reads as a status tells the viewer something the data never
 * said — that a slice is failing, or that spending is an error. */
const STATUS_SEPARATION = 10;
/** Two surfaces are either deliberately the SAME (base light draws elevation
 * with a shadow, so bg-elevated equals bg there) or visibly different. What is
 * rejected is the state in between: almost-the-same, where a floating menu
 * reads as an inset well and nobody can say whether that was meant. */
const SURFACE_SEPARATION = 2;

const SURFACES = ["bg", "bg-subtle", "bg-muted", "bg-elevated"];
const TINTS = ["success-subtle", "warning-subtle", "danger-subtle", "info-subtle", "accent-subtle"];
const FILLS = ["accent", "success", "warning", "danger", "info"];
const CHART_SLOTS = [1, 2, 3, 4, 5].map((n) => `chart-${n}`);
const STATUS_SLOTS = ["success", "warning", "danger", "info"];

if (voices.length === 0)
    throw new Error("voices/ contains no .css file — this gate would assert nothing");

for (const voice of voices) {
    const css = readFileSync(`${voicesDir}${voice}`, "utf8");
    const blocks = tokenBlocks(css);

    for (const [mode, tokens] of blocks) {
        describe(`${voice} ${mode}`, () => {
            const value = (name: string): Oklch => {
                const token = tokens.get(name);
                if (!token) throw new Error(`${voice} ${mode} declares no --${name}`);
                return token;
            };
            const ratio = (fg: string, bg: string) => contrastRatio(value(fg), value(bg));
            const distance = (a: string, b: string) => deltaE(value(a), value(b));

            it("body text clears AA on every surface", () => {
                for (const surface of SURFACES)
                    expect(ratio("text", surface), `text/${surface}`).toBeGreaterThanOrEqual(AA);
            });

            it("secondary text clears AA on the card and the elevated surface", () => {
                expect(ratio("text-secondary", "bg")).toBeGreaterThanOrEqual(AA);
                /* Popovers, menus and tooltips put units and meta on this
                 * surface, so it carries secondary text as often as bg does. */
                expect(ratio("text-secondary", "bg-elevated")).toBeGreaterThanOrEqual(AA);
            });

            /* On a voice that draws no shadows, lightness is the only thing
             * saying a menu floats. Two surfaces 0.01 L apart are not a step. */
            it("keeps its surfaces either identical or tellable apart", () => {
                for (let i = 0; i < SURFACES.length; i++)
                    for (let j = i + 1; j < SURFACES.length; j++) {
                        const [a, b] = [SURFACES[i], SURFACES[j]];
                        if (!a || !b) throw new Error("surface list is malformed");
                        const apart = distance(a, b);
                        if (apart === 0) continue;
                        expect(apart, `${a}/${b}`).toBeGreaterThanOrEqual(SURFACE_SEPARATION);
                    }
            });

            /* Deliberately sub-AA — decorative meta only. The 3.0 floor records
             * that intent, so a value drifting further is still a red build. */
            it("tertiary text stays legible even though it is under AA", () => {
                expect(ratio("text-tertiary", "bg")).toBeGreaterThanOrEqual(NON_TEXT);
                expect(ratio("text-tertiary", "bg")).toBeLessThan(AA);
            });

            it("labels on -subtle tints clear AA (the tint+label rule)", () => {
                for (const tint of TINTS)
                    expect(ratio("text", tint), `text/${tint}`).toBeGreaterThanOrEqual(AA);
            });

            it("every solid fill carries a readable foreground", () => {
                for (const fill of FILLS)
                    expect(ratio(`${fill}-fg`, fill), `${fill}-fg/${fill}`).toBeGreaterThanOrEqual(
                        AA,
                    );
            });

            it("danger is the only status hue allowed as text, and it clears AA", () => {
                expect(ratio("danger", "bg")).toBeGreaterThanOrEqual(AA);
            });

            it("every chart series is visible as a mark on the card surface", () => {
                // 3:1 is the non-text floor: these are fills, never text.
                for (const slot of CHART_SLOTS)
                    expect(ratio(slot, "bg"), `${slot}/bg`).toBeGreaterThanOrEqual(NON_TEXT);
            });

            it("adjacent chart series stay tellable apart", () => {
                for (let i = 1; i < CHART_SLOTS.length; i++) {
                    const [previous, current] = [CHART_SLOTS[i - 1], CHART_SLOTS[i]];
                    if (!previous || !current) throw new Error("chart slot list is malformed");
                    expect(
                        distance(previous, current),
                        `${previous}/${current}`,
                    ).toBeGreaterThanOrEqual(SERIES_SEPARATION);
                }
            });

            it("no chart series can be mistaken for a status colour", () => {
                for (const slot of CHART_SLOTS)
                    for (const status of STATUS_SLOTS)
                        expect(distance(slot, status), `${slot}/${status}`).toBeGreaterThanOrEqual(
                            STATUS_SEPARATION,
                        );
            });
        });
    }

    describe(`${voice} — the mode contract`, () => {
        it("declares its colours on :root, and on .dark only if it has a light mode", () => {
            expect([...blocks.keys()].every((mode) => mode === ":root" || mode === ".dark")).toBe(
                true,
            );
            expect(blocks.has(":root")).toBe(true);
        });

        /* A dark-only voice states its single-mode contract in prose
         * (voices/biomonitor/VOICE.md rule 1). tokenBlocks is what makes the
         * contract mechanical: it refuses a theme on any other selector, and
         * refuses a prefers-color-scheme query outright, so a second palette
         * cannot arrive without arriving in .dark where these floors iterate
         * over it. */
        it("holds every mode it declares to the floors above", () => {
            expect(blocks.size).toBeGreaterThanOrEqual(1);
        });
    });
}

describe("the glow is derived, not restated", () => {
    /* --trace-glow is the one non-opaque token, so it has no ratio of its own;
     * what matters is that it stays derived from the accent rather than pinned
     * to a hue the accent has since moved off. */
    it("keeps biomonitor's trace glow tied to its accent", () => {
        const css = readFileSync(`${voicesDir}biomonitor.css`, "utf8");
        expect(css).toContain("--trace-glow: color-mix(in oklab, var(--accent)");
        expect(tokenBlocks(css).get(":root")?.has("trace-glow")).toBe(false);
    });
});
