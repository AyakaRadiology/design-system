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
    title: "Components/DialogBody",
    component: DialogBody,
    args: {
        children: (
            <p>
                LIVE ANGLE <Numeric value={42.5} unit="°" precision={1} />
            </p>
        ),
    },
    render: (args) => (
        <Dialog defaultOpen>
            <DialogTrigger asChild>
                <Button>ANGLE SOURCE settings</Button>
            </DialogTrigger>
            <DialogContent
                title="ANGLE SOURCE"
                description="Review recorded mock angle samples."
                actions={
                    <DialogClose asChild>
                        <Button>Close settings</Button>
                    </DialogClose>
                }
            >
                <DialogBody {...args} />
            </DialogContent>
        </Dialog>
    ),
} satisfies Meta<typeof DialogBody>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Short: Story = {};
export const Scrolling: Story = {
    render: (args) => {
        const SAMPLE_COUNT = 24;
        const samples = Array.from({ length: SAMPLE_COUNT }, (_, index) => ({
            sequence: index + 1,
            angle: 42.5,
        }));
        return (
            <Dialog defaultOpen>
                <DialogTrigger asChild>
                    <Button>ANGLE SOURCE settings</Button>
                </DialogTrigger>
                <DialogContent
                    title="ANGLE SOURCE"
                    description="Review recorded mock angle samples."
                    actions={
                        <DialogClose asChild>
                            <Button>Close settings</Button>
                        </DialogClose>
                    }
                >
                    <DialogBody {...args} className="space-y-4">
                        {samples.map((sample) => (
                            <p key={sample.sequence}>
                                ANGLE sample {sample.sequence}:{" "}
                                <Numeric value={sample.angle} unit="°" precision={1} /> · mock
                                source
                            </p>
                        ))}
                    </DialogBody>
                </DialogContent>
            </Dialog>
        );
    },
};
