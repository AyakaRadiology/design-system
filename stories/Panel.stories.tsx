import { Button, Numeric, Panel } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/Panel",
    component: Panel,
    args: {
        title: "PLAN",
        children: (
            <p>
                TARGET ANGLE <Numeric value={60} unit="°" precision={1} />
            </p>
        ),
    },
} satisfies Meta<typeof Panel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Titled: Story = {};
export const Headerless: Story = { args: { title: undefined } };
export const Actions: Story = { args: { actions: <Button size="sm">Apply plan</Button> } };
export const ActionsOnly: Story = {
    args: { title: undefined, actions: <Button size="sm">Reset view</Button> },
};
