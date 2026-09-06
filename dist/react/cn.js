import { extendTailwindMerge } from "tailwind-merge";
/**
 * Class-name joining with Tailwind conflict resolution, so that a caller's
 * `className` beats a primitive's default instead of landing beside it with
 * the winner decided by stylesheet order.
 *
 * `tailwind-merge` only — no clsx. The primitives take variants as props, not
 * as conditional class objects, so the conditional half of clsx would never be
 * exercised and would be a dependency carried for nothing.
 *
 * The one extension is the stacking layers. tailwind-merge reads `z-*` as
 * numbers, so out of the box `cn("z-overlay", "z-modal")` keeps BOTH and the
 * result depends on stylesheet order — which is exactly the ambiguity rule L7
 * exists to remove. Teaching it the four token names makes the later class
 * win, like every other utility here.
 */
const merge = extendTailwindMerge({
    extend: { classGroups: { z: [{ z: ["raised", "overlay", "modal", "toast"] }] } },
});
export function cn(...inputs) {
    return merge(inputs.filter(Boolean).join(" "));
}
