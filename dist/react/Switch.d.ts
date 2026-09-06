export interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    id?: string;
    name?: string;
    disabled?: boolean;
    "aria-describedby"?: string;
    /**
     * The control's accessible name, when there is no visible caption to point
     * at. A switch is a shape, not a word: without a name it announces only
     * its state.
     */
    "aria-label"?: string;
    /**
     * The id of a caption that is already on screen. Prefer this over
     * `aria-label` when the words exist: two sources for one name drift, and
     * the visible one is the one that gets corrected.
     */
    "aria-labelledby"?: string;
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
