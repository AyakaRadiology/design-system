import { Button } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/Button",
    component: Button,
    args: { children: "Apply plan" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Secondary: Story = {};
export const Primary: Story = { args: { variant: "primary" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Reset view" } };
export const Danger: Story = { args: { variant: "danger", children: "Disconnect ANGLE SOURCE" } };
export const Small: Story = { args: { size: "sm" } };
export const Disabled: Story = { args: { disabled: true } };
