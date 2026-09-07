# Changelog

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
