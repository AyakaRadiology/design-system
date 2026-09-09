import { IconButton } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/IconButton",
    component: IconButton,
    args: {
        "aria-label": "ANGLE SOURCE settings",
        children: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
                aria-hidden="true"
            >
                <path d="M4 7h16M4 17h16M8 4v6M16 14v6" />
            </svg>
        ),
    },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Secondary: Story = {};
export const Primary: Story = { args: { variant: "primary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = {
    args: { variant: "danger", "aria-label": "Disconnect ANGLE SOURCE" },
};
export const Disabled: Story = { args: { disabled: true } };
