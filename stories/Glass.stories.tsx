import { Glass, Numeric, StatusPill } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/Glass",
    component: Glass,
    args: {
        role: "region",
        "aria-label": "ANGLE readout",
        className: "p-4 space-y-2",
        children: (
            <>
                <p>LIVE ANGLE</p>
                <Numeric value={42.5} unit="°" precision={1} />
                <p>
                    <StatusPill status="success">ANGLE · live</StatusPill>
                </p>
            </>
        ),
    },
} satisfies Meta<typeof Glass>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Normal: Story = {};
export const Strong: Story = { args: { "data-glass": "strong" } };
export const Opaque: Story = { args: { "data-glass": "off" } };
export const ReducedTransparency: Story = {
    globals: { transparency: "reduced" },
    args: { "data-glass": "strong" },
};
export const SystemReducedTransparency: Story = {
    parameters: {
        reducedTransparency: true,
        docs: {
            description: {
                story: "The browser smoke emulates prefers-reduced-transparency: reduce. In the interactive catalogue, use your OS preference or the transparency toolbar.",
            },
        },
    },
};
export const AncestorOptOut: Story = {
    args: { "data-glass": "strong" },
    decorators: [
        (Story) => (
            <div data-glass="off">
                <Story />
            </div>
        ),
    ],
};
export const DescendantCannotOptIn: Story = {
    args: { "data-glass": "on" },
    decorators: [
        (Story) => (
            <div data-glass="off">
                <Story />
            </div>
        ),
    ],
};
