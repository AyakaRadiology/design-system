import { RadioGroup } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
    title: "Components/RadioGroup",
    component: RadioGroup,
    args: {
        "aria-label": "ANGLE SOURCE",
        options: [
            { value: "live", label: "ANGLE SOURCE · live" },
            { value: "mock", label: "ANGLE SOURCE · mock" },
            { value: "offline", label: "ANGLE SOURCE · offline", disabled: true },
        ],
        defaultValue: "live",
    },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Vertical: Story = {};
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const Empty: Story = { args: { defaultValue: undefined } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { "aria-invalid": true, required: true } };
export const RightToLeft: Story = { args: { orientation: "horizontal", dir: "rtl" } };
export const NoLoop: Story = { args: { loop: false } };
export const KeyboardSelection: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const live = canvas.getByRole("radio", { name: "ANGLE SOURCE · live" });
        const mock = canvas.getByRole("radio", { name: "ANGLE SOURCE · mock" });
        live.focus();
        await userEvent.keyboard("{ArrowDown}");
        await expect(mock).toHaveFocus();
        await expect(mock).toBeChecked();
        await userEvent.keyboard("{ArrowDown}");
        await expect(live).toHaveFocus();
        await expect(live).toBeChecked();
        await userEvent.keyboard("{Enter}");
        await expect(live).toBeChecked();
    },
};
