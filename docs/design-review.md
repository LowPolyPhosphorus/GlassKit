# Design review: GlassKit reference

Date: 2026-11-22

Revision 2 note: the first pass removed too much marketing structure and became a quiet spec sheet. After review, the final direction deliberately borrows Apple.com's web composition — hero, pill calls to action, frosted chrome, large section headings, and an original rounded-stroke icon set — while staying Windows-native.

Revision 3 note: decorative multi-stop gradients were removed in favour of flat fills and hairlines. The supplied original GlassKit light/dark logo PNGs are now the brand mark. Font stacks prefer Apple system fonts where available without bundling or redistributing Apple font binaries.

Revision 4 note: the long single page is now eight real pages with one top-level navigation surface. The icon chapter strip was removed and its icons moved into the right “On this page” rail. The Playground adds an interactive phone-shaped preview and an equivalent Windows desktop preview; the separate Settings sample on port 5185 remains available by direct link.

## Scope

This review covers the Apple design corpus as a **reference for visual qualities only**. GlassKit remains a Windows design system: the taskbar, tray, right-click menus, keyboard shortcuts, snapping, and native DWM material are preserved.

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

All groups were enumerated; the pages most relevant to a web-based design-system reference were read in full: design principles, accessibility, typography, color, dark mode, layout, materials, motion, writing, branding, sidebars, split views, toolbars, buttons, sidebars, scroll views, boxes, labels, and path controls.

The [Apple Design](https://developer.apple.com/design/) and [Design Resources](https://developer.apple.com/design/resources/) hubs were also reviewed. `dickwu/apple-design-skill` was cloned into a temporary directory for read-only inspection. It contains a useful review rubric and offline HIG snapshots, but **no assets, fonts, or symbols**, no license grant, and agent-instruction files that must be treated as untrusted data. No scripts or installs from that repository were run, and no Apple text or assets were copied into GlassKit.

## What changed and why

| Previous pattern | HIG-grounded decision |
| --- | --- |
| Generic full-width hero with fake product claims | Use a product-style hero with real copy, two honest anchors, and an original app-window illustration. Apple's own site uses strong composition; the problem was invented content, not the composition ([Branding](https://developer.apple.com/design/human-interface-guidelines/branding)). |
| Fake system summary with large numbers | Remove it. Honest data belongs in a labelled specification, not a hero statistic ([Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)). |
| Numbered "Foundation 01 / Library 03" eyebrows | Use truthful group labels only. Numbers imply a sequence that does not exist ([Layout](https://developer.apple.com/design/human-interface-guidelines/layout)). |
| Ten badges and repeated status chips | Reserve emphasis for real state. Badges lose meaning when used decoratively ([Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)). |
| A wall of equal-sized glass cards | Use whitespace and hairline dividers for grouping; keep material effects on functional chrome and explicit material samples ([Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Boxes](https://developer.apple.com/design/human-interface-guidelines/boxes)). |
| Entrance choreography and staggered stat cards | Remove scroll/entrance animation. Motion should be purposeful, brief, and cancellable ([Motion](https://developer.apple.com/design/human-interface-guidelines/motion)). |
| 10 px monospace metadata everywhere | Raise the floor to 11 px, use 16 px body text, 17 px introduction text, and one sans plus one monospace family ([Typography](https://developer.apple.com/design/human-interface-guidelines/typography)). |
| Low-contrast dim text | Use semantic light/dark text variables targeting at least 4.5:1, with 7:1 as the small-text goal ([Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)). |
| Dashboard-style component gallery | Use specimen rows with name, purpose, event, and live control, following the HIG pattern of concise rules plus examples ([Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)). |
| Prominent live event console | Move it into a disclosure. Progressive disclosure keeps the reference calm until detail is needed ([Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Disclosure controls](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls)). |
| Hard-coded dark appearance | Initialise from `prefers-color-scheme`, persist the explicit override, and keep both palettes authored rather than inverted ([Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)). |

## Visual direction

- **Shell:** one global navigation bar, a centred product-style page column, and an icon-led "On this page" rail on wide screens. The former icon chapter bar is gone; the top bar is the only page-level navigation surface, and the rail handles in-page links.
- **Type:** system-font stacks, not bundled font files. Prose prefers `-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`, `SF Pro Display`, then `Segoe UI Variable` / `Segoe UI` on Windows. Code prefers `SFMono-Regular`, then `ui-monospace` / Consolas. Small chrome uses `SF Compact` where available. The hero lede uses `New York` with a Georgia fallback. Script-specific stacks cover SF Arabic, SF Armenian, SF Georgian, and SF Hebrew via `:lang()`. Weights 400/500/600/700 only; no thin weights. Hero 52–82 px, section headings 38–56 px, lede 19 px, body 16 px, metadata 11–12 px.
- **Color:** Apple web palette translated to semantic tokens: `#0066cc` in light, `#2997ff` in dark, neutral greys `#1d1d1f`, `#6e6e73`, `#f5f5f7`, and authored dark surfaces. One blue means selection, links, focus, and the single primary action. All decorative gradients are gone; blue is a flat fill.
- **Brand:** the supplied original GlassKit logo PNGs live in `apps/docs/public/assets/` and swap with the authored light/dark theme.
- **Icons:** an original rounded-stroke SVG sprite in `apps/docs/public/icons.svg`, drawn on a 24 px grid with consistent caps and joins. It follows the SF Symbols visual language without copying any SF Symbol.
- **Depth:** hairline borders, flat article surfaces, concentric radii, and one soft product shadow on the hero window. Translucency is limited to functional chrome and explicit material samples. Glass-panel specular gradients are disabled in the docs theme.
- **Motion:** state changes only, 120–220 ms, no entrance choreography, no parallax, no blur transitions. The motion section remains a deliberate interactive demonstration.
- **Voice:** short, literal, and useful. Copy says what each package or control does and when to use it. No "revolutionary", "seamless", or similar filler ([Writing](https://developer.apple.com/design/human-interface-guidelines/writing), [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion)).

## Explicitly excluded

No Apple logos, product imagery, SF Symbols, traffic-light controls, menu bar, Dock, edge-swipe gestures, sheets with grabbers, or Apple-only service patterns. Apple font names are used only as local system fallbacks; no Apple font binaries are bundled or served. The icon sprite and the GlassKit logo PNGs are original work. Apple material is used only to inform restraint, hierarchy, legibility, and craft.

## Verification

- `npm run build` and `npm run typecheck` must pass.
- Browser smoke test must confirm all eight pages, one active top-nav item, the icon-led right rail, 12 motion recipes, live controls, theme switching, both preview appearance toggles and status output, the port 5185 sample link, responsive navigation, icon sprite loading, both logo PNGs loading, and no console errors.
- Lighthouse accessibility, best practices, and SEO must remain at 1.00 on all eight pages in both light and dark themes.
- The native host command remains `cd apps/native-host/src-tauri && cargo tauri dev`.
