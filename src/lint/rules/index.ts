import type { Rule, RuleId } from "../types.js";
import { L1 } from "./L1-color-literal.js";
import { L2 } from "./L2-inline-style.js";
import { L3 } from "./L3-off-scale.js";
import { L4 } from "./L4-dark-twins.js";
import { L5 } from "./L5-raw-controls.js";
import { L6 } from "./L6-token-hygiene.js";
import { L7 } from "./L7-z-index.js";

export const RULES: Record<RuleId, Rule> = { L1, L2, L3, L4, L5, L6, L7 };
export { L1, L2, L3, L4, L5, L6, L7 };
