/**
 * Hold every token file in the package to tokens/schema.json.
 *
 * The same three validators the test suite calls, run as a standalone command
 * so that `bun run check` fails on a token file even when the reason a voice
 * broke is not something a test file happened to name — and so a consumer or a
 * reviewer can ask the question without running vitest.
 */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
    loadPackageSchema,
    type Violation,
    validateScales,
    validateTailwindMapping,
    validateVoice,
} from "../src/lint/schema.js";

const root = fileURLToPath(new URL("..", import.meta.url).href);
const schema = loadPackageSchema();

const EXPLANATION: Record<Violation["code"], string> = {
    missing: "required by tokens/schema.json but never declared",
    unknown: "declared but not in tokens/schema.json (add it there, or remove it)",
    type: "value does not match the type tokens/schema.json gives this token",
};

let failed = 0;

function report(file: string, violations: Violation[]): void {
    if (violations.length === 0) {
        console.log(`  ok    ${file}`);
        return;
    }
    failed += violations.length;
    console.log(`  FAIL  ${file}`);
    for (const violation of violations)
        console.log(
            `          --${violation.token} in ${violation.where}: ${EXPLANATION[violation.code]}`,
        );
}

console.log("==> validating token files against tokens/schema.json");
report(
    "tokens/scales.css",
    validateScales(readFileSync(`${root}tokens/scales.css`, "utf8"), schema),
);
report(
    "tailwind.css",
    validateTailwindMapping(readFileSync(`${root}tailwind.css`, "utf8"), schema),
);

const voices = readdirSync(`${root}voices`)
    .filter((name) => name.endsWith(".css"))
    .sort();
if (voices.length === 0) {
    console.error("::error::voices/ contains no .css file — the schema is satisfied by nothing.");
    failed += 1;
}
for (const voice of voices)
    report(
        `voices/${voice}`,
        validateVoice(readFileSync(`${root}voices/${voice}`, "utf8"), schema),
    );

/* `process.exitCode`, not `process.exit()`, for the reason spelled out in
 * bin/design-lint.js: a pending write to a pipe is discarded when the process
 * is torn down, and this tool prints one line per violation. */
if (failed > 0) {
    console.error(`::error::${failed} token violation(s). See AGENTS.md > "Adding a voice".`);
    process.exitCode = 1;
} else {
    console.log(`==> ${voices.length} voice(s) satisfy the schema`);
}
