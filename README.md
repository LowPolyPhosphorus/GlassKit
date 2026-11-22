# Glass Kit

**Apple-inspired design system for Windows apps. Tauri components, design tokens, shared motion physics, and real DWM glass — macOS-style visuals with native Windows behaviour.**

Glass Kit is a monorepo for building Windows desktop apps that look and feel calm, layered, and Apple-inspired while keeping normal Windows interactions: taskbar, tray, right-click menus, keyboard shortcuts, window snapping, and no Mac gestures.

> Glass Kit is not affiliated with Apple. Do not ship Apple logos, SF Pro fonts, or Apple marketing assets. Use it as a visual inspiration system.

## Packages

- `@glasskit/tokens` — colours, typography, spacing, radii, materials, and motion tokens.
- `@glasskit/ui` — reusable components: glass panel, sidebar, list row, segmented control, toggle, toolbar, inspector.
- `@glasskit/motion` — shared easing curves, spring presets, and named motion recipes.
- `glasskit-material` — Rust/Tauri helper for real native DWM glass and rounded corners.

## Apps

- `apps/docs` — component gallery and design guidelines.
- `apps/example-settings` — example Windows Settings replacement built with Glass Kit.

## Principles

- Neutral glass, not fake colour blobs.
- Real native blur; CSS `backdrop-filter` alone cannot sample the Windows desktop through a transparent WebView2 window.
- Subtle hairlines and cards; no fake window outlines.
- Windows-native behaviour, Apple-inspired visuals.
- Reduced motion is a first-class token.

## Reference map

[docs/APPLE_REFERENCE_MAP.md](docs/APPLE_REFERENCE_MAP.md) tracks which Apple frameworks and design docs inform each Glass Kit package, and which Apple-specific interactions we deliberately leave out.

## Quick start

```powershell
npm install
npm run build
npm run dev:docs
npm run dev:settings
```

The native material crate is tested separately:

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
cargo test --manifest-path packages/material-tauri/Cargo.toml
```

## Status

Working MVP:

- `@glasskit/tokens` generates CSS variables and typed token exports from `tokens.json`.
- `@glasskit/motion` has analytic springs, WAAPI keyframe sampling, named recipes, and reduced-motion handling.
- `@glasskit/ui` provides Web Components: glass panel, button, toggle, segmented control, and list row.
- `glasskit-material` applies real DWM blur and rounded corners without the focus/bevel regressions.
- Docs and example Settings demos are wired to the local packages.
