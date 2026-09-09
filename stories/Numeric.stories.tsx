import { Numeric } from "@ayaka/design-system/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const meta = {
    title: "Components/Numeric",
    component: Numeric,
    args: { value: 42.5, unit: "°", precision: 1, reservedChars: 6 },
} satisfies Meta<typeof Numeric>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Angle: Story = {};
export const Millimetres: Story = { args: { value: 90, unit: "mm" } };
export const Zero: Story = { args: { value: 0 } };
export const Signed: Story = { args: { value: -12.5 } };
export const Integer: Story = { args: { precision: 0 } };
export const NoUnit: Story = { args: { unit: undefined } };
export const Empty: Story = {
    args: { value: null, unit: "mm" },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText("No value")).toBeInTheDocument();
        await expect(canvasElement.querySelector('[data-slot="unit"]')).toBeNull();
    },
};
export const EmptyWithUnit: Story = { args: { value: null, unit: "mm", showUnitWhenEmpty: true } };
export const EmptyReservedUnit: Story = {
    args: { value: null, unit: "mm", reserveUnitSlotWhenEmpty: true, reservedUnitChars: 3 },
};
export const EmptyVisibleReservedUnit: Story = {
    args: {
        value: null,
        unit: "mm",
        reserveUnitSlotWhenEmpty: true,
        showUnitWhenEmpty: true,
        reservedUnitChars: 3,
    },
};
export const EmptyStart: Story = {
    args: { value: null, emptyAlign: "start", className: "text-xl" },
};
export const EmptyCenter: Story = {
    args: { value: null, emptyAlign: "center", className: "text-xl" },
};
export const ChangingUnits: Story = {
    render: () => (
        <div className="space-y-2">
            <Numeric value={125} unit="ms" reservedUnitChars={3} />
            <br />
            <Numeric value={1.5} unit="s" precision={1} reservedUnitChars={3} />
            <br />
            <Numeric value={2} unit="min" reservedUnitChars={3} />
        </div>
    ),
};
export const UppercaseLabel: Story = {
    render: () => (
        <div className="uppercase">
            DEPTH <Numeric value={90} unit="mm" precision={1} />
        </div>
    ),
};
export const Preformatted: Story = {
    render: () => (
        <div className="space-x-4">
            <Numeric unit="°">42.5</Numeric>
            <Numeric unit="%">42</Numeric>
            <Numeric unit="mm">90</Numeric>
        </div>
    ),
};
export const SeparatorOverrides: Story = {
    render: () => (
        <div className="space-x-4">
            <Numeric unit="°" unitSeparator="space">
                42.5
            </Numeric>
            <Numeric unit="mm" unitSeparator="none">
                12.5
            </Numeric>
            <Numeric unit={<abbr title="millimetres">mm</abbr>}>90</Numeric>
        </div>
    ),
};
