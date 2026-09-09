import { Input } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/Input",
    component: Input,
    args: { "aria-label": "Target angle in degrees", defaultValue: "60.0" },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Angle: Story = {};
export const Empty: Story = { args: { defaultValue: "", placeholder: "Target angle (°)" } };
export const Invalid: Story = { args: { defaultValue: "95", "aria-invalid": true } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
