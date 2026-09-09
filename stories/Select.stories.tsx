import { Select } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { expect, userEvent, within } from "storybook/test";

const meta = {
    title: "Components/Select",
    component: Select,
    args: {
        "aria-label": "ANGLE SOURCE",
        options: [
            { value: "live", label: "ANGLE SOURCE · live" },
            { value: "mock", label: "ANGLE SOURCE · mock" },
        ],
        placeholder: "Select ANGLE SOURCE",
    },
    render: function Controlled(args) {
        const [value, setValue] = useState(args.value);
        useEffect(() => setValue(args.value), [args.value]);
        return <Select {...args} value={value} onValueChange={setValue} />;
    },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const Live: Story = {
    args: { value: "live" },
    play: async ({ canvasElement }) => {
        const trigger = within(canvasElement).getByRole("combobox", { name: "ANGLE SOURCE" });
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(trigger);
        await userEvent.click(await body.findByRole("option", { name: "ANGLE SOURCE · mock" }));
        await expect(trigger).toHaveTextContent("ANGLE SOURCE · mock");
        await userEvent.click(trigger);
        await userEvent.click(await body.findByRole("option", { name: "ANGLE SOURCE · live" }));
        await expect(trigger).toHaveTextContent("ANGLE SOURCE · live");
    },
};
export const Disabled: Story = { args: { value: "mock", disabled: true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
