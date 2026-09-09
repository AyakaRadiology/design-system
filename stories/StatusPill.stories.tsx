import { StatusPill } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/StatusPill",
    component: StatusPill,
    args: { status: "success", children: "ANGLE · live" },
} satisfies Meta<typeof StatusPill>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Healthy: Story = { args: { status: "success", children: "ANGLE · healthy" } };
export const Live: Story = { args: { status: "success", children: "ANGLE · live" } };
export const Degraded: Story = { args: { status: "warning", children: "ANGLE · degraded" } };
export const Stale: Story = { args: { status: "warning", children: "ANGLE · stale" } };
export const Lost: Story = { args: { status: "warning", children: "ANGLE · lost" } };
export const ErrorState: Story = { args: { status: "danger", children: "ANGLE · error" } };
export const Invalid: Story = { args: { status: "danger", children: "ANGLE · invalid" } };
export const Offline: Story = { args: { status: "danger", children: "ANGLE · offline" } };
export const Connecting: Story = { args: { status: "info", children: "ANGLE · connecting" } };
export const Unknown: Story = { args: { status: "neutral", children: "ANGLE · unknown" } };
export const Loading: Story = { args: { status: "neutral", children: "ANGLE · loading" } };
export const Detail: Story = {
    args: {
        status: "warning",
        children: "ANGLE · stale",
        detail: "Last angle sample is stale; reconnect the angle source.",
    },
};
