# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

React/TypeScript/Tailwind primitives and CSS tokens consumed by desktop apps on Windows and macOS.

## Product Purpose

`@ayaka/design-system` is the shared schema, voices, primitives and design-lint gate for the fleet's tool UIs.
This review context focuses on the biomonitor voice used by Needle Guide and Needle Simulator; the package also supports base light/dark.

## Users

The needle apps serve non-engineer operators at a CT-guided needle exhibition or clinic.
Operators plan a needle trajectory, read live guidance and recognize unavailable data without engineering diagnostics.
Package consumers are frontend developers and design-review agents; the package itself is not a clinical application.

## Terminology

Guide uses NEEDLE ANGLE, TARGET ANGLE and PLAN ANGLE with inline °; never θ or "inclination" on screen.
Displayed ANGLE is 90° vertical and 0° horizontal; stored/computed/wire inclination remains unchanged.
SOURCE means actual input provenance: SENSOR, MOCK or NONE. It is independent of connection health.
CASE means accepted plan provenance: SIMULATION after an inlet plan is accepted, otherwise CLINICAL; rejection preserves the accepted case.
Mock input alone does not imply SIMULATION. LINK owns connection indication.

## Capabilities and Constraints

Guide has one operator screen with a full-window scene and a visible scene centre; no Settings screen or operator window launcher.
Its automatic, control-free external-display projector is separate from the operator screen.
Fit both Guide viewports, 1280×800 and 1920×1080, without scrolling, clipping or overlap.
Use one shared floating Glass material; no independently styled card/pill families.
Operator copy is English instrument labels, at most two words: no prose or Japanese, including tooltips and accessible details.
Use shared Numeric and controls, mono/tabular readings and inline units; missing/stale data is unavailable, never zero or a retained live-looking pose.
Respect reduced motion and native Windows/macOS behavior: Windows Alt reveals the menu; macOS uses the system menu. Build details belong in native About.
These Guide surface constraints do not redefine the package's general-purpose base voice or every Simulator surface.

## Evidence on Hand

- [Package purpose, voices and primitives](README.md); [shared UI rules](docs/ui-rules.md); [biomonitor rules](voices/biomonitor/VOICE.md); [Glass contract](docs/glass.md).
- [Guide operator contract](https://github.com/AyakaRadiology/needle-guide/blob/d1b32499dcceb341250b8b637e728b20d687182d/docs/ui-spec.md): terminology, states, layout, copy, both viewports and OS policy.
- [Simulator frontend](https://github.com/AyakaRadiology/needle-simulator/blob/main/docs/frontend.md): CT planning/tracking console, biomonitor consumption and English instrument copy.
- Exhibition/clinic and non-engineer audience: task brief. Review consumer-specific changes against that consumer's current specification.
