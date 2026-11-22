# Design review: GlassKit reference

Date: 2026-11-22

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
| Full-width marketing hero with two pill CTAs | Start with an H1, one-sentence abstract, and real content. Branding defers to content ([Branding](https://developer.apple.com/design/human-interface-guidelines/branding)). |
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

- **Shell:** persistent two-level sidebar, sticky 56 px top bar, centred article column, and an "On this page" rail on wide screens. The rail and sidebar both expose the current section with a visible selected state and `aria-current`.
- **Type:** `Segoe UI Variable` / `Segoe UI` / `system-ui` for UI and prose, one monospace stack for code and token names. Weights 400/500/600 only; no thin weights. Heading sizes 52/30/17/15 px, body 16 px, metadata 11–12 px.
- **Color:** neutral canvases with adaptive light/dark variables, one blue accent for selection, links, focus, and the single primary action. Status colors stay in the component gallery where they carry meaning.
- **Depth:** hairline borders, flat article surfaces, concentric radii, and no layered shadows. The only translucent layer is functional chrome; article content is opaque.
- **Motion:** state changes only, 120–180 ms, no entrance choreography, no parallax, no blur transitions. The motion section remains a deliberate interactive demonstration.
- **Voice:** short, literal, and useful. Copy says what each package or control does and when to use it. No "revolutionary", "seamless", or similar filler ([Writing](https://developer.apple.com/design/human-interface-guidelines/writing), [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion)).

## Explicitly excluded

No Apple logos, product imagery, SF Pro, SF Mono, New York, SF Symbols, traffic-light controls, menu bar, Dock, edge-swipe gestures, sheets with grabbers, or Apple-only service patterns. Apple material is used only to inform restraint, hierarchy, legibility, and craft.

## Verification

- `npm run build` and `npm run typecheck` must pass.
- Browser smoke test must confirm all seven sections, 12 motion recipes, live controls, theme switching, and no console errors.
- Lighthouse accessibility must improve from the previous 0.96, with the low-contrast findings removed.
- The native host command remains `cd apps/native-host/src-tauri && cargo tauri dev`.
