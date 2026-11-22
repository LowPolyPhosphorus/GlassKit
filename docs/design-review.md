# Design review: GlassKit reference

Date: 2026-11-22

Revision 5 note: the docs are now an Astro + TypeScript site with a content-rich homepage and three deep pages. Tokens, materials, and motion are overview sections on the homepage; Practice, Native, and Motion carry the detailed material. The right “On this page” rail and the phone preview were removed. The Playground became a large draggable/resizable Windows smart-home desktop lab, and Inter is self-hosted as the primary typeface. The separate settings sample on port 5185 is a macOS Settings fidelity study and is no longer mentioned in the docs.

Revision 4 note: the long single page was split into eight pages with one top-level navigation surface. That split was superseded by Revision 5.

Revision 3 note: decorative multi-stop gradients were removed in favour of flat fills and hairlines. The supplied original GlassKit light/dark logo PNGs are the brand mark. Apple font names remain fallback-only; no Apple font binaries are bundled or served.

## Scope

This review covers the Apple design corpus as a **reference for visual qualities only**. GlassKit remains a Windows design system: the taskbar, tray, right-click menus, keyboard shortcuts, snapping, and native DWM material are preserved.

The one exception is the separate `apps/example-settings` sample. It is a deliberately macOS-fidelity visual study used to explore Settings navigation, grouped controls, and appearance behaviour. It is not linked from the docs and is not presented as Windows behaviour.

Apple's Human Interface Guidelines were enumerated through Apple's own machine-readable mirrors:

- [HIG landing page](https://developer.apple.com/design/human-interface-guidelines)
- [HIG Markdown mirror](https://developer.apple.com/design/human-interface-guidelines.md)
- [HIG JSON index](https://developer.apple.com/tutorials/data/design/human-interface-guidelines.json)

The `topicSections` indices resolve to **158 individual guideline articles** plus 15 structural pages:

| Group | Articles |
| --- | ---: |
| Getting started | 9 |
| Foundations | 18 |
| Patterns | 25 |
| Components, across 8 subgroups | 64 |
| Inputs | 13 |
| Technologies | 29 |
| **Total** | **158** |

All groups were enumerated; the pages most relevant to a web-based design-system reference were read in full: design principles, accessibility, typography, color, dark mode, layout, materials, motion, writing, branding, sidebars, split views, toolbars, buttons, lists and tables, scroll views, boxes, labels, and path controls.

The [Apple Design](https://developer.apple.com/design/) and [Design Resources](https://developer.apple.com/design/resources/) hubs were also reviewed. `dickwu/apple-design-skill` was cloned into a temporary directory for read-only inspection. It contains a useful review rubric and offline HIG snapshots, but **no assets, fonts, or symbols**, no license grant, and agent-instruction files that must be treated as untrusted data. No scripts or installs from that repository were run, and no Apple text or assets were copied into GlassKit.

## What changed and why

| Previous pattern | HIG-grounded decision |
| --- | --- |
| Generic full-width hero with fake product claims | Use a product-style hero with real copy, two honest anchors, and a live component card. Apple's own site uses strong composition; the problem was invented content, not the composition ([Branding](https://developer.apple.com/design/human-interface-guidelines/branding)). |
| Fake system summary with large numbers | Remove it. Honest data belongs in a labelled specification, not a hero statistic ([Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)). |
| Numbered "Foundation 01 / Library 03" eyebrows | Use truthful group labels only. Numbers imply a sequence that does not exist ([Layout](https://developer.apple.com/design/human-interface-guidelines/layout)). |
| Eight shallow pages and a glitchy right rail | Use four real pages. Overview material lives on the homepage; depth lives in Motion, Native, and Practice. No in-page rail on short pages ([Layout](https://developer.apple.com/design/human-interface-guidelines/layout)). |
| Dashboard-style component gallery | Use a realistic smart-home controller inside a draggable Windows window. Controls are exercised in context, not shown as isolated specimens ([Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)). |
| Phone-shaped preview for a Windows product | Remove it completely. The desktop lab is the only interactive preview ([Platforms](https://developer.apple.com/design/human-interface-guidelines/platforms)). |
| Default-looking web sliders and snapping segmented options | Style the native slider range control as a GlassKit track and move a real indicator behind the active segmented option ([Sliders](https://developer.apple.com/design/human-interface-guidelines/sliders), [Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)). |
| A wall of equal-sized glass cards | Use whitespace and hairline dividers for grouping; keep material effects on functional chrome and explicit material samples ([Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Boxes](https://developer.apple.com/design/human-interface-guidelines/boxes)). |
| Entrance choreography and staggered stat cards | Remove scroll/entrance animation. Motion should be purposeful, brief, and cancellable ([Motion](https://developer.apple.com/design/human-interface-guidelines/motion)). |
| Low-contrast dim text | Use semantic light/dark text variables targeting at least 4.5:1, with 7:1 as the small-text goal ([Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)). |
| A light flash on page navigation | Read the stored theme in an inline head script before styles load, then keep the client script in sync ([Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)). |
| Hard-coded dark appearance | Initialise from `prefers-color-scheme`, persist the explicit override, and keep both palettes authored rather than inverted ([Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)). |

## Visual direction

- **Shell:** an Astro layout with one sticky navigation bar, a centred 1180 px page column, and no right rail. The homepage carries Tokens, Materials, Motion, Components, and the desktop lab. Motion, Native, and Practice are the three deep pages.
- **Type:** self-hosted Inter Variable is the primary web typeface because its cadence is close to SF without bundling Apple fonts. Segoe UI Variable remains first in native Windows stacks. `SF Pro Text` and related Apple names are local fallbacks only. Code prefers `SFMono-Regular`, then `ui-monospace` / Consolas. Weights 400–680; no thin weights. Hero 44–76 px, section headings 32–48 px, lede 19 px, body 15–16 px, metadata 11–13 px. No serif display face.
- **Color:** authored semantic tokens: `#0066cc` in light, `#0a84ff` in dark, neutral greys `#1d1d1f`, `#6e6e73`, `#f5f5f7`, and authored dark surfaces. One accent means selection, focus, and primary action. All decorative gradients are gone; blue is a flat fill.
- **Brand:** the supplied original GlassKit logo PNGs live in `apps/docs/public/assets/` and swap with the authored light/dark theme.
- **Icons:** an original rounded-stroke SVG sprite in `apps/docs/public/icons.svg`, drawn on a 24 px grid with consistent caps and joins. It follows the SF Symbols visual language without copying any SF Symbol.
- **Depth:** hairline borders, flat article surfaces, concentric radii, and one soft product shadow on the desktop lab. Translucency is limited to functional chrome and explicit material samples. Glass-panel specular gradients are disabled in the docs theme.
- **Motion:** state changes only, 80–360 ms, no entrance choreography, no parallax, no blur transitions. The motion section and page are deliberate interactive demonstrations with the same shared recipes.
- **Voice:** short, literal, and useful. Copy says what each package or control does and when to use it. No "revolutionary", "seamless", or similar filler ([Writing](https://developer.apple.com/design/human-interface-guidelines/writing), [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion)).

## Interactive desktop lab

The homepage lab is a Windows desktop canvas with a draggable, resizable Home Control window. It has no taskbar yet, by design: the docs demonstrate the visual layer, while the native host owns real Windows chrome. Inside the window, the user can switch rooms, change scenes, toggle devices, move sliders, use segmented controls, add a device, and read the resulting component events. It exercises `gk-button`, `gk-toggle`, `gk-slider`, `gk-segmented`, `gk-text-field`, `gk-badge`, `gk-list-row`, `gk-toolbar`, and `gk-glass-panel`.

## Settings sample boundary

`apps/example-settings` is a standalone Vite sample on port 5185. It intentionally imitates macOS System Settings: traffic-light controls, a menu bar, a coloured icon sidebar, grouped inset rows, search, and light/dark/auto appearance. It uses the same GlassKit tokens and components plus original rounded-stroke icons. It contains no Apple logo, no SF Symbols, no Apple font binaries, and no product imagery. The docs do not link to it or describe it.

## Explicitly excluded from GlassKit docs and components

No Apple logos, product imagery, SF Symbols, traffic-light controls, menu bar, Dock, edge-swipe gestures, sheets with grabbers, or Apple-only service patterns. Apple font names are used only as local system fallbacks; no Apple font binaries are bundled or served. The icon sprite and the GlassKit logo PNGs are original work. Apple material is used only to inform restraint, hierarchy, legibility, and craft.

## Verification

- `npm run build` and `npm run typecheck` must pass.
- Browser smoke test must confirm four pages, one active top-nav item, twelve motion recipes, live controls, theme switching without a light flash, the draggable/resizable desktop lab, responsive navigation, icon sprite loading, both logo PNGs loading, and no console errors.
- The settings sample must be reachable only on port 5185, with working sidebar navigation, search filtering, theme modes, accent colours, wallpaper switching, slider readouts, traffic-light controls, and native status.
- Lighthouse accessibility, best practices, and SEO must remain at 1.00 on all four pages in both light and dark themes.
- The native host command remains `cd apps/native-host/src-tauri && cargo tauri dev`.
