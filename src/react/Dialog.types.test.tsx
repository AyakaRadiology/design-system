import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, it } from "vitest";
import { DialogContent } from "./Dialog.js";

it("rejects nullish and boolean dialog titles at compile time", () => {
    // @ts-expect-error null leaves the dialog unnamed
    void (<DialogContent title={null}>Body</DialogContent>);
    // @ts-expect-error undefined leaves the dialog unnamed
    void (<DialogContent title={undefined}>Body</DialogContent>);
    // @ts-expect-error false renders no accessible name
    void (<DialogContent title={false}>Body</DialogContent>);
    // @ts-expect-error true renders no accessible name
    void (<DialogContent title={true}>Body</DialogContent>);
    // @ts-expect-error a title must still be required
    void (<DialogContent>Body</DialogContent>);

    void (<DialogContent title="Settings">Body</DialogContent>);
    void (<DialogContent title={<span>Settings</span>}>Body</DialogContent>);
    void (<DialogContent title={0}>Body</DialogContent>);

    // Vitest transpiles without type-checking: compile this file so an unused
    // expectation directive also fails the normal test command.
    const program = ts.createProgram([fileURLToPath(import.meta.url)], {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        jsx: ts.JsxEmit.ReactJSX,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    expect(
        ts.formatDiagnostics(diagnostics, {
            getCanonicalFileName: (name) => name,
            getCurrentDirectory: () => process.cwd(),
            getNewLine: () => "\n",
        }),
    ).toBe("");
}, 10_000);
