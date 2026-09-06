import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

/* React Testing Library unmounts between tests only when it can see a global
 * `afterEach`, which vitest provides only with `globals: true`. Rather than
 * turn that on for the whole suite, register the hook here — once, centrally,
 * so a component test file cannot forget it and start finding two of every
 * element.
 *
 * Guarded on `document` because this setup file is shared with the node-
 * environment tests (the CSS validators and the CLI), which have no DOM and no
 * business loading react-dom.
 */
if (typeof document !== "undefined") {
    const { cleanup } = await import("@testing-library/react");
    afterEach(cleanup);
}
