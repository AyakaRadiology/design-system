import { describe, expect, it } from "vitest";
import { collectCustomProperties } from "./css.js";
import { type Schema, validateScales } from "./schema.js";

const schema: Schema = {
    version: 1,
    extensionPrefix: "x-",
    tokens: {
        "z-modal": { type: "integer", role: "z", required: true, doc: "Modal layer" },
    },
};

describe("custom property value whitespace", () => {
    it.each(["100\u00a0", "\u00a0100", "\u00a0100\u00a0"])(
        "preserves NBSP in %j so integer validation rejects it",
        (value) => {
            const css = `:root{--z-modal: ${value};}`;
            expect(collectCustomProperties(css).get("z-modal")).toEqual([
                { selector: ":root", value },
            ]);
            expect(validateScales(css, schema)).toEqual([
                { code: "type", token: "z-modal", where: ":root" },
            ]);
        },
    );

    it("trims ordinary CSS whitespace and accepts the integer", () => {
        const css = ":root{--z-modal: \t\n\r\f100 \t\n\r\f;}";
        expect(collectCustomProperties(css).get("z-modal")).toEqual([
            { selector: ":root", value: "100" },
        ]);
        expect(validateScales(css, schema)).toEqual([]);
    });
});
