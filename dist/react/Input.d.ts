import type { InputHTMLAttributes } from "react";
export type InputProps = InputHTMLAttributes<HTMLInputElement>;
/**
 * A single-line text control at the standard control height.
 *
 * `aria-invalid:border-danger` rather than an `invalid` prop: Field already
 * sets `aria-invalid` when it has an error to show, so the border follows the
 * accessible state instead of a second prop that could disagree with it.
 */
export declare function Input({ className, ...props }: InputProps): import("react").JSX.Element;
