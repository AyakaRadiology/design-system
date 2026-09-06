import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import { loadPackageSchema } from "../schema.js";
import { parseTsx } from "../tsx.js";
import type { RuleContext, RuleFinding, RuleId } from "../types.js";
import { RULES } from "./index.js";

/* Every rule is exercised the way a consumer meets it: a file that should fail
 * and a file that should pass, both real source on disk rather than a string in
 * a test. The fail cases assert the exact LINES, because a rule that fires on
 * the right file for the wrong reason is a rule that will fire on the wrong
 * file tomorrow. */

const fixtures = fileURLToPath(new URL("./__fixtures__/", import.meta.url).href);
const schema = loadPackageSchema();

const context = (themeFile = "src/styles/theme.css"): RuleContext => ({
    themeFile,
    schemaTokens: new Set(Object.keys(schema.tokens)),
    extensionPrefix: schema.extensionPrefix,
});

function check(rule: RuleId, fixture: string, as = fixture, themeFile?: string): RuleFinding[] {
    const text = readFileSync(`${fixtures}${fixture}`, "utf8");
    const definition = RULES[rule];
    const ctx = context(themeFile);
    if (fixture.endsWith(".css"))
        return definition.checkCss?.(as, postcss.parse(text, { from: as }), ctx) ?? [];
    return definition.checkTsx?.(as, parseTsx(as, text), ctx) ?? [];
}

const lines = (findings: RuleFinding[]) => findings.map((finding) => finding.line);

describe("L1 — colour literal", () => {
    it("catches a hex, a function form and one inside a template", () => {
        expect(lines(check("L1", "L1-color-literal/fail.tsx"))).toEqual([2, 3, 4]);
    });

    it("catches a colour in a CSS declaration value", () => {
        expect(lines(check("L1", "L1-color-literal/fail.css"))).toEqual([2, 3]);
    });

    it("passes tokens, and does not read a numbered string as a hex", () => {
        expect(check("L1", "L1-color-literal/pass.tsx")).toEqual([]);
        expect(check("L1", "L1-color-literal/pass.css")).toEqual([]);
    });

    /* The theme file is where the values legitimately live. */
    it("exempts the theme file", () => {
        expect(
            check(
                "L1",
                "L1-color-literal/fail.css",
                "src/styles/theme.css",
                "src/styles/theme.css",
            ),
        ).toEqual([]);
    });
});

describe("L2 — inline style", () => {
    it("catches a non-geometry key, a variable style and a spread", () => {
        expect(lines(check("L2", "L2-inline-style/fail.tsx"))).toEqual([4, 5, 6, 7]);
    });

    it("passes custom properties and geometry", () => {
        expect(check("L2", "L2-inline-style/pass.tsx")).toEqual([]);
    });

    it("names the offending key", () => {
        const findings = check("L2", "L2-inline-style/fail.tsx");
        expect(findings[0]?.message).toContain("background");
        expect(findings[1]?.message).toContain("padding");
    });
});

describe("L3 — off-scale value", () => {
    it("catches an arbitrary length and the 5/7/9 spacing steps", () => {
        expect(lines(check("L3", "L3-off-scale/fail.tsx"))).toEqual([4, 5, 5, 6]);
    });

    /* Width and max-width utilities are exempt by construction — they are not
     * in the prefix list, because w-96 and max-w-3xl are the sanctioned way to
     * size a container. */
    it("passes scale steps and container widths", () => {
        expect(check("L3", "L3-off-scale/pass.tsx")).toEqual([]);
    });
});

describe("L4 — dark twin", () => {
    it("catches every dark: colour utility", () => {
        expect(lines(check("L4", "L4-dark-twins/fail.tsx"))).toEqual([4, 5, 5]);
    });

    it("leaves a dark: variant that sets no colour alone", () => {
        expect(check("L4", "L4-dark-twins/pass.tsx")).toEqual([]);
    });
});

describe("L5 — raw control", () => {
    it("catches all five intrinsic controls", () => {
        expect(lines(check("L5", "L5-raw-controls/fail.tsx"))).toEqual([4, 5, 6, 7, 8]);
    });

    it("leaves the capitalised primitives alone", () => {
        expect(check("L5", "L5-raw-controls/pass.tsx")).toEqual([]);
    });

    it("names the primitive to use instead", () => {
        expect(check("L5", "L5-raw-controls/fail.tsx")[0]?.message).toContain("Input");
    });
});

describe("L6 — token hygiene", () => {
    it("catches an unprefixed property, a redefined schema token and an --x- collision", () => {
        const findings = check("L6", "L6-token-hygiene/fail.css");
        expect(lines(findings)).toEqual([2, 3, 4, 5]);
        expect(findings[0]?.message).toContain("neither a schema token nor an extension");
        expect(findings[1]?.message).toContain("redefined");
        expect(findings[2]?.message).toContain("duplicates the schema role");
    });

    /* --x-bg-elevated is in the fixture because bg-elevated was added to the
     * schema AFTER this rule was written. Nothing about L6 was touched to make
     * it fire: the collision set is read from tokens/schema.json, so a token
     * promoted tomorrow is protected from being shadowed today. */
    it("flags a role added to the schema after the rule was written", () => {
        const findings = check("L6", "L6-token-hygiene/fail.css");
        const collision = findings.find((finding) => finding.line === 5);
        expect(collision?.message).toContain("--x-bg-elevated duplicates the schema role");
        expect(collision?.message).toContain("bg-elevated");
    });

    /* The example above proves one token. This proves the mechanism: EVERY
     * name in the schema is protected, so nobody has to remember to extend a
     * list when they add a role. */
    it("protects every schema role from being shadowed by an --x- name", () => {
        for (const token of Object.keys(schema.tokens)) {
            const css = `.probe { --${schema.extensionPrefix}${token}: 0; }`;
            const findings =
                RULES.L6.checkCss?.(
                    "src/app.css",
                    postcss.parse(css, { from: "src/app.css" }),
                    context(),
                ) ?? [];
            expect(
                findings.map((finding) => finding.message),
                token,
            ).toEqual([expect.stringContaining(`duplicates the schema role "${token}"`)]);
        }
    });

    it("passes --x- extensions that name nothing the schema already has", () => {
        expect(check("L6", "L6-token-hygiene/pass.css")).toEqual([]);
    });

    /* The theme file may set schema tokens and declare extensions; it may still
     * not invent an unprefixed property or an --x- name that shadows a role. */
    it("lets the theme file set schema tokens but not invent names", () => {
        const findings = check(
            "L6",
            "L6-token-hygiene/theme.css",
            "src/styles/theme.css",
            "src/styles/theme.css",
        );
        expect(lines(findings)).toEqual([4, 5]);
        expect(findings[0]?.message).toContain("duplicates the schema role");
        expect(findings[1]?.message).toContain("neither a schema token nor an extension");
    });
});

describe("L7 — z-index literal", () => {
    it("catches an arbitrary and a numeric z utility", () => {
        expect(lines(check("L7", "L7-z-index/fail.tsx"))).toEqual([4, 5]);
    });

    it("catches a numeric z-index declaration", () => {
        expect(lines(check("L7", "L7-z-index/fail.css"))).toEqual([2]);
    });

    it("passes the layer tokens in both languages", () => {
        expect(check("L7", "L7-z-index/pass.tsx")).toEqual([]);
        expect(check("L7", "L7-z-index/pass.css")).toEqual([]);
    });
});

describe("the rule registry", () => {
    it("registers each rule under its own id, with a description and a check", () => {
        for (const [id, rule] of Object.entries(RULES)) {
            expect(rule.id).toBe(id);
            expect(rule.description.length).toBeGreaterThan(0);
            expect(Boolean(rule.checkTsx) || Boolean(rule.checkCss)).toBe(true);
        }
    });
});
