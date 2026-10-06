import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("locks source-map-js outside GHSA-68fv-2mgg-jv7q's affected range", () => {
    const lock = readFileSync(new URL("../bun.lock", import.meta.url), "utf8");
    const versions = [...lock.matchAll(/"source-map-js@([^"]+)"/gu)].map((match) => match[1]);
    expect(versions.length).toBeGreaterThan(0);
    for (const version of versions) {
        const parts = version?.match(/^(\d+)\.(\d+)\.(\d+)$/u);
        if (!parts) throw new Error(`Invalid source-map-js version: ${version}`);
        const major = Number(parts[1]);
        const minor = Number(parts[2]);
        const patch = Number(parts[3]);
        // The first patched release is 1.2.2.
        const fixed = major > 1 || (major === 1 && (minor > 2 || (minor === 2 && patch >= 2)));
        expect(fixed, `source-map-js@${version} is affected by GHSA-68fv-2mgg-jv7q`).toBe(true);
    }
});

// First patched releases listed by GHSA-qhr7-859c-m2p7, by major version.
const FIRST_FIXED: ReadonlyMap<number, readonly [number, number]> = new Map([
    [1, [1, 20]],
    [2, [1, 6]],
    [3, [0, 8]],
    [5, [0, 11]],
]);

it("locks brace-expansion outside GHSA-qhr7-859c-m2p7's affected range", () => {
    const lock = readFileSync(new URL("../bun.lock", import.meta.url), "utf8");
    const versions = [...lock.matchAll(/"brace-expansion@([^"]+)"/gu)].map((match) => match[1]);
    expect(versions.length).toBeGreaterThan(0);
    for (const version of versions) {
        const parts = version?.match(/^(\d+)\.(\d+)\.(\d+)$/u);
        if (!parts) throw new Error(`Invalid brace-expansion version: ${version}`);
        const major = Number(parts[1]);
        const minor = Number(parts[2]);
        const patch = Number(parts[3]);
        const fixed = FIRST_FIXED.get(major);
        const affected =
            major < 1 ||
            major === 4 ||
            (fixed !== undefined && (minor < fixed[0] || (minor === fixed[0] && patch < fixed[1])));
        expect(affected, `brace-expansion@${version} is affected by GHSA-qhr7-859c-m2p7`).toBe(
            false,
        );
    }
});
