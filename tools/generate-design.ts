/** Project the house system into Impeccable context; never curate a second palette. */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectCustomProperties } from "../src/lint/css.js";
import { parseSchema, validateScales, validateVoice } from "../src/lint/schema.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const VOICE = "biomonitor";
const require = createRequire(import.meta.url);

export function generateDesign(root = ROOT): string {
    const read = (path: string) => readFileSync(resolve(root, path), "utf8");
    const schema = parseSchema(JSON.parse(read("tokens/schema.json")));
    const scales = read("tokens/scales.css");
    const voice = read(`voices/${VOICE}.css`);
    const violations = [...validateScales(scales, schema), ...validateVoice(voice, schema)];
    if (violations.length) throw new Error(`Invalid design sources: ${JSON.stringify(violations)}`);
    const declarations = collectCustomProperties(`${scales}\n${voice}`);
    const globalValue = (name: string): string => {
        const values = declarations
            .get(name)
            ?.filter((d) => [":root", "@theme"].includes(d.selector));
        const value = values?.at(-1);
        if (!value) throw new Error(`Missing global token --${name}`);
        return value.value.replace(/\s+/gu, " ");
    };
    // Spacing and control radii belong to Tailwind, not tokens/schema.json.
    // Read the installed, lockfile-pinned theme and the existing allowed scale.
    const theme = collectCustomProperties(
        readFileSync(require.resolve("tailwindcss/theme.css"), "utf8"),
    );
    const themeValue = (name: string): string => {
        const values = theme.get(name);
        const value = values?.[0];
        if (values?.length !== 1 || !value) throw new Error(`Expected one Tailwind --${name}`);
        return value.value;
    };
    const rules = read("docs/ui-rules.md");
    const spacingRule = rules.match(/^- Spacing .*$/mu)?.[0];
    const radiusRule = rules.match(/^- Radii: .*$/mu)?.[0];
    const steps = spacingRule?.match(/Carbon steps only — `([\d., ]+)`/u)?.[1];
    if (!spacingRule || !radiusRule || !steps)
        throw new Error("Cannot read house spacing/radius rules");
    const spacing: [string, string][] = steps
        .split(", ")
        .map((step) => [step, `calc(${themeValue("spacing")} * ${step})`]);
    const radiusNames = [...radiusRule.matchAll(/`rounded-([a-z]+)`/gu)].map((match) => {
        const name = match[1];
        if (!name) throw new Error("Missing radius utility name");
        return name;
    });
    if (!radiusNames.length) throw new Error("No house radius utilities found");
    const radii: [string, string][] = radiusNames
        .filter((name) => name !== "full")
        .map((name) => [name, themeValue(`radius-${name}`)]);
    radii.push(["glass", globalValue("x-glass-radius")]);
    const entries = Object.entries(schema.tokens);
    const colors = entries.filter(([, spec]) => spec.type === "color" && spec.required);
    const typeSteps = entries.filter(
        ([name, spec]) => spec.role === "type" && /^text-[^-]+$/u.test(name),
    );
    const yaml = (pairs: string[][]) =>
        pairs
            .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)}`)
            .join("\n");
    const cell = (value: string) => value.replace(/\|/gu, "\\|").replace(/\s+/gu, " ");
    const table = (rows: string[][]) =>
        [
            "| Token | Value | Role / purpose |",
            "| --- | --- | --- |",
            ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
        ].join("\n");
    const tokenRows = (selected: typeof entries) =>
        selected.map(([name, spec]) => {
            const values = declarations.get(name);
            if (!values?.length) throw new Error(`Undocumented token --${name}: no declaration`);
            return [
                `\`--${name}\``,
                values.map((d) => `\`${cell(d.value)}\` (${d.selector})`).join("; "),
                `${spec.role}: ${spec.doc}`,
            ];
        });
    const voiceRules = read(`voices/${VOICE}/VOICE.md`);
    return [
        "---",
        `name: "@ayaka/design-system — ${VOICE}"`,
        'description: "Generated house tokens for needle instrument reviews"',
        "colors:",
        yaml(colors.map(([name]) => [name, globalValue(name)])),
        "typography:",
        ...typeSteps.map(([name]) =>
            [
                `  ${name}:`,
                `    fontFamily: ${JSON.stringify(globalValue("font-sans"))}`,
                `    fontSize: ${JSON.stringify(globalValue(name))}`,
                `    lineHeight: ${JSON.stringify(globalValue(`${name}--line-height`))}`,
            ].join("\n"),
        ),
        "rounded:",
        yaml(radii),
        "spacing:",
        yaml(spacing),
        "---",
        "",
        "<!-- GENERATED by tools/generate-design.ts. Run bun run design:generate; do not edit. -->",
        "# Design System: @ayaka/design-system",
        "",
        "## Overview",
        "",
        "This projection selects biomonitor for the needle instrument context. The package also ships base (light/dark); this does not change its defaults.",
        "Sources: [schema](tokens/schema.json), [voice](voices/biomonitor.css), [scales](tokens/scales.css), [UI rules](docs/ui-rules.md), and the lockfile-pinned Tailwind theme.",
        "Review within [PRODUCT.md](PRODUCT.md), [AGENTS.md](AGENTS.md), and these sources. House roles and material rules outrank generic detector suggestions.",
        "Change sources, then regenerate. DESIGN.md is a projection, never an input to token generation.",
        "",
        "## Colors",
        "",
        table(tokenRows(entries.filter(([, spec]) => spec.type === "color"))),
        "",
        "## Typography",
        "",
        table(tokenRows(entries.filter(([, spec]) => ["font", "type"].includes(spec.role)))),
        "",
        "## Layout",
        "",
        spacingRule,
        "",
        table(
            spacing.map(([step, value]) => [
                `spacing-${step}`,
                `\`${value}\``,
                "House spacing step; Tailwind spacing unit",
            ]),
        ),
        "",
        "## Elevation & Depth",
        "",
        table(
            tokenRows(
                entries.filter(([, spec]) => ["z", "motion", "signature"].includes(spec.role)),
            ),
        ),
        "",
        "### Floating Glass",
        "",
        "Use the shared [Glass material](docs/glass.md), including its opaque/reduced-transparency behavior. These tokens are schema-owned despite their historical x- prefix; they are not consumer extensions.",
        "",
        table(tokenRows(entries.filter(([name]) => name.startsWith("x-glass-")))),
        "",
        "## Shapes",
        "",
        radiusRule,
        "",
        table(
            radii.map(([name, value]) => [
                name,
                `\`${value}\``,
                name === "glass" ? "Shared floating surface" : "House Tailwind radius",
            ]),
        ),
        "",
        "## Components",
        "",
        "Use the exported [React primitives and their contracts](README.md#primitives). Domain components belong in consumer repositories; do not replace shared controls with local lookalikes.",
        "",
        "## Do's and Don'ts",
        "",
        "The active voice's rules below are copied from voices/biomonitor/VOICE.md on every generation. The shared density and scale rules remain binding: [docs/ui-rules.md](docs/ui-rules.md).",
        "",
        voiceRules.trim().replace(/^# /gmu, "### ").replace(/^## /gmu, "#### "),
        "",
    ].join("\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 1 || args[0] !== "--check")) {
        throw new Error("Usage: bun tools/generate-design.ts [--check]");
    }
    const generated = generateDesign();
    const output = resolve(ROOT, "DESIGN.md");
    if (args[0] === "--check") {
        if (readFileSync(output, "utf8") !== generated) {
            throw new Error(
                "DESIGN.md is stale. Run bun run design:generate and commit the result.",
            );
        }
        console.log("Design context freshness PASS: DESIGN.md matches its sources");
    } else {
        writeFileSync(output, generated);
        console.log("Generated DESIGN.md from house sources");
    }
}
