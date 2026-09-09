import { Button, Tooltip } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
    title: "Components/Tooltip",
    component: Tooltip,
    args: {
        content: "Angle measured from the horizontal plane.",
        children: <Button>TARGET ANGLE</Button>,
    },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Top: Story = {};
export const Right: Story = { args: { side: "right" } };
export const Bottom: Story = { args: { side: "bottom" } };
export const Left: Story = { args: { side: "left" } };
export const KeyboardFocus: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.tab();
        await expect(
            within(canvasElement).getByRole("button", { name: "TARGET ANGLE" }),
        ).toHaveFocus();
        await expect(
            await within(canvasElement.ownerDocument.body).findByRole("tooltip"),
        ).toHaveTextContent("Angle measured from the horizontal plane.");
    },
};
