import assert from "node:assert/strict";
import { mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import postcss from "postcss";
import { build, createLogger, preview } from "vite";

const app = process.argv[2];
if (!app) throw new Error("Usage: plain-css.mjs <packed consumer app>");
const root = join(app, "plain-css-probe");
mkdirSync(root);
symlinkSync(join(app, "node_modules"), join(root, "node_modules"), "dir");
writeFileSync(join(root, "package.json"), '{"type":"module","private":true}');
writeFileSync(
    join(root, "index.html"),
    '<!doctype html><html><head><title>Plain CSS</title></head><body><p id="probe">Reading</p><script type="module" src="/main.js"></script></body></html>',
);
writeFileSync(
    join(root, "main.js"),
    `import baseUrl from "@ayaka/design-system/voices/base.css?url";
import biomonitorUrl from "@ayaka/design-system/voices/biomonitor.css?url";
import scales from "@ayaka/design-system/tokens/scales.css?inline";
for (const [name, href] of Object.entries({ base: baseUrl, biomonitor: biomonitorUrl })) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.id = name;
    link.disabled = name !== "base";
    document.head.append(link);
}
const inline = document.createElement("style");
inline.id = "inline-scales";
inline.textContent = scales;
document.head.append(inline);
const extensions = document.createElement("style");
extensions.textContent = ":root { --x-probe: var(--accent); } #probe { color: var(--x-probe); }";
document.head.append(extensions);
`,
);

const browser = await chromium.launch({ headless: true });
try {
    for (const withTailwind of [false, true]) {
        const warnings = [];
        const logger = createLogger("warn");
        logger.warn = (message) => warnings.push(message);
        const config = {
            root,
            configFile: false,
            plugins: withTailwind ? [tailwindcss()] : [],
            customLogger: logger,
            build: { cssMinify: "lightningcss", assetsInlineLimit: 0 },
            preview: { host: "127.0.0.1", port: 0 },
        };
        await build(config);
        assert.deepEqual(warnings, [], "standalone CSS must minify without warnings");
        const assets = join(root, "dist/assets");
        const styles = readdirSync(assets).filter((file) => file.endsWith(".css"));
        assert.equal(styles.length, 2, "both voice URL assets must be emitted");
        for (const file of styles) {
            postcss.parse(readFileSync(join(assets, file), "utf8")).walkAtRules((rule) => {
                assert.ok(
                    !/^(theme|source|custom-variant|apply)$/iu.test(rule.name),
                    `${file}: unexpected ${rule}`,
                );
            });
        }
        const server = await preview(config);
        try {
            const address = server.httpServer.address();
            if (!address || typeof address === "string") throw new Error("No preview address");
            const page = await browser.newPage();
            try {
                await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: "networkidle" });
                const read = () =>
                    page.evaluate(() => {
                        const style = getComputedStyle(document.body);
                        const probe = document.getElementById("probe");
                        if (!probe) throw new Error("Missing extension probe");
                        return {
                            background: style.backgroundColor,
                            color: getComputedStyle(probe).color,
                            font: style.fontFamily,
                            size: style.fontSize,
                            lineHeight: style.lineHeight,
                            easing: style.getPropertyValue("--ease-standard").trim(),
                        };
                    });
                const light = await read();
                assert.match(light.font, /Inter/u);
                assert.equal(light.size, "14px");
                assert.equal(light.lineHeight, "18px");
                assert.equal(light.easing.replace(/\s/gu, ""), "cubic-bezier(.2,0,0,1)");
                await page.evaluate(() => document.documentElement.classList.add("dark"));
                const dark = await read();
                assert.notEqual(dark.background, light.background, ".dark swaps the palette");
                assert.notEqual(dark.color, light.color, "--x-* tracks the changed accent");
                await page.evaluate(() => {
                    document.documentElement.classList.remove("dark");
                    const base = document.getElementById("base");
                    const biomonitor = document.getElementById("biomonitor");
                    if (
                        !(base instanceof HTMLLinkElement) ||
                        !(biomonitor instanceof HTMLLinkElement)
                    )
                        throw new Error("Missing voice links");
                    base.disabled = true;
                    biomonitor.disabled = false;
                });
                await page.waitForFunction((previous) => {
                    const link = document.getElementById("biomonitor");
                    return (
                        link instanceof HTMLLinkElement &&
                        link.sheet !== null &&
                        getComputedStyle(document.body).backgroundColor !== previous
                    );
                }, dark.background);
                const biomonitor = await read();
                assert.notEqual(biomonitor.background, light.background);
                assert.notEqual(biomonitor.background, dark.background);
                const inline = await page.locator("#inline-scales").textContent();
                assert.ok(inline);
                postcss.parse(inline).walkAtRules((rule) => {
                    assert.ok(!/^(theme|source|custom-variant|apply)$/iu.test(rule.name));
                });
            } finally {
                await page.close();
            }
        } finally {
            await server.close();
        }
        console.log(`Plain CSS: ?url, ?inline, .dark and --x-* PASS (Tailwind: ${withTailwind})`);
    }
} finally {
    await browser.close();
}
