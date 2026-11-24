# Glass Kit

**Apple-inspired design system for Windows apps. Tauri components, design tokens, shared motion physics, and real DWM glass — considered visual craft with native Windows behaviour.**

Glass Kit is a monorepo for building Windows desktop apps that look and feel calm, layered, and Apple-inspired while keeping normal Windows interactions: taskbar, tray, right-click menus, keyboard shortcuts, window snapping, and no Mac gestures.

> Glass Kit is not affiliated with Apple. Do not ship Apple logos, SF Pro fonts, or Apple marketing assets. Use it as a visual inspiration system.

## Packages

- `@glasskit/tokens` — colours, typography, spacing, radii, materials, and motion tokens.
- `@glasskit/ui` — 122 registered Web Components covering all 77 topics in Apple’s HIG Components index, plus SwiftUI-derived views and Glass Kit material surfaces.
- `@glasskit/motion` — shared easing curves, analytic spring physics, WAAPI keyframes, and 12 named motion recipes.
- `@glasskit/native` — browser-safe bridge to the native Tauri commands.
- `glasskit-material` — Rust/Tauri helper for real native DWM glass, rounded corners, and Tauri commands.

## Apps

- `apps/docs` — Astro + TypeScript docs with homepage overviews, a searchable component atlas, three deep pages, and an interactive Windows desktop lab.
- `apps/example-settings` — standalone Windows Settings sample that applies Apple-inspired visual craft with native window chrome, taskbar, right-click menus, and keyboard shortcuts.
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
- `@glasskit/ui` provides 122 registered Web Components — 69 core pieces (28 original plus 41 SwiftUI-derived) and a 53-part HIG atlas covering every Components topic — with sliders, text fields, color wells, and toggles rebuilt against their HIG pages and every major state demoed live.
- `@glasskit/native` plus the `tauri` feature of `glasskit-material` connect the page to real DWM material.
- The docs app is an Astro site with token, material, and component overviews on the homepage; a lazy, searchable atlas of the full registry; detailed Motion, Native, and Practice pages; all 12 motion recipes; a spring physics lab; native material controls; and a draggable smart-home desktop lab with its own atlas room.
- `apps/example-settings` is a Windows-native Settings sample with an HIG-informed sidebar split view, compact icon-and-label navigation, grouped boxes and lists with trailing controls, search, appearance controls, draggable/resizable window chrome, a taskbar, right-click menus, original icons, and a Glass Kit page that exercises all 122 registered components, typed tokens, all 12 motion recipes, spring physics, reduced-motion overrides, HIG pattern events, and every native material command.
- `apps/native-host` wires the browser bridge to real DWM blur, acrylic, and rounded corners in Tauri.
