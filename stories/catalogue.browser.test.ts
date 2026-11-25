import {
    composeStories,
    composeStory,
    type Meta,
    type StoryObj,
    setProjectAnnotations,
} from "@storybook/react-vite";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { cdp, page } from "vitest/browser";
import preview from "../.storybook/preview.js";
import selectMeta from "./Select.stories.js";

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

test("Select can wheel to and click the last protocol in a short window", async ({
    onTestFinished,
}) => {
    const protocolPicker = composeStory(
        {
            args: {
                "aria-label": "Protocol",
                placeholder: "Choose a protocol",
                options: Array.from({ length: 30 }, (_, i) => ({
                    value: String(i + 1),
                    label: `Protocol ${i + 1}`,
                })),
            },
        },
        selectMeta,
    );
    const { innerWidth, innerHeight } = window;
    onTestFinished(() => page.viewport(innerWidth, innerHeight));
    await page.viewport(800, 600);
    await protocolPicker.run();
    const trigger = page.getByRole("combobox", { name: "Protocol" });
    await trigger.click();
    const first = page.getByRole("option", { name: "Protocol 1", exact: true });
    const last = page.getByRole("option", { name: "Protocol 30", exact: true });
    await expect.element(first).toBeInViewport();
    await expect.element(last).not.toBeInViewport();
    await first.wheel({ delta: { y: 1000 } });
    await expect.element(last).toBeInViewport({ ratio: 1 });
    await last.click();
    await expect.element(trigger).toHaveTextContent("Protocol 30");
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
