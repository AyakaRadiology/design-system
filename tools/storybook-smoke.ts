import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";
import { STATUS_STATES } from "../src/react/StatusPill.js";
import * as statusStories from "../stories/StatusPill.stories.js";

const OUTPUT_DIR = "storybook-static";
interface StoryEntry {
    type: string;
    title: string;
    id: string;
}
const index: { entries: Record<string, StoryEntry> } = JSON.parse(
    await readFile(`${OUTPUT_DIR}/index.json`, "utf8"),
);
const entries = Object.values(index.entries).filter((entry) => entry.type === "story");
assert.ok(entries.length, "Storybook must contain stories");

// Follow the package's public export map, including future barrels/re-exports.
const program = ts.createProgram(["src/react/index.ts"], {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    jsx: ts.JsxEmit.ReactJSX,
    skipLibCheck: true,
});
const checker = program.getTypeChecker();
const barrel = program.getSourceFile("src/react/index.ts");
assert.ok(barrel);
const module = checker.getSymbolAtLocation(barrel);
assert.ok(module);
const publicExports = checker.getExportsOfModule(module);
const publicNames = publicExports.map((symbol) => symbol.name);
const components = publicExports
    .filter((symbol) => {
        if (!/^[A-Z]/u.test(symbol.name)) return false;
        const target =
            symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
        return checker.getTypeOfSymbolAtLocation(target, barrel).getCallSignatures().length > 0;
    })
    .map((symbol) => symbol.name)
    .sort();
assert.ok(components.length, "The React export inventory must not be empty");
assert.deepEqual(
    [...new Set(entries.map((entry) => entry.title))].sort(),
    components.map((name) => `Components/${name}`),
);
for (const component of components) {
    console.log(
        `${component}: ${entries.filter((entry) => entry.title === `Components/${component}`).length} stories`,
    );
}
interface ComponentManifestEntry {
    name: string;
    import: string;
    reactDocgenTypescript?: { props: Record<string, unknown> };
    stories: { id: string; warning?: string }[];
}
const manifest: { components: Record<string, ComponentManifestEntry> } = JSON.parse(
    await readFile(`${OUTPUT_DIR}/manifests/components.json`, "utf8"),
);
assert.deepEqual(
    Object.values(manifest.components)
        .map((entry) => entry.name)
        .sort(),
    components,
);
for (const component of Object.values(manifest.components)) {
    const imports = ts.createSourceFile(
        "example.tsx",
        component.import,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    );
    for (const statement of imports.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
            continue;
        if (statement.moduleSpecifier.text === "react") continue;
        assert.equal(
            statement.moduleSpecifier.text,
            "@ayaka/design-system/react",
            `${component.name}: examples must use the public React subpath`,
        );
        const bindings = statement.importClause?.namedBindings;
        assert.ok(bindings && ts.isNamedImports(bindings));
        for (const binding of bindings.elements) {
            assert.ok(
                publicNames.includes((binding.propertyName ?? binding.name).text),
                `${component.name}: example imports a non-public component`,
            );
        }
    }
    assert.ok(
        Object.keys(component.reactDocgenTypescript?.props ?? {}).length,
        `${component.name} must expose its real props to MCP`,
    );
    assert.deepEqual(
        component.stories.map((story) => story.id).sort(),
        entries
            .filter((story) => story.title === `Components/${component.name}`)
            .map((story) => story.id)
            .sort(),
    );
    for (const story of component.stories) {
        assert.equal(story.warning, undefined, `${story.id}: incomplete MCP example`);
    }
}

for (const [tone, states] of Object.entries(STATUS_STATES)) {
    for (const state of states) {
        assert.ok(
            Object.values(statusStories).some(
                (story) =>
                    "args" in story &&
                    story.args?.status === tone &&
                    story.args.children === `ANGLE · ${state}`,
            ),
            `Missing StatusPill story for ${tone}/${state}`,
        );
    }
}

async function run(command: string, args: string[], env = process.env) {
    await new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, { stdio: "inherit", env });
        child.once("error", reject);
        child.once("exit", (code, signal) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} failed (exit ${code}, signal ${signal})`));
        });
    });
}
const browserEnv = {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: resolve("node_modules/.cache/ms-playwright"),
};
await run("bun", ["x", "--no-install", "playwright", "install", "chromium"], browserEnv);
await run(
    "bun",
    ["x", "--no-install", "vitest", "run", "--config", "vitest.storybook.config.ts"],
    browserEnv,
);
console.log(
    `Storybook PASS: ${components.length} components, ${entries.length} stories in all three voices`,
);
