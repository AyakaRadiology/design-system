export interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    id?: string;
    name?: string;
    disabled?: boolean;
    "aria-describedby"?: string;
    "aria-label"?: string;
    className?: string;
}
/**
 * An immediate on/off toggle — not a checkbox, which is a value you submit.
 *
 * The travel is arithmetic, not a guess: the track is w-8 (32px) with p-0.5
 * (2px) on each side and a size-3 (12px) knob, so the knob has exactly 16px to
 * cross and `translate-x-4` is 16px. Changing any one of those three means
 * changing the fourth.
 */
export declare function Switch({ className, ...props }: SwitchProps): import("react").JSX.Element;
