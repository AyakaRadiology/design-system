import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

// Keep common inherited DOM controls discoverable without listing every
// React event handler on every component. Radix's own APIs remain intact.
const DOM_PROPS = new Set([
    "children",
    "className",
    "id",
    "role",
    "title",
    "name",
    "type",
    "value",
    "defaultValue",
    "placeholder",
    "disabled",
    "readOnly",
    "required",
    "onChange",
    "onClick",
    "onKeyDown",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-invalid",
    "aria-pressed",
    "tabIndex",
]);

const config: StorybookConfig = {
    framework: "@storybook/react-vite",
    stories: ["../stories/**/*.stories.tsx"],
    addons: ["@storybook/addon-docs", "@storybook/addon-mcp"],
    features: { componentsManifest: true },
    typescript: {
        reactDocgen: "react-docgen-typescript",
        reactDocgenTypescriptOptions: {
            include: ["src/react/**/*.tsx"],
            shouldRemoveUndefinedFromOptional: true,
            skipChildrenPropWithoutDoc: false,
            propFilter: (prop) =>
                !prop.parent?.fileName.includes("@types/react") || DOM_PROPS.has(prop.name),
        },
    },
    core: { disableTelemetry: true },
    async viteFinal(config) {
        const { mergeConfig } = await import("vite");
        return mergeConfig(config, { plugins: [tailwindcss()], resolve: { tsconfigPaths: true } });
    },
};
export default config;
