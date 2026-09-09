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
    title: "Components/Dialog",
    component: Dialog,
    args: {
        defaultOpen: false,
        children: (
            <>
                <DialogTrigger asChild>
                    <Button>ANGLE SOURCE settings</Button>
                </DialogTrigger>
                <DialogContent
                    title="ANGLE SOURCE"
                    description="Review the angle source before applying the plan."
                    actions={
                        <DialogClose asChild>
                            <Button>Close settings</Button>
                        </DialogClose>
                    }
                >
                    <DialogBody>
                        TARGET ANGLE <Numeric value={60} unit="°" precision={1} />
                    </DialogBody>
                </DialogContent>
            </>
        ),
    },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Closed: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
