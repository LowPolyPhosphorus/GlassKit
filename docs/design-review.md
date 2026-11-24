# Design review: GlassKit reference

Date: 2026-11-23

Revision 22 note: the registry grew from 122 to 125 tags. `gk-rich-text`, `gk-icon-label`, and `gk-grid-layout` translate Text, Label, and Grid into shadow-DOM components with styled copyable text, generic glyph labels, and declarative grid cells. The docs SwiftUI reference gallery now has 42 live examples, and the lab and 5185 panes exercise the same three elements. Counts stay registry-driven, and the flat-fill/hairline material rule is unchanged.

Revision 21 note: the registry grew from 119 to 122 tags. `gk-rotate-view`, `gk-lazy-vgrid`, and `gk-list-view` translate RotateGesture, LazyVGrid, and List into shadow-DOM components with pointer rotation feedback, virtualized vertical grid rows, and sectioned single or multiple selection. The docs SwiftUI reference gallery now has 39 live examples, and the lab and 5185 panes exercise the same three elements. Counts stay registry-driven, and the flat-fill/hairline material rule is unchanged.

Revision 20 note: the registry grew from 116 to 119 tags. `gk-drag-surface`, `gk-tap-counter`, and `gk-lazy-grid` translate DragGesture, TapGesture, and LazyHGrid into shadow-DOM components with pointer lifecycle events, counted goal progress, and virtualized horizontal grid columns. The docs SwiftUI reference gallery now has 36 live examples, and the lab and 5185 panes exercise the same three elements. Counts stay registry-driven, and the flat-fill/hairline material rule is unchanged.

Revision 19 note: the registry grew from 113 to 116 tags. `gk-paste-button`, `gk-multi-date-picker`, and `gk-lazy-stack` translate PasteButton, MultiDatePicker, and LazyVStack into shadow-DOM components with clipboard fallback, multi-date month grids, and virtualized row rendering. The docs SwiftUI reference gallery now has 33 live examples, and the lab and 5185 panes exercise the same three elements. Counts stay registry-driven, and the flat-fill/hairline material rule is unchanged.

Revision 18 note: the registry grew from 110 to 113 tags. `gk-scroll-navigator`, `gk-share-action`, and `gk-long-press` translate ScrollViewReader, ShareLink, and LongPressGesture into shadow-DOM components with scroll-proxy targets, a share sheet with copy status, and a held action with progress feedback. The docs SwiftUI reference gallery now has 30 live examples, and the lab and 5185 panes exercise the same three elements. Counts stay registry-driven, and the flat-fill/hairline material rule is unchanged.

Revision 17 note: the registry grew from 107 to 110 tags. `gk-adaptive-view`, `gk-timeline-view`, and `gk-canvas-view` translate ViewThatFits, TimelineView, and Canvas into shadow-DOM components with measured responsive fallbacks, periodic clock updates, and a pointer drawing surface. The docs SwiftUI reference gallery now has 27 live examples, and the lab and 5185 panes exercise the same three elements. Counts stay registry-driven, all layout is flat-fill/hairline, and the drawing surface uses a flat token colour.

Revision 16 note: the registry grew from 104 to 107 tags. `gk-outline-group`, `gk-group-box`, and `gk-labeled-content` translate OutlineGroup, GroupBox, and LabeledContent into shadow-DOM components with recursive selection, titled semantic grouping, and aligned key/value rows. The docs SwiftUI reference gallery now has 24 live examples, and the lab and 5185 panes exercise the same three elements. Counts stay registry-driven and the flat-fill/hairline material rule is unchanged.

Revision 15 note: the registry grew from 101 to 104 tags. `gk-control-group`, `gk-navigation-split-view`, and `gk-confirmation-dialog` translate ControlGroup, NavigationSplitView, and ActionSheet into shadow-DOM components with grouped actions, column drill-down, and stacked contextual choices. The docs SwiftUI reference gallery now has 21 live examples, and the lab and 5185 panes exercise the same three elements. All counts remain registry-driven, and the flat-fill/hairline surface rule is unchanged.

Revision 14 note: `gk-glass-panel` no longer paints a decorative gradient. Its specular cue is a one-pixel flat hairline, so every surface now uses flat fills and hairlines only; real blur remains the native HWND material in the Tauri host.

Revision 13 note: the registry grew from 98 to 101 tags. `gk-form`, `gk-disclosure-group`, and `gk-editable-list` translate Form, DisclosureGroup, and EditButton into shadow-DOM components with grouped controls, nested expansion, and explicit edit mode. The docs SwiftUI reference gallery now has 18 live examples with copyable SwiftUI and GlassKit code; the smart-home lab and 5185 Glass Kit pane gained a dedicated SwiftUI containers group for the new elements. The registry remains the source for all displayed counts, and no Apple assets or platform chrome were introduced.

Revision 12 note: the registry grew from 95 to 98 tags. `gk-grid-view`, `gk-navigation-stack`, and `gk-secure-field` translate LazyVGrid, NavigationStack, and SecureField into shadow-DOM components with selectable cells, root-to-detail routes, and masked text with reveal state. The docs SwiftUI reference gallery now has 15 live examples, and the smart-home lab Recipes room and the 5185 Glass Kit pane exercise the new elements alongside the rest of the registry. The HIG atlas window pattern now shows Windows minimize, maximize, and close glyphs instead of neutral dots. The registry remains the single source for every displayed count; Windows-native chrome and the no-Apple-assets rule are unchanged.

Revision 11 note: the registry grew from 89 to 95 tags. Fourteen SwiftUI-derived elements now sit beside the original core components and the 53-part HIG atlas: dates, progress, content-unavailable states, menus, text editing, async images, gauges, navigation links, alerts, color pickers, data tables, steppers, value pickers, and web links. The docs homepage gained a SwiftUI reference gallery with snippets taken from Apple's DocC JSON and live GlassKit translations; the smart-home lab Recipes room and the 5185 Glass Kit pane exercise the same elements. Counts are derived from the registry instead of duplicated in markup. Windows-native chrome, one preloaded Inter subset, and the no-Apple-assets rule are unchanged.

Revision 10 note: `@glasskit/ui` now covers every page in Apple’s HIG Components index with 81 registered tags — the original 28 plus 53 declarative atlas patterns. Sliders, text fields, color wells, and toggles were rebuilt against their HIG pages: filled tracks and lozenge thumbs, separate labels and placeholders with clear buttons, swatches with picker/drop feedback, and non-colour state cues for switches, checkboxes, and radios. The docs homepage renders the full registry lazily with search and scope filters; the smart-home lab gained an atlas room; and the 5185 Glass Kit pane renders the same registry. The docs font now ships as one preloaded Inter subset with `font-display: optional` instead of swapping seven subsets on every page, and atlas/radius boxes are padded and rounded. Shadow-root callbacks are guarded so upgrading existing elements cannot throw. Visual language is translated only: no Apple logos, assets, SF Symbols, or SF Pro binaries, and Windows-native behaviour is unchanged.

Revision 9 note: `@glasskit/ui` expanded from nine to 28 Web Components using the HIG patterns for status bars, snippets, notifications, live activities, controls, image views, charts, web views, boxes, disclosures, labels, collections, column views, path controls, search fields, sidebars, tab bars, and token fields. The docs desktop lab gained a "HIG patterns" room, and the 5185 settings sample gained a matching exercise pane. All new components keep Windows-native behavior, shadow-DOM encapsulation, semantic tokens, and `gk-*` events; no Apple assets or chrome were imported.

Revision 8 note: the settings sample now follows Apple's Human Interface Guidelines at the visual-pattern level: a leading sidebar split view, a search field in the toolbar, compact icon-and-label navigation, pale-blue selection, grouped boxes and lists with inset separators and trailing controls, and text-style secondary buttons. The shell remains Windows-native with Windows window controls, a taskbar, right-click menus, keyboard shortcuts, and real DWM material; no Apple chrome, symbols, fonts, or assets were imported.

Revision 7 note: the settings sample now exercises the full GlassKit surface through a dedicated Glass Kit pane: all nine Web Components, typed token exports and CSS variables, all 12 motion recipes, spring physics helpers, reduced-motion overrides, component events, and every native material command. Segment labels now provide accessible names, and list-row subtitles render from the `subtitle` attribute or the `subtitle` slot.

Revision 6 note: the settings sample was corrected from a macOS-fidelity study to a Windows-native Settings app. The visual language stays calm and layered, but the shell now uses Windows window controls, a draggable/resizable window, a taskbar, right-click menus, and keyboard shortcuts. No macOS chrome remains in the sample.

Revision 5 note: the docs are now an Astro + TypeScript site with a content-rich homepage and three deep pages. Tokens, materials, and motion are overview sections on the homepage; Practice, Native, and Motion carry the detailed material. The right “On this page” rail and the phone preview were removed. The Playground became a large draggable/resizable Windows smart-home desktop lab, and Inter is self-hosted as the primary typeface. The separate settings sample on port 5185 is a Windows app that uses Apple-inspired visual craft with native window behaviour and is no longer mentioned in the docs.

Revision 4 note: the long single page was split into eight pages with one top-level navigation surface. That split was superseded by Revision 5.

Revision 3 note: decorative multi-stop gradients were removed in favour of flat fills and hairlines. The supplied original GlassKit light/dark logo PNGs are the brand mark. Apple font names remain fallback-only; no Apple font binaries are bundled or served.

## Scope

This review covers the Apple design corpus as a **reference for visual qualities only**. GlassKit remains a Windows design system: the taskbar, tray, right-click menus, keyboard shortcuts, snapping, and native DWM material are preserved.

The separate `apps/example-settings` sample applies the same visual qualities to a Windows-native shell. It explores Settings navigation, grouped controls, and appearance behaviour while keeping Windows window controls, a taskbar, right-click menus, and keyboard shortcuts. It is not linked from the docs.

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

All groups were enumerated; the pages most relevant to a web-based design-system reference were read in full: design principles, accessibility, typography, color, dark mode, layout, materials, motion, writing, branding, sidebars, split views, toolbars, buttons, lists and tables, scroll views, boxes, labels, path controls, search fields, tab bars, token fields, disclosure controls, collections, column views, status bars, snippets, notifications, live activities, controls, image views, charts, and web views.

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
- **Depth:** hairline borders, flat article surfaces, concentric radii, and one soft product shadow on the desktop lab. Translucency is limited to functional chrome and explicit material samples. Glass-panel specular cues are flat one-pixel hairlines in every theme.
- **Motion:** state changes only, 80–360 ms, no entrance choreography, no parallax, no blur transitions. The motion section and page are deliberate interactive demonstrations with the same shared recipes.
- **Voice:** short, literal, and useful. Copy says what each package or control does and when to use it. No "revolutionary", "seamless", or similar filler ([Writing](https://developer.apple.com/design/human-interface-guidelines/writing), [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion)).

## Interactive desktop lab

The homepage lab is a Windows desktop canvas with a draggable, resizable Home Control window. It has no taskbar yet, by design: the docs demonstrate the visual layer, while the native host owns real Windows chrome. Inside the window, the user can switch rooms, change scenes, toggle devices, move sliders, use segmented controls, add a device, and read the resulting component events. It exercises `gk-button`, `gk-toggle`, `gk-slider`, `gk-segmented`, `gk-text-field`, `gk-badge`, `gk-list-row`, `gk-toolbar`, and `gk-glass-panel`, plus a "HIG patterns" room covering the expanded layout, navigation, status, notification, live-activity, image, chart, and web-view components.

## Settings sample boundary

`apps/example-settings` is a standalone Vite sample on port 5185. It is a Windows Settings app with Apple-inspired visual craft: a real title bar with minimise/maximise/close controls, a draggable and resizable window, a taskbar, right-click menus, keyboard shortcuts, grouped inset rows, search, and light/dark/auto appearance. It uses the same GlassKit tokens and components plus original rounded-stroke icons. It contains no Apple logo, no SF Symbols, no Apple font binaries, no product imagery, no traffic-light buttons, and no macOS menu bar or Dock. The docs do not link to it or describe it.

## Explicitly excluded from GlassKit docs and components

No Apple logos, product imagery, SF Symbols, traffic-light controls, menu bar, Dock, edge-swipe gestures, sheets with grabbers, or Apple-only service patterns. Apple font names are used only as local system fallbacks; no Apple font binaries are bundled or served. The icon sprite and the GlassKit logo PNGs are original work. Apple material is used only to inform restraint, hierarchy, legibility, and craft.

## Verification

- `npm run build` and `npm run typecheck` must pass.
- Browser smoke test must confirm four pages, one active top-nav item, twelve motion recipes, live controls, theme switching without a light flash, the draggable/resizable desktop lab, the HIG patterns room, responsive navigation, icon sprite loading, both logo PNGs loading, and no console errors.
- The settings sample must be reachable only on port 5185, with working sidebar navigation, search filtering, theme modes, accent colours, wallpaper switching, slider readouts, Windows window controls, window dragging/resizing, a taskbar, right-click menus, keyboard shortcuts, and native status.
- Lighthouse accessibility, best practices, and SEO must remain at 1.00 on all four pages in both light and dark themes.
- The native host command remains `cd apps/native-host/src-tauri && cargo tauri dev`.
