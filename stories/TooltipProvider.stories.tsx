import { Button, Tooltip, TooltipProvider } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/TooltipProvider",
    component: TooltipProvider,
    args: {
        children: (
            <div className="flex gap-2">
                <Tooltip content="Angle measured from horizontal.">
                    <Button>TARGET ANGLE</Button>
                </Tooltip>
                <Tooltip content="Current angle from the connected source.">
                    <Button>LIVE ANGLE</Button>
                </Tooltip>
            </div>
        ),
    },
} satisfies Meta<typeof TooltipProvider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SharedDelay: Story = {};
export const Immediate: Story = { args: { delayDuration: 0 } };
