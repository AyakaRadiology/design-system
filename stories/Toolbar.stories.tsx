import { Button, StatusPill, Toolbar } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/Toolbar",
    component: Toolbar,
    args: {
        "aria-label": "Controls",
        children: (
            <>
                <StatusPill status="success">ANGLE · live</StatusPill>
                <Button>ANGLE SOURCE settings</Button>
            </>
        ),
    },
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Controls: Story = {};
export const Offline: Story = {
    args: {
        children: (
            <>
                <StatusPill status="danger">ANGLE · offline</StatusPill>
                <Button>Connect ANGLE SOURCE</Button>
            </>
        ),
    },
};
