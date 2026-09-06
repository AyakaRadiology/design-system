#!/usr/bin/env node
/* The published entry point. A thin wrapper on the compiled CLI so that
 * `bunx design-lint` and a plain `node bin/design-lint.js` behave the same,
 * and so the shebang lives in a file the TypeScript build never rewrites.
 *
 * `process.exitCode`, never `process.exit()`. Node writes to a PIPE
 * asynchronously, so a report larger than the pipe buffer (64 KiB on Linux)
 * is still queued when main() returns; process.exit() tears the process down
 * and the queued tail is lost. `design-lint --format json | jq` got a report
 * cut mid-object, while the same command redirected to a file was whole,
 * because a file descriptor is written synchronously. Setting the code and
 * returning lets the event loop drain stdout and then exit with it.
 *
 * src/lint/cli.stdout.test.ts spawns this file with its stdout on a pipe and
 * asserts a 145 KB report arrives entire, with the exit code intact.
 */
import { main } from "../dist/lint/cli.js";

process.exitCode = main(process.argv.slice(2));
