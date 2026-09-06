import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
    loadPackageSchema,
    SCALE_ROLES,
    VOICE_ROLES,
    validateScales,
    validateTailwindMapping,
    validateVoice,
} from "./schema.js";

const schema = loadPackageSchema();
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

/* A fixture is built FROM the schema rather than pasted, so that adding a token
 * cannot leave these cases quietly testing an old token set. Each case then
 * perturbs one thing — a token removed, a name the schema does not know — and
 * asserts exactly that violation, which is only meaningful if the unperturbed
 * fixture is clean. `voiceFixture()` with no options is that control. */
const SAMPLE: Record<string, string> = {
    color: "oklch(0.5 0.1 200)",
    font: "Inter, sans-serif",
    length: "1rem",
    integer: "10",
    duration: "120ms",
    easing: "cubic-bezier(0.2, 0, 0, 1)",
    shadow: "color-mix(in oklab, var(--accent) 45%, transparent)",
};

function declarations(
    roles: ReadonlySet<string>,
    options: { omit?: string[]; colorOnly?: boolean },
) {
    return Object.entries(schema.tokens)
        .filter(([name, spec]) => {
            if (!roles.has(spec.role)) return false;
            if (!spec.required) return false;
            if (options.colorOnly && spec.type !== "color") return false;
            return !options.omit?.includes(name);
        })
        .map(([name, spec]) => `  --${name}: ${SAMPLE[spec.type]};`)
        .join("\n");
}

function voiceFixture(
    options: { omit?: string[]; omitFromDark?: string[]; extra?: string; dark?: boolean } = {},
) {
    const root = `:root {\n${declarations(VOICE_ROLES, { omit: options.omit })}\n${options.extra ?? ""}}`;
    if (!options.dark) return root;
    const dark = `.dark {\n${declarations(VOICE_ROLES, { omit: options.omitFromDark, colorOnly: true })}\n}`;
    return `${root}\n${dark}`;
}

function scalesFixture(omit: string[] = []) {
    return `:root {\n${declarations(SCALE_ROLES, { omit })}\n}`;
}

describe("validateVoice", () => {
    it("passes the base voice", () => {
        expect(validateVoice(read("voices/base.css"), schema)).toEqual([]);
    });

    it("passes the biomonitor voice", () => {
        expect(validateVoice(read("voices/biomonitor.css"), schema)).toEqual([]);
    });

    it("passes a fixture that declares every required voice token", () => {
        expect(validateVoice(voiceFixture(), schema)).toEqual([]);
    });

    it("reports a required token the voice never declares", () => {
        expect(validateVoice(voiceFixture({ omit: ["accent"] }), schema)).toEqual([
            { code: "missing", token: "accent", where: ":root" },
        ]);
    });

    it("reports a custom property the schema does not know", () => {
        expect(
            validateVoice(voiceFixture({ extra: "  --brand: oklch(0.5 0.1 200);\n" }), schema),
        ).toEqual([{ code: "unknown", token: "brand", where: ":root" }]);
    });

    it("reports a colour token missing from a voice's dark block", () => {
        expect(validateVoice(voiceFixture({ dark: true, omitFromDark: ["bg"] }), schema)).toEqual([
            { code: "missing", token: "bg", where: ".dark" },
        ]);
    });

    it("passes a light+dark fixture whose dark block is complete", () => {
        expect(validateVoice(voiceFixture({ dark: true }), schema)).toEqual([]);
    });

    it("reports a token whose value does not match its declared type", () => {
        expect(validateVoice(voiceFixture({ extra: "  --z-modal: 1000;\n" }), schema)).toEqual([]);
        expect(
            validateVoice(
                `:root {\n${declarations(VOICE_ROLES, {}).replace("--bg: oklch(0.5 0.1 200);", "--bg: 12px;")}\n}`,
                schema,
            ),
        ).toEqual([{ code: "type", token: "bg", where: ":root" }]);
    });
});

describe("validateScales", () => {
    it("passes tokens/scales.css", () => {
        expect(validateScales(read("tokens/scales.css"), schema)).toEqual([]);
    });

    it("reports a scale token the file never declares", () => {
        expect(validateScales(scalesFixture(["z-modal"]), schema)).toEqual([
            { code: "missing", token: "z-modal", where: ":root" },
        ]);
    });
});

describe("validateTailwindMapping", () => {
    /* A colour token with no `--color-*` line generates no utility, so a
     * component cannot reach it without writing the literal the whole gate
     * exists to reject. AGENTS.md tells a promoter to add the line; this is
     * what makes forgetting a red build rather than a silent hole. */
    it("passes tailwind.css", () => {
        expect(validateTailwindMapping(read("tailwind.css"), schema)).toEqual([]);
    });

    it("reports a colour token with no utility mapping", () => {
        expect(
            validateTailwindMapping("@theme inline {\n  --color-bg: var(--bg);\n}", schema).length,
        ).toBeGreaterThan(0);
        expect(
            validateTailwindMapping("@theme inline {\n  --color-bg: var(--bg);\n}", schema),
        ).toContainEqual({
            code: "missing",
            token: "accent",
            where: "@theme inline",
        });
    });
});
