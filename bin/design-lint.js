#!/usr/bin/env node
/* The published entry point. A thin wrapper on the compiled CLI so that
 * `bunx design-lint` and a plain `node bin/design-lint.js` behave the same,
 * and so the shebang lives in a file the TypeScript build never rewrites. */
import { main } from "../dist/lint/cli.js";

process.exit(main(process.argv.slice(2)));
