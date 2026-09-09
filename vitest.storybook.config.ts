import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: { tsconfigPaths: true },
    // Portable stories load through a glob; prebundle their dependencies before
    // the test iframe starts, rather than reloading it halfway through a suite.
    optimizeDeps: {
        include: [
            "@storybook/react-vite",
            "storybook/preview-api",
            "storybook/test",
            "@radix-ui/react-dialog",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-select",
            "@radix-ui/react-switch",
            "@radix-ui/react-tooltip",
            "class-variance-authority",
            "tailwind-merge",
        ],
    },
    test: {
        include: ["stories/**/*.browser.test.ts"],
        // CDP is needed to exercise the OS reduced-transparency media query.
        api: { host: "127.0.0.1", allowWrite: true, allowExec: true },
        browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
        },
    },
});
