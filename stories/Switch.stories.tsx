import { Switch } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

const meta = {
    title: "Components/Switch",
    component: Switch,
    args: { "aria-label": "Show needle trajectory" },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Off: Story = {};
export const On: Story = {
    args: { defaultChecked: true },
    play: async ({ canvasElement }) => {
        const toggle = within(canvasElement).getByRole("switch", {
            name: "Show needle trajectory",
        });
        await expect(toggle).toBeChecked();
        await userEvent.click(toggle);
        await expect(toggle).not.toBeChecked();
        toggle.focus();
        await userEvent.keyboard(" ");
        await expect(toggle).toBeChecked();
    },
};
export const DisabledOff: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { defaultChecked: true, disabled: true } };
