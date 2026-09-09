import { BuildStamp } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { expect, userEvent, within } from "storybook/test";

const meta = {
    title: "Components/BuildStamp",
    component: BuildStamp,
    args: {
        name: "needle-guide",
        describe: "61c93b3",
        buildTime: "2026-09-09T04:49:03Z",
    },
} satisfies Meta<typeof BuildStamp>;
export default meta;
type Story = StoryObj<typeof meta>;
export const IsoTime: Story = {};
export const Dirty: Story = { args: { describe: "61c93b3-dirty" } };
export const PreformattedTime: Story = { args: { buildTime: "built 2026-09-09 04:49 UTC" } };
export const FormattedIsoTime: Story = {
    args: { formatBuildTime: (iso) => `built ${iso.replace("T", " ").replace("Z", " UTC")}` },
};
export const Interactive: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        canvas.getByRole("button").focus();
        await userEvent.keyboard("{Enter}");
        await expect(canvas.getByRole("button")).toHaveAttribute("aria-pressed", "true");
        await expect(canvas.getByRole("status")).toHaveTextContent(
            "61c93b3fb94870fda560b4e40fbc1007569ff3dd",
        );
    },
    render: function InteractiveStamp(args) {
        const [pinned, setPinned] = useState(false);
        return (
            <div className="space-y-2">
                <BuildStamp {...args} onClick={() => setPinned(!pinned)} aria-pressed={pinned} />
                <p role="status">
                    {pinned
                        ? "61c93b3fb94870fda560b4e40fbc1007569ff3dd"
                        : "Activate the build stamp to pin the revision."}
                </p>
            </div>
        );
    },
};
