/** Offline script emitter. Execute the returned source with use_figma, after
 * loading its skill. The adapter and test runner never call MCP themselves. */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { COLOR_STORAGE_TOLERANCE } from "./diff-variables.js";
import {
    type FigmaPlan,
    loadTokenSource,
    tokensToVariables,
    variablesToTokens,
} from "./tokens-to-variables.js";

export function importVariablesScript(plan: FigmaPlan): string {
    variablesToTokens(plan);
    return `const plan = ${JSON.stringify(plan.collections)};
const tolerance = ${COLOR_STORAGE_TOLERANCE};
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
const same = (actual, expected) => {
    if (typeof expected === "number") return actual === expected;
    return actual && ["r", "g", "b", "a"].every(key =>
        typeof actual[key] === "number" && Math.abs(actual[key] - expected[key]) <= tolerance);
};
// Complete preflight BEFORE the first mutation. Never overwrite a designer's edits.
for (const spec of plan) {
    const matches = collections.filter(c => c.name === spec.name);
    if (matches.length > 1) throw new Error("Duplicate collection: " + spec.name);
    const collection = matches[0];
    if (!collection) continue;
    if (JSON.stringify(collection.modes.map(m => m.name).sort()) !== JSON.stringify([...spec.modes].sort()))
        throw new Error("Mode drift: " + spec.name);
    const local = variables.filter(v => v.variableCollectionId === collection.id);
    for (const variable of local) {
        const target = spec.variables.find(v => v.name === variable.name);
        if (!target) throw new Error("Unexpected variable: " + spec.name + "/" + variable.name);
        if (local.filter(v => v.name === variable.name).length !== 1)
            throw new Error("Duplicate variable: " + variable.name);
        if (variable.resolvedType !== target.resolvedType)
            throw new Error("Type drift: " + variable.name);
        for (const mode of collection.modes) {
            if (!same(variable.valuesByMode[mode.modeId], target.valuesByMode[mode.name]))
                throw new Error("Value drift; export and review first: " + spec.name + "/" + variable.name + "/" + mode.name);
        }
    }
}
const collectionIds = [];
const variableIds = [];
const createdVariableIds = [];
for (const spec of plan) {
    let collection = collections.find(c => c.name === spec.name);
    if (!collection) {
        collection = figma.variables.createVariableCollection(spec.name);
        collection.renameMode(collection.defaultModeId, spec.modes[0]);
        for (const mode of spec.modes.slice(1)) collection.addMode(mode);
    }
    collectionIds.push(collection.id);
    for (const token of spec.variables) {
        let variable = variables.find(v => v.variableCollectionId === collection.id && v.name === token.name);
        if (!variable) {
            variable = figma.variables.createVariable(token.name, collection, token.resolvedType);
            createdVariableIds.push(variable.id);
        }
        variable.description = token.description;
        variable.scopes = token.scopes;
        variable.setVariableCodeSyntax("WEB", token.codeSyntax);
        for (const mode of collection.modes) variable.setValueForMode(mode.modeId, token.valuesByMode[mode.name]);
        variableIds.push(variable.id);
    }
}
return { collectionIds, variableIds, createdVariableIds, count: variableIds.length };\n`;
}

/** Export only the adapter-owned collections. Aliases are rejected explicitly:
 * an engineer must resolve their target/mode rather than guess during extraction. */
export function exportVariablesScript(plan: FigmaPlan): string {
    variablesToTokens(plan);
    return `const names = ${JSON.stringify(plan.collections.map((collection) => collection.name))};
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
return { collections: collections.filter(c => names.includes(c.name)).map(collection => ({
    name: collection.name,
    modes: collection.modes.map(mode => mode.name),
    variables: variables.filter(v => v.variableCollectionId === collection.id).map(variable => ({
        name: variable.name,
        resolvedType: variable.resolvedType,
        valuesByMode: Object.fromEntries(collection.modes.map(mode => {
            const value = variable.valuesByMode[mode.modeId];
            if (value && typeof value === "object" && value.type === "VARIABLE_ALIAS")
                throw new Error("Resolve alias before comparing: " + variable.name + "/" + mode.name);
            return [mode.name, value];
        }))
    }))
})) };\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const action = process.argv[2];
    if (process.argv.length !== 3 || !["import", "export"].includes(action ?? ""))
        throw new Error("Usage: bun scripts/figma/plugin-scripts.ts import|export");
    const plan = tokensToVariables(loadTokenSource());
    process.stdout.write(
        action === "import" ? importVariablesScript(plan) : exportVariablesScript(plan),
    );
}
