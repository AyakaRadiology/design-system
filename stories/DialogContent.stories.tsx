import {
    Button,
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogTrigger,
    Numeric,
} from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
    title: "Components/DialogContent",
    component: DialogContent,
    args: {
        title: "ANGLE SOURCE",
        description: "Review the angle source before applying the plan.",
        children: (
            <DialogBody>
                TARGET ANGLE <Numeric value={60} unit="°" precision={1} />
            </DialogBody>
        ),
        actions: (
            <DialogClose asChild>
                <Button>Close settings</Button>
            </DialogClose>
        ),
    },
    render: (args) => (
        <Dialog defaultOpen>
            <DialogTrigger asChild>
                <Button>ANGLE SOURCE settings</Button>
            </DialogTrigger>
            <DialogContent {...args} />
        </Dialog>
    ),
} satisfies Meta<typeof DialogContent>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithDescription: Story = {};
export const WithoutDescription: Story = { args: { description: undefined } };
