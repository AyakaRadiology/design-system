import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { diffVariables, type LiveVariables } from "./diff-variables.js";
import { exportVariablesScript, importVariablesScript } from "./plugin-scripts.js";
import { loadTokenSource, tokensToVariables, type VariableValue } from "./tokens-to-variables.js";

const plan = tokensToVariables(loadTokenSource());
class Collection {
    defaultModeId = "mode-0";
    modes = [{ modeId: this.defaultModeId, name: "Mode 1" }];
    constructor(
        public name: string,
        public id: string,
    ) {}
    renameMode(id: string, name: string) {
        const mode = this.modes.find((mode) => mode.modeId === id);
        if (!mode) throw new Error("Unknown mode");
        mode.name = name;
    }
    addMode(name: string) {
        this.modes.push({ modeId: `mode-${this.modes.length}`, name });
    }
}
class Variable {
    description = "";
    scopes: string[] = [];
    valuesByMode: Record<string, VariableValue> = {};
    codeSyntax: Record<string, string> = {};
    constructor(
        public name: string,
        public variableCollectionId: string,
        public resolvedType: string,
        public id: string,
    ) {}
    setValueForMode(mode: string, value: VariableValue) {
        // Match Figma's actual storage, including FLOAT values such as 1.08.
        this.valuesByMode[mode] = typeof value === "number" ? Math.fround(value) : value;
    }
    setVariableCodeSyntax(platform: string, value: string) {
        this.codeSyntax[platform] = value;
    }
}
function harness() {
    const collections: Collection[] = [];
    const variables: Variable[] = [];
    const figma = {
        variables: {
            getLocalVariableCollectionsAsync: async () => collections,
            getLocalVariablesAsync: async () => variables,
            createVariableCollection(name: string) {
                const collection = new Collection(name, `collection-${collections.length}`);
                collections.push(collection);
                return collection;
            },
            createVariable(name: string, collection: Collection, type: string) {
                const variable = new Variable(
                    name,
                    collection.id,
                    type,
                    `variable-${variables.length}`,
                );
                variables.push(variable);
                return variable;
            },
        },
    };
    const run = (script: string): Promise<LiveVariables> =>
        runInNewContext(`(async () => { ${script} })()`, { figma });
    return { collections, variables, run };
}

describe("emitted Plugin API scripts (contract harness, not a Figma runtime test)", () => {
    it("imports idempotently and exports all variables/modes back to an empty diff", async () => {
        const { run, collections, variables } = harness();
        await run(importVariablesScript(plan));
        const count = variables.length;
        await run(importVariablesScript(plan));
        expect(collections).toHaveLength(plan.collections.length);
        expect(variables).toHaveLength(count);
        expect(count).toBe(
            plan.collections.reduce((sum, collection) => sum + collection.variables.length, 0),
        );
        expect(diffVariables(plan, await run(exportVariablesScript(plan)))).toEqual([]);
        for (const spec of plan.collections) {
            for (const token of spec.variables) {
                expect(
                    variables.find(
                        (v) =>
                            v.name === token.name &&
                            collections.find((c) => c.id === v.variableCollectionId)?.name ===
                                spec.name,
                    ),
                ).toMatchObject({
                    description: token.description,
                    scopes: token.scopes,
                    codeSyntax: { WEB: token.codeSyntax },
                });
            }
        }
    });
    it("preflights every collection before mutating any variable", async () => {
        const { run, variables } = harness();
        await run(importVariablesScript(plan));
        const last = variables.at(-1);
        const first = variables[0];
        if (!last || !first) throw new Error("Missing imported variables");
        const write = vi.spyOn(first, "setValueForMode");
        last.valuesByMode["mode-0"] = 999;
        await expect(run(importVariablesScript(plan))).rejects.toThrow("Value drift");
        expect(write).not.toHaveBeenCalled();
        expect(last.valuesByMode["mode-0"]).toBe(999);
    });
    it.each(["description", "scopes", "WEB", "missing WEB"])(
        "rejects %s metadata drift before any mutation and exports it for review",
        async (field) => {
            const { run, variables, collections } = harness();
            await run(importVariablesScript(plan));
            const last = variables.at(-1);
            const first = variables[0];
            if (!last || !first) throw new Error("Missing imported variables");
            if (field === "description") last.description = "designer annotation";
            if (field === "scopes") last.scopes = ["ALL_SCOPES"];
            if (field === "WEB") last.codeSyntax.WEB = "designer-token";
            if (field === "missing WEB") delete last.codeSyntax.WEB;
            const snapshot = JSON.stringify({ variables, collections });
            const write = vi.spyOn(first, "setValueForMode");
            await expect(run(importVariablesScript(plan))).rejects.toThrow(
                "Metadata drift; export and review first:",
            );
            expect(write).not.toHaveBeenCalled();
            expect(JSON.stringify({ variables, collections })).toBe(snapshot);
            const exported = await run(exportVariablesScript(plan));
            expect(exported.collections.flatMap((c) => c.variables)).toContainEqual(
                expect.objectContaining({
                    name: last.name,
                    description: last.description,
                    scopes: last.scopes,
                    codeSyntax: last.codeSyntax,
                }),
            );
        },
    );
    it("refuses a numeric edit even when it is smaller than the color tolerance", async () => {
        const { run, variables } = harness();
        await run(importVariablesScript(plan));
        const saturation = variables.find((variable) => variable.name === "x-glass-saturate");
        if (!saturation) throw new Error("Missing saturation");
        saturation.setValueForMode("mode-0", 1.0800002);
        await expect(run(importVariablesScript(plan))).rejects.toThrow("Value drift");
    });
});
