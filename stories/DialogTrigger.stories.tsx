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
    title: "Components/DialogTrigger",
    component: DialogTrigger,
    args: { asChild: true, children: <Button>ANGLE SOURCE settings</Button> },
    render: (args) => (
        <Dialog>
            <DialogTrigger {...args} />
            <DialogContent
                title="ANGLE SOURCE"
                actions={
                    <DialogClose asChild>
                        <Button>Close settings</Button>
                    </DialogClose>
                }
            >
                <DialogBody>Review the angle source before applying the plan.</DialogBody>
            </DialogContent>
        </Dialog>
    ),
} satisfies Meta<typeof DialogTrigger>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AsButton: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.click(
            within(canvasElement).getByRole("button", { name: "ANGLE SOURCE settings" }),
        );
        await expect(
            within(canvasElement.ownerDocument.body).getByRole("dialog", { name: "ANGLE SOURCE" }),
        ).toBeVisible();
    },
};
