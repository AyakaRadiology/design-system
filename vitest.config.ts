import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        /* node, not jsdom, as the DEFAULT. Most of this package is a CLI and a
         * pair of CSS validators that read files off disk, and jsdom replaces
         * the global `URL` with its own implementation, which `node:fs` refuses
         * ("The URL must be of scheme file"). The React component tests opt
         * back in with a `// @vitest-environment jsdom` docblock. */
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.ts"],
        setupFiles: ["./vitest.setup.ts"],
        restoreMocks: true,
    },
});
