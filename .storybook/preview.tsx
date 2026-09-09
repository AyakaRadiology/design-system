import type { Preview } from "@storybook/react-vite";
import { type ReactNode, useLayoutEffect } from "react";
import { TooltipProvider } from "../src/react/Tooltip.js";
import baseCss from "./base.css?inline";
import biomonitorCss from "./biomonitor.css?inline";

const DOCS_STORY_HEIGHT = "400px";

function Environment({
    voice,
    transparency,
    children,
}: {
    voice: string;
    transparency: string;
    children: ReactNode;
}) {
    useLayoutEffect(() => {
        const html = document.documentElement;
        html.classList.toggle("dark", voice === "base-dark");
        html.classList.toggle("voice-base", voice !== "biomonitor");
        html.classList.toggle("voice-biomonitor", voice === "biomonitor");
        if (transparency === "reduced") html.dataset.glass = "off";
        else delete html.dataset.glass;
    }, [voice, transparency]);
    return (
        <TooltipProvider>
            <style>{voice === "biomonitor" ? biomonitorCss : baseCss}</style>
            <div className="p-4 text-sm text-text">{children}</div>
        </TooltipProvider>
    );
}

const preview: Preview = {
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        controls: { expanded: true },
        // Each docs example owns its html voice/transparency state and portals.
        // Inline examples would let one opaque Glass story retone its siblings.
        docs: { story: { inline: false, height: DOCS_STORY_HEIGHT } },
        options: { storySort: { method: "alphabetical" } },
    },
    globalTypes: {
        voice: {
            description: "The actual package voice, applied to html (including portals)",
            toolbar: {
                icon: "paintbrush",
                dynamicTitle: true,
                items: [
                    { value: "base-light", title: "Base / light" },
                    { value: "base-dark", title: "Base / dark" },
                    { value: "biomonitor", title: "Biomonitor / dark" },
                ],
            },
        },
        transparency: {
            description: "Manual equivalent of reduced transparency, including portals",
            toolbar: {
                icon: "circlehollow",
                dynamicTitle: true,
                items: [
                    { value: "normal", title: "Transparency / normal" },
                    { value: "reduced", title: "Transparency / reduced" },
                ],
            },
        },
    },
    initialGlobals: { voice: "biomonitor", transparency: "normal" },
    decorators: [
        (Story, context) => (
            <Environment voice={context.globals.voice} transparency={context.globals.transparency}>
                <Story />
            </Environment>
        ),
    ],
};
export default preview;
