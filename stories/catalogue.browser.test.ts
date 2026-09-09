import {
    composeStories,
    type Meta,
    type StoryObj,
    setProjectAnnotations,
} from "@storybook/react-vite";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { cdp } from "vitest/browser";
import preview from "../.storybook/preview.js";

const VOICES = ["base-light", "base-dark", "biomonitor"];
type StoryModule = { default: Meta } & Record<string, StoryObj>;
const modules = import.meta.glob<StoryModule>("./*.stories.tsx", {
    eager: true,
});
const annotations = setProjectAnnotations(preview);
beforeAll(annotations.beforeAll);
let consoleErrors: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
    // Spy without replacing the implementation: diagnostics stay visible.
    consoleErrors = vi.spyOn(console, "error");
});
afterEach(() => {
    try {
        expect(consoleErrors).not.toHaveBeenCalled();
    } finally {
        consoleErrors.mockRestore();
    }
});

for (const voice of VOICES) {
    describe(voice, () => {
        for (const [file, exports] of Object.entries(modules)) {
            const stories = composeStories(exports, {
                initialGlobals: { ...preview.initialGlobals, voice },
            });
            for (const [name, story] of Object.entries(stories)) {
                test(`${file}: ${name}`, async () => {
                    const reduced = Boolean(story.parameters.reducedTransparency);
                    await cdp().send("Emulation.setEmulatedMedia", {
                        features: reduced
                            ? [{ name: "prefers-reduced-transparency", value: "reduce" }]
                            : [],
                    });
                    await story.run();
                    expect(story.globals.voice).toBe(voice);
                    const html = document.documentElement;
                    expect(html.classList.contains("dark")).toBe(
                        story.globals.voice === "base-dark",
                    );
                    expect(
                        html.classList.contains(
                            story.globals.voice === "biomonitor"
                                ? "voice-biomonitor"
                                : "voice-base",
                        ),
                    ).toBe(true);
                    expect(
                        getComputedStyle(document.body).getPropertyValue("--bg").trim(),
                    ).not.toBe("");
                    if (file.endsWith("/Glass.stories.tsx")) {
                        const glass = document.querySelector(".ds-glass");
                        expect(glass).not.toBeNull();
                        if (!glass) throw new Error("Glass story rendered no material");
                        const opaque =
                            reduced ||
                            story.globals.transparency === "reduced" ||
                            Boolean(glass.closest('[data-glass="off"]'));
                        expect(getComputedStyle(glass).backdropFilter === "none").toBe(opaque);
                        expect(matchMedia("(prefers-reduced-transparency: reduce)").matches).toBe(
                            reduced,
                        );
                    }
                });
            }
        }
    });
}
