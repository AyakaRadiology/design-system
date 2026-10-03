import { MiniBars } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/MiniBars",
    component: MiniBars,
    args: { values: [3, 5, 2, 8, 6, 9, 4, 7] },
    decorators: [
        (Story) => (
            <div className="w-40">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof MiniBars>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Series: Story = {};
export const SecondSeries: Story = { args: { series: "chart-2" } };
export const Status: Story = { args: { series: "danger", values: [0, 0, 1, 4, 9] } };
export const Labelled: Story = {
    args: { values: [2, 4, 3], labels: ["10:00: 2 errors", "11:00: 4 errors", "12:00: 3 errors"] },
};
