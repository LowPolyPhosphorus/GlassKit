# Glass Kit

**Apple-inspired design system for Windows apps. Tauri components, design tokens, shared motion physics, and real DWM glass — macOS-style visuals with native Windows behaviour.**

Glass Kit is a monorepo for building Windows desktop apps that look and feel calm, layered, and Apple-inspired while keeping normal Windows interactions: taskbar, tray, right-click menus, keyboard shortcuts, window snapping, and no Mac gestures.

> Glass Kit is not affiliated with Apple. Do not ship Apple logos, SF Pro fonts, or Apple marketing assets. Use it as a visual inspiration system.

## Packages

- `@glasskit/tokens` — colours, typography, spacing, radii, materials, and motion tokens.
- `@glasskit/ui` — reusable Web Components: glass panel, button, toggle, segmented control, list row, text field, slider, badge, and toolbar.
- `@glasskit/motion` — shared easing curves, analytic spring physics, WAAPI keyframes, and 12 named motion recipes.
- `@glasskit/native` — browser-safe bridge to the native Tauri commands.
- `glasskit-material` — Rust/Tauri helper for real native DWM glass, rounded corners, and Tauri commands.

## Apps

- `apps/docs` — full interactive showcase and design guidelines.
- `apps/example-settings` — example Windows Settings replacement built with Glass Kit.
- `apps/native-host` — minimal Tauri 2 host that applies real DWM glass and registers the native commands.

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

The native material crate and Tauri host are tested separately:

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
cargo test --manifest-path packages/material-tauri/Cargo.toml
cargo check --manifest-path apps/native-host/src-tauri/Cargo.toml
```

To run the Settings demo with real native glass:

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
cargo install tauri-cli --version "^2" --locked
cd apps/native-host/src-tauri
cargo tauri dev
```

## Status

Working MVP:

- `@glasskit/tokens` generates CSS variables and typed token exports from `tokens.json`.
- `@glasskit/motion` has analytic springs, WAAPI keyframe sampling, named recipes, and reduced-motion handling.
- `@glasskit/ui` provides nine Web Components with every major state demoed live.
- `@glasskit/native` plus the `tauri` feature of `glasskit-material` connect the page to real DWM material.
- The docs app is a full interactive showcase: token explorer, material gallery, component gallery with event log, all 12 motion recipes, a spring physics lab, native material controls, and design rules.
- `apps/example-settings` is a Windows Settings replacement concept built from the same packages.
- `apps/native-host` wires the browser bridge to real DWM blur, acrylic, and rounded corners in Tauri.
