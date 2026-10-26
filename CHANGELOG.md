# Changelog

## [0.6.3](https://github.com/AyakaRadiology/design-system/compare/v0.6.2...v0.6.3) (2026-10-21)


### Bug Fixes

* [agent-found] dist/lint/rules/L4-dark-twins.js:3 A consumer uses dark:border-2 to increase border width in da ([#154](https://github.com/AyakaRadiology/design-system/issues/154)) ([e17fcdb](https://github.com/AyakaRadiology/design-system/commit/e17fcdbef5a91ddd556314e08e4fec48bd3cc1ac)), closes [#153](https://github.com/AyakaRadiology/design-system/issues/153)

## [0.6.2](https://github.com/AyakaRadiology/design-system/compare/v0.6.1...v0.6.2) (2026-10-17)


### Bug Fixes

* [agent-found] dist/lint/cli.js:34 A contributor submits a TSX string containing a `z-[…]` util ([#94](https://github.com/AyakaRadiology/design-system/issues/94)) ([9317f65](https://github.com/AyakaRadiology/design-system/commit/9317f65d7319f48d624a072e3cace76fe08ce34c)), closes [#93](https://github.com/AyakaRadiology/design-system/issues/93)
* [agent-found] dist/lint/contrast.js:67 A voice edit introduces a decimal typo such as `--border-str ([#148](https://github.com/AyakaRadiology/design-system/issues/148)) ([9cc43ab](https://github.com/AyakaRadiology/design-system/commit/9cc43abbc993a764c305e83fc16e98a2d52c4525)), closes [#147](https://github.com/AyakaRadiology/design-system/issues/147)
* [agent-found] dist/lint/contrast.js:85 A voice uses a valid CSS color such as `oklch(0.5 0.1 30 / 2 ([#124](https://github.com/AyakaRadiology/design-system/issues/124)) ([6088727](https://github.com/AyakaRadiology/design-system/commit/60887272c3ac297a0096bfe1537e8387e0231218)), closes [#118](https://github.com/AyakaRadiology/design-system/issues/118)
* [agent-found] dist/lint/css.js:64 A token value copied with a trailing non-breaking space, suc ([#116](https://github.com/AyakaRadiology/design-system/issues/116)) ([3d4f5a6](https://github.com/AyakaRadiology/design-system/commit/3d4f5a6f78c1e687c1922ccc7a470da25ce9562a)), closes [#113](https://github.com/AyakaRadiology/design-system/issues/113)
* [agent-found] dist/lint/rules/L1-color-literal.js:9 A consumer uses `document.querySelector("#abcde")` for a val ([#117](https://github.com/AyakaRadiology/design-system/issues/117)) ([33a1d2c](https://github.com/AyakaRadiology/design-system/commit/33a1d2c1db8b308d9d5b73fb440f308e8adf1012)), closes [#114](https://github.com/AyakaRadiology/design-system/issues/114)
* [agent-found] dist/lint/rules/L6-token-hygiene.js:8 A Tailwind v4 app defines `--leading-tight` inside `[@theme](https://github.com/theme)` ([#128](https://github.com/AyakaRadiology/design-system/issues/128)) ([b05d5dc](https://github.com/AyakaRadiology/design-system/commit/b05d5dc407627db8871a4de294e22febfe8c5680)), closes [#127](https://github.com/AyakaRadiology/design-system/issues/127)
* [agent-found] dist/react/Dialog.d.ts:12 A consumer passes `title={null}` to `DialogContent`, which T ([#98](https://github.com/AyakaRadiology/design-system/issues/98)) ([5647034](https://github.com/AyakaRadiology/design-system/commit/5647034f7f1df45f2549ee8fd74c23ed29e0323f)), closes [#95](https://github.com/AyakaRadiology/design-system/issues/95)
* [agent-found] dist/react/Field.js:44 A consumer wraps a control that already has `aria-describedb ([#108](https://github.com/AyakaRadiology/design-system/issues/108)) ([2422033](https://github.com/AyakaRadiology/design-system/commit/2422033356048f4aaaad2d6d6d4362a123473d26)), closes [#107](https://github.com/AyakaRadiology/design-system/issues/107)
* [agent-found] dist/react/RadioGroup.js:49 In a vertical RadioGroup, a user presses ArrowRight or Arrow ([#152](https://github.com/AyakaRadiology/design-system/issues/152)) ([78afabf](https://github.com/AyakaRadiology/design-system/commit/78afabf5742ab47d9b62cfff15ad561413b286f9))
* [agent-found] dist/react/Switch.js:13 In an Arabic or Hebrew interface with inherited `dir="rtl"`, ([#121](https://github.com/AyakaRadiology/design-system/issues/121)) ([074a787](https://github.com/AyakaRadiology/design-system/commit/074a7875be2bfb4e00213c47fddf6127537cc7f2)), closes [#115](https://github.com/AyakaRadiology/design-system/issues/115)
* [agent-found] dist/react/Tooltip.js:19 A consumer passes a text node or a Fragment as Tooltip child ([#135](https://github.com/AyakaRadiology/design-system/issues/135)) ([da49cd8](https://github.com/AyakaRadiology/design-system/commit/da49cd80d11e53e23ed73646751e4288e3a647c7)), closes [#133](https://github.com/AyakaRadiology/design-system/issues/133)
* [agent-found] scripts/figma/plugin-scripts.ts:66 A designer changes an existing variable’s description, scope ([#106](https://github.com/AyakaRadiology/design-system/issues/106)) ([8ba55db](https://github.com/AyakaRadiology/design-system/commit/8ba55db19694b19b60cbc610204121c3dd8bf172)), closes [#102](https://github.com/AyakaRadiology/design-system/issues/102)
* [agent-found] src/color.ts:29 A consumer imports the documented public `@ayaka/design-syst ([#105](https://github.com/AyakaRadiology/design-system/issues/105)) ([a43fc52](https://github.com/AyakaRadiology/design-system/commit/a43fc52dd66bd37174faefec1a02ff53fe995db4)), closes [#101](https://github.com/AyakaRadiology/design-system/issues/101)
* [agent-found] src/lint/config.ts:82 A contributor submits a config with a nonempty allowlist pat ([#140](https://github.com/AyakaRadiology/design-system/issues/140)) ([c2620b9](https://github.com/AyakaRadiology/design-system/commit/c2620b97947ccfdc2056d533bbad80fce1469657)), closes [#139](https://github.com/AyakaRadiology/design-system/issues/139)
* [agent-found] src/lint/contrast.ts:110 A palette author writes a translucent token with an out-of-r ([#123](https://github.com/AyakaRadiology/design-system/issues/123)) ([9b638fa](https://github.com/AyakaRadiology/design-system/commit/9b638fab8e057e45603208b4f6c03ab52c1f0df2)), closes [#119](https://github.com/AyakaRadiology/design-system/issues/119)
* [agent-found] src/lint/contrast.ts:149 A voice author appends an accidental token after a color, su ([#87](https://github.com/AyakaRadiology/design-system/issues/87)) ([079d84e](https://github.com/AyakaRadiology/design-system/commit/079d84e53b665420acb5a9cb3154e3929744c5e3)), closes [#86](https://github.com/AyakaRadiology/design-system/issues/86)
* [agent-found] src/lint/rules/L3-off-scale.ts:6 A consumer uses the valid Tailwind class `mt-[-13px]` for a ([#126](https://github.com/AyakaRadiology/design-system/issues/126)) ([ab676c5](https://github.com/AyakaRadiology/design-system/commit/ab676c5a26e399f05d2ff2eb7e3aa46de75714f5)), closes [#120](https://github.com/AyakaRadiology/design-system/issues/120)
* [agent-found] src/lint/rules/L4-dark-twins.ts:6 A component uses a common chained variant such as `dark:hove ([#99](https://github.com/AyakaRadiology/design-system/issues/99)) ([4811527](https://github.com/AyakaRadiology/design-system/commit/4811527252650e3d9dd442d6dae4d92047a97343)), closes [#96](https://github.com/AyakaRadiology/design-system/issues/96)
* [agent-found] src/lint/rules/L6-token-hygiene.ts:11 A consumer adds a valid Tailwind v4 theme variable such as ` ([#151](https://github.com/AyakaRadiology/design-system/issues/151)) ([5fb2034](https://github.com/AyakaRadiology/design-system/commit/5fb20343f9ba01f9d2a51baf2caa43f22ed67cd5)), closes [#149](https://github.com/AyakaRadiology/design-system/issues/149)
* [agent-found] src/lint/rules/L6-token-hygiene.ts:25 A consumer declares `[@theme](https://github.com/theme) { --text-xs: 2rem; }` in an app ([#100](https://github.com/AyakaRadiology/design-system/issues/100)) ([dd9247e](https://github.com/AyakaRadiology/design-system/commit/dd9247ed08af20a9a8a0108ccbb50698149f9b1e)), closes [#97](https://github.com/AyakaRadiology/design-system/issues/97)
* [agent-found] src/lint/rules/L7-z-index.ts:7 A consumer uses Tailwind’s valid `z-[var(--z-modal)]` utilit ([#110](https://github.com/AyakaRadiology/design-system/issues/110)) ([284b22e](https://github.com/AyakaRadiology/design-system/commit/284b22ecf3ce0cb5147c90b8636233c678f2e058)), closes [#103](https://github.com/AyakaRadiology/design-system/issues/103)
* [agent-found] src/lint/schema.ts:222 A light+dark voice retains an empty `.dark {}` block after i ([#125](https://github.com/AyakaRadiology/design-system/issues/125)) ([962f003](https://github.com/AyakaRadiology/design-system/commit/962f003163f9c62589ecdfd5414635eb3348e772)), closes [#122](https://github.com/AyakaRadiology/design-system/issues/122)
* [agent-found] src/lint/schema.ts:265 When a colour token’s `--color-<name>` declaration is accide ([#132](https://github.com/AyakaRadiology/design-system/issues/132)) ([563e1be](https://github.com/AyakaRadiology/design-system/commit/563e1be4663f88b936a19880c7b40e69f2f25931)), closes [#130](https://github.com/AyakaRadiology/design-system/issues/130)
* [agent-found] src/lint/tsx.ts:80 A TSX file contains a quoted JSX attribute with an out-of-ra ([#91](https://github.com/AyakaRadiology/design-system/issues/91)) ([309848c](https://github.com/AyakaRadiology/design-system/commit/309848c743b1800974da02419ec528522194b248)), closes [#89](https://github.com/AyakaRadiology/design-system/issues/89)
* [agent-found] src/react/BuildStamp.tsx:85 A consumer supplies an already-worded `buildTime` (which Bui ([#109](https://github.com/AyakaRadiology/design-system/issues/109)) ([bbd7ed6](https://github.com/AyakaRadiology/design-system/commit/bbd7ed6d46aec882922d630b6e97157d30c9c2be)), closes [#104](https://github.com/AyakaRadiology/design-system/issues/104)
* [agent-found] src/react/Field.tsx:44 A form passes an empty error array (for example, `error={err ([#92](https://github.com/AyakaRadiology/design-system/issues/92)) ([642f4a2](https://github.com/AyakaRadiology/design-system/commit/642f4a21935bf1a359981e29ae2043689dc8928f)), closes [#90](https://github.com/AyakaRadiology/design-system/issues/90)
* [agent-found] src/react/Field.tsx:79 A caller wraps a single control in a React fragment, such as ([#131](https://github.com/AyakaRadiology/design-system/issues/131)) ([128da70](https://github.com/AyakaRadiology/design-system/commit/128da70b42d97d18fe36c3c1a1ed2eef59389518)), closes [#129](https://github.com/AyakaRadiology/design-system/issues/129)
* [agent-found] src/react/MiniBars.tsx:66 A caller derives `max` from a data window that contains a no ([#138](https://github.com/AyakaRadiology/design-system/issues/138)) ([96c09fc](https://github.com/AyakaRadiology/design-system/commit/96c09fca42649357554773490a206b23fdaebe0b)), closes [#137](https://github.com/AyakaRadiology/design-system/issues/137)
* [agent-found] src/react/RadioGroup.tsx:84 A horizontal RadioGroup rendered inside Radix's RTL Directio ([#142](https://github.com/AyakaRadiology/design-system/issues/142)) ([da721c8](https://github.com/AyakaRadiology/design-system/commit/da721c8b816bf8b8b152d0fdd468859cb0c2d60e)), closes [#141](https://github.com/AyakaRadiology/design-system/issues/141)
* [agent-found] src/react/Sparkline.tsx:87 A consumer forwards a standard SVG `viewBox` prop while comp ([#144](https://github.com/AyakaRadiology/design-system/issues/144)) ([5e84f08](https://github.com/AyakaRadiology/design-system/commit/5e84f08c2df877cc4c58a8c0b2362341e277d274)), closes [#143](https://github.com/AyakaRadiology/design-system/issues/143)
* [agent-found] tests/consumer/run.sh:279 If the packed voice stops emitting `--bg` as an OKLCH value, ([#112](https://github.com/AyakaRadiology/design-system/issues/112)) ([a3ffea9](https://github.com/AyakaRadiology/design-system/commit/a3ffea935b1cc7d7c8f766b8028e128d9359683f)), closes [#111](https://github.com/AyakaRadiology/design-system/issues/111)

## [0.6.1](https://github.com/AyakaRadiology/design-system/compare/v0.6.0...v0.6.1) (2026-10-08)


### Bug Fixes

* [security] high: source-map-js 1 advisories (GHSA-68fv-2mgg-jv7q) source-map-js allows event-loop denial of service through i… ([#79](https://github.com/AyakaRadiology/design-system/issues/79)) ([53db7fc](https://github.com/AyakaRadiology/design-system/commit/53db7fc101a379b3ccc4124366134463904f64c4)), closes [#78](https://github.com/AyakaRadiology/design-system/issues/78)

## [0.6.0](https://github.com/AyakaRadiology/design-system/compare/v0.5.1...v0.6.0) (2026-10-03)


### Features

* add Sparkline and MiniBars chart primitives ([#69](https://github.com/AyakaRadiology/design-system/issues/69)) ([3109f06](https://github.com/AyakaRadiology/design-system/commit/3109f06fd2f77018672367932a2f00d8087da8f9))


### Bug Fixes

* [agent-found] src/react/Sparkline.tsx:26 Displaying an hour of frame-time samples recorded at 60 Hz ( ([#73](https://github.com/AyakaRadiology/design-system/issues/73)) ([b1c5f6f](https://github.com/AyakaRadiology/design-system/commit/b1c5f6f9601a487684245045a9e6e054cde70cb6)), closes [#72](https://github.com/AyakaRadiology/design-system/issues/72)

## [0.5.1](https://github.com/AyakaRadiology/design-system/compare/v0.5.0...v0.5.1) (2026-10-03)


### Bug Fixes

* [agent-found] dist/lint/config.js:16 A malformed configuration containing "rules": [] silently di ([#51](https://github.com/AyakaRadiology/design-system/issues/51)) ([b4f9ee0](https://github.com/AyakaRadiology/design-system/commit/b4f9ee02f025bd664023bcec375f3f67e4556a1a)), closes [#45](https://github.com/AyakaRadiology/design-system/issues/45)
* [agent-found] dist/lint/config.js:90 Using "./src/styles/theme.css" instead of "src/styles/theme. ([#52](https://github.com/AyakaRadiology/design-system/issues/52)) ([dd0f678](https://github.com/AyakaRadiology/design-system/commit/dd0f678bb3733af064f51bdd9fb7f191eccd9a0e)), closes [#46](https://github.com/AyakaRadiology/design-system/issues/46)
* [agent-found] dist/lint/contrast.js:205 Nested color declarations overwrite the enclosing palette in ([#53](https://github.com/AyakaRadiology/design-system/issues/53)) ([d751f99](https://github.com/AyakaRadiology/design-system/commit/d751f993db6d353bc45b3ff2f6fd312ee2c6ef02)), closes [#47](https://github.com/AyakaRadiology/design-system/issues/47)
* [agent-found] dist/lint/glob.js:24 Combining supported brace alternation with globstar misses f ([#58](https://github.com/AyakaRadiology/design-system/issues/58)) ([5b1d3f8](https://github.com/AyakaRadiology/design-system/commit/5b1d3f8511ede2d99a1b5dc6c4e299c387931f60)), closes [#55](https://github.com/AyakaRadiology/design-system/issues/55)
* [agent-found] dist/lint/glob.js:25 Exclusion and allowlist globs fail for files beneath directo ([#59](https://github.com/AyakaRadiology/design-system/issues/59)) ([e70744d](https://github.com/AyakaRadiology/design-system/commit/e70744d115cbfe2b84db740f5957f2d1de201b2c)), closes [#56](https://github.com/AyakaRadiology/design-system/issues/56)
* [agent-found] dist/lint/glob.js:40 An exact exclusion or allowlist path containing literal brac ([#57](https://github.com/AyakaRadiology/design-system/issues/57)) ([5eb1ae2](https://github.com/AyakaRadiology/design-system/commit/5eb1ae288430269fb1031e5e36cf8682ac484134)), closes [#54](https://github.com/AyakaRadiology/design-system/issues/54)
* [agent-found] src/lint/run.ts:33 Use include: ["src/**"] in a project containing src/Button.t ([#63](https://github.com/AyakaRadiology/design-system/issues/63)) ([725fc37](https://github.com/AyakaRadiology/design-system/commit/725fc3747dbe2204323fa57547479a476bf2142d)), closes [#60](https://github.com/AyakaRadiology/design-system/issues/60)
* [agent-found] src/lint/tsx.ts:13 Lint a valid a.ts containing `const identity = &lt;T&gt;(value: T) ([#64](https://github.com/AyakaRadiology/design-system/issues/64)) ([8f106fa](https://github.com/AyakaRadiology/design-system/commit/8f106faa46ed8bb89334214894a7cac7e2e633e6)), closes [#61](https://github.com/AyakaRadiology/design-system/issues/61)
* [agent-found] src/lint/tsx.ts:49 Lint `const view = <svg fill="&[#35](https://github.com/AyakaRadiology/design-system/issues/35);ff0000" />;` with L1 enab ([#65](https://github.com/AyakaRadiology/design-system/issues/65)) ([592d74f](https://github.com/AyakaRadiology/design-system/commit/592d74f8fc895a1fc68537b42749bc0e565fb5c7))
* [security] high: brace-expansion GHSA-qhr7-859c-m2p7 brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exha… ([#49](https://github.com/AyakaRadiology/design-system/issues/49)) ([dd9caed](https://github.com/AyakaRadiology/design-system/commit/dd9caed7a6a376a2f2555cb99ddfe26d20dc0d81)), closes [#44](https://github.com/AyakaRadiology/design-system/issues/44)
* feat: Panel gains description and contentClassName props ([#68](https://github.com/AyakaRadiology/design-system/issues/68)) ([dddf77d](https://github.com/AyakaRadiology/design-system/commit/dddf77de7e2a634365bccf29b973665472ccaba8)), closes [#23](https://github.com/AyakaRadiology/design-system/issues/23)

## [0.5.0](https://github.com/AyakaRadiology/design-system/compare/v0.4.0...v0.5.0) (2026-09-09)


### ⚠ BREAKING CHANGES

* Tailwind consumers must explicitly import @ayaka/design-system/tailwind.css after tailwindcss and before their voice. Plain CSS and voice URL consumers keep their existing imports.

### Features

* add deterministic Figma variable adapter ([#38](https://github.com/AyakaRadiology/design-system/issues/38)) ([d861d0b](https://github.com/AyakaRadiology/design-system/commit/d861d0b3d0fed03e3dedc192f013c66a5c853ab0))
* add shared glass surfaces and contrast gates ([#35](https://github.com/AyakaRadiology/design-system/issues/35)) ([e55907e](https://github.com/AyakaRadiology/design-system/commit/e55907ef8f2ae9f52ca018e73f88e1f5d2037c39))


### Bug Fixes

* handle Figma Float32 storage and record native canvas ([#42](https://github.com/AyakaRadiology/design-system/issues/42)) ([2c29f96](https://github.com/AyakaRadiology/design-system/commit/2c29f96563cdf6e12517a38edc1fdc699f8c4263))
* keep Tailwind directives out of runtime voice CSS ([#41](https://github.com/AyakaRadiology/design-system/issues/41)) ([178cce4](https://github.com/AyakaRadiology/design-system/commit/178cce4fde693507f5c9e8ade4f0d6cca96be03b))

## [0.4.0](https://github.com/AyakaRadiology/design-system/compare/v0.3.1...v0.4.0) (2026-09-07)


### Features

* **primitives:** unit separator, dialog surface fade, interactive BuildStamp, control attribute, reserved empty unit slot ([#33](https://github.com/AyakaRadiology/design-system/issues/33)) ([6c995f7](https://github.com/AyakaRadiology/design-system/commit/6c995f7a3ec04ebae16d67772fc73818d7273ea2))

## [0.3.1](https://github.com/AyakaRadiology/design-system/compare/v0.3.0...v0.3.1) (2026-09-07)


### Bug Fixes

* **numeric:** centre empty glyph and add emptyAlign ([#32](https://github.com/AyakaRadiology/design-system/issues/32)) ([95592cb](https://github.com/AyakaRadiology/design-system/commit/95592cb1b5b7602a2cf13547e5166b151bcc1281))
* **radio:** deterministic keyboard selection (arrows select, Space commits) ([#30](https://github.com/AyakaRadiology/design-system/issues/30)) ([cd41e46](https://github.com/AyakaRadiology/design-system/commit/cd41e46654f45eba02ccc10171963888b06c790e))

## [0.3.0](https://github.com/AyakaRadiology/design-system/compare/v0.2.1...v0.3.0) (2026-09-07)


### ⚠ BREAKING CHANGES

* **primitives:** Numeric's `hideUnitWhenEmpty` is replaced by `showUnitWhenEmpty`. The unit is now hidden by default while `value` is null; pass `showUnitWhenEmpty` for a readout whose unit is part of its label. No consumer had adopted `hideUnitWhenEmpty`.

### Bug Fixes

* **primitives:** quiet the empty Numeric readout and hide its unit by default ([#28](https://github.com/AyakaRadiology/design-system/issues/28)) ([95bc79b](https://github.com/AyakaRadiology/design-system/commit/95bc79b271115075abb05da347c01ed3d52a9565))

## [0.2.1](https://github.com/AyakaRadiology/design-system/compare/v0.2.0...v0.2.1) (2026-09-07)


### Bug Fixes

* **primitives:** radio selection follows focus, Numeric reserved unit slot and empty size, BuildStamp formatter ([#26](https://github.com/AyakaRadiology/design-system/issues/26)) ([c5c066d](https://github.com/AyakaRadiology/design-system/commit/c5c066d0ac3dd938652a7cd2cb30ba07019de0e7))

## [0.2.0](https://github.com/AyakaRadiology/design-system/compare/v0.1.2...v0.2.0) (2026-09-07)


### Features

* share exhibition readouts, dialog scrolling, and radio controls ([#24](https://github.com/AyakaRadiology/design-system/issues/24)) ([27eefd7](https://github.com/AyakaRadiology/design-system/commit/27eefd7084f816c09bd74758578a6d20bb045356))

## [0.1.2](https://github.com/AyakaRadiology/design-system/compare/v0.1.1...v0.1.2) (2026-09-06)


### Bug Fixes

* **react:** Select and Switch accept an accessible name ([#14](https://github.com/AyakaRadiology/design-system/issues/14)) ([4e49e5b](https://github.com/AyakaRadiology/design-system/commit/4e49e5ba9658ff502d5494eeddb52e0766cc1df4))

## [0.1.1](https://github.com/AyakaRadiology/design-system/compare/v0.1.0...v0.1.1) (2026-09-06)


### Bug Fixes

* **react:** Field treats null as no error, announces errors, keeps label case ([#12](https://github.com/AyakaRadiology/design-system/issues/12)) ([62592cf](https://github.com/AyakaRadiology/design-system/commit/62592cfdf97b9371ca98ba362f095e353119017b))

## 0.1.0 (2026-09-06)


### Features

* **lint:** contrast and ΔE gate over every voice ([#3](https://github.com/AyakaRadiology/design-system/issues/3)) ([89a26a5](https://github.com/AyakaRadiology/design-system/commit/89a26a5ab19874e94a3500b6c9db00a40388d0be))
* **lint:** design-lint CLI with rules L1–L7 ([#4](https://github.com/AyakaRadiology/design-system/issues/4)) ([f66192a](https://github.com/AyakaRadiology/design-system/commit/f66192ae8e380478f2498f50ed00c976bb3a3df0))
* **react:** Button, IconButton, Numeric, StatusPill, Toolbar, Panel ([#5](https://github.com/AyakaRadiology/design-system/issues/5)) ([fdfb174](https://github.com/AyakaRadiology/design-system/commit/fdfb17403bdd921a4b934ba06b1a378387490bed))
* **react:** Field, Input, Select, Switch, Dialog, Tooltip ([#6](https://github.com/AyakaRadiology/design-system/issues/6)) ([90a0dc6](https://github.com/AyakaRadiology/design-system/commit/90a0dc61ab8ff80ec6cf12ceff388415f8d9a119))
* **tokens:** bg-elevated, the surface a popover floats on ([#8](https://github.com/AyakaRadiology/design-system/issues/8)) ([1bf471c](https://github.com/AyakaRadiology/design-system/commit/1bf471ca2d291740c26ab8f18ed00f716f4b5bf9))
* **tokens:** schema, scales, base and biomonitor voices, tailwind mapping ([#1](https://github.com/AyakaRadiology/design-system/issues/1)) ([bb3219f](https://github.com/AyakaRadiology/design-system/commit/bb3219fe73c1f612e0b178638bf38311a2c411ad))


### Bug Fixes

* **lint:** flush stdout before exiting; export colour helpers ([#10](https://github.com/AyakaRadiology/design-system/issues/10)) ([6b1cbad](https://github.com/AyakaRadiology/design-system/commit/6b1cbada125ed7b7a08ae549109cb5675237043f))
