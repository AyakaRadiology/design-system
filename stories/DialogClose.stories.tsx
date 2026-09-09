import {
    Button,
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogTrigger,
} from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
    title: "Components/DialogClose",
    component: DialogClose,
    args: { asChild: true, children: <Button>Close settings</Button> },
    render: (args) => (
        <Dialog>
            <DialogTrigger asChild>
                <Button>ANGLE SOURCE settings</Button>
            </DialogTrigger>
            <DialogContent title="ANGLE SOURCE" actions={<DialogClose {...args} />}>
                <DialogBody>Review the angle source before applying the plan.</DialogBody>
            </DialogContent>
        </Dialog>
    ),
} satisfies Meta<typeof DialogClose>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AsButton: Story = {
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const trigger = within(canvasElement).getByRole("button", {
            name: "ANGLE SOURCE settings",
        });
        await userEvent.click(trigger);
        await userEvent.click(body.getByRole("button", { name: "Close settings" }));
        await expect(body.queryByRole("dialog")).toBeNull();
        await expect(trigger).toHaveFocus();
    },
};
