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

    /* Radix's popper-backed primitives (Select, Tooltip, Dialog) drive
     * themselves off browser APIs jsdom does not implement. Without these
     * stubs the components throw on open rather than failing an assertion,
     * which reads as a broken test rather than a broken component.
     *
     * Stubs, not fakes: each returns the least the primitive needs to proceed.
     * Nothing here is asserted on — the tests check roles, values and data
     * attributes, never geometry, because geometry is the one thing jsdom
     * cannot tell the truth about. */
    globalThis.ResizeObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };

    globalThis.DOMRect ??= class {
        constructor(
            public x = 0,
            public y = 0,
            public width = 0,
            public height = 0,
        ) {}
        get top() {
            return this.y;
        }
        get left() {
            return this.x;
        }
        get right() {
            return this.x + this.width;
        }
        get bottom() {
            return this.y + this.height;
        }
        toJSON() {
            return { ...this };
        }
        static fromRect(rect?: DOMRectInit) {
            return new DOMRect(rect?.x, rect?.y, rect?.width, rect?.height);
        }
    } as typeof DOMRect;

    Element.prototype.hasPointerCapture ??= () => false;
    Element.prototype.setPointerCapture ??= () => {};
    Element.prototype.releasePointerCapture ??= () => {};
    Element.prototype.scrollIntoView ??= () => {};
}
