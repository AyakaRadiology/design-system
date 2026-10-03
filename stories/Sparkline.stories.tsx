import { Sparkline } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/Sparkline",
    component: Sparkline,
    args: { points: [4, 6, 5, 9, 8, 12, 10, 14], label: "Frame time, last 8 samples" },
    decorators: [
        (Story) => (
            <div className="w-48 text-text">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Sparkline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Single: Story = {};
export const WithComparison: Story = {
    args: { comparison: [5, 5, 6, 7, 7, 8, 9, 9], label: "This run against the last run" },
};
export const FixedDomain: Story = { args: { domain: [0, 100], points: [10, 20, 15, 30] } };
