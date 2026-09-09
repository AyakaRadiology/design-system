import { Field, Input } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/Field",
    component: Field,
    args: { label: "TARGET ANGLE (°)", children: <Input defaultValue="60.0" /> },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Label: Story = {};
export const Hint: Story = { args: { hint: "Angle from the horizontal plane." } };
export const ErrorState: Story = {
    args: {
        hint: "Use degrees.",
        error: "Target angle must be between 0° and 90°.",
        children: <Input defaultValue="95" />,
    },
};
export const NoError: Story = { args: { error: false } };
export const CasePreserving: Story = { args: { label: "Plan θ (°)" } };
