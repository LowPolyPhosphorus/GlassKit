# Apple Reference Map

Glass Kit studies Apple's documentation as a **design and behaviour reference**. It does not ship Apple assets, SF Pro fonts, SF Symbols, Apple logos, or macOS interaction rules. The target stays Windows-native: taskbar, tray, right-click menus, keyboard shortcuts, snapping, and no Mac gestures.

Source: <https://developer.apple.com/documentation/>

## Priority tiers

### Tier 0 — study first

These directly define the look and feel Glass Kit needs.

| Apple reference | What to extract | Glass Kit home |
|---|---|---|
| Human Interface Guidelines | Clarity, deference, depth, hierarchy, calm surfaces | `DESIGN.md` |
| HIG Components index | Every component topic, its terminology, state cues, and layout guidance | `@glasskit/ui` (`COMPONENT_REGISTRY`) |
| Adopting Liquid Glass | Material layers, specular edges, adaptable glass, continuity | `DESIGN.md`, `@glasskit/tokens`, `glasskit-material` |
| Interface fundamentals | Windows, views, controls, layout vocabulary | `@glasskit/ui` |
| Animation and motion | Meaningful motion, continuity, reduced motion | `@glasskit/motion` |
| SwiftUI Animations | `withAnimation`, transitions, matched geometry, phase/keyframe animation | `@glasskit/motion` |
| Core Animation | Layer model, springs, keyframes, timing control | `@glasskit/motion` |
| Accessibility | VoiceOver, Dynamic Type, Reduce Motion | All packages |
| Appearance customization | Light/dark adaptation, semantic colours | `@glasskit/tokens` |

### Tier 1 — useful once the core exists

| Apple reference | What to extract | Glass Kit home |
|---|---|---|
| SwiftUI | Declarative component API, state-driven views | `@glasskit/ui` |
| UIKit | View lifecycle, property animators, precise controls | `@glasskit/ui`, `@glasskit/motion` |
| AppKit | Desktop window and menu patterns | `glasskit-material`, `apps/example-settings` |
| WidgetKit | Small glanceable surfaces and Live Activities | Future widget package |
| TipKit | Unobtrusive onboarding and hints | Future `@glasskit/tips` |
| App Intents / App Clips | Entry points outside the main app | Future integration docs |
| Core Graphics | Paths, gradients, 2D drawing | CSS/SVG/Canvas primitives |
| Core Image | Filter pipeline thinking | Material effects roadmap |
| Image I/O | Asset handling pipeline | Docs only |
| Core Text / TextKit | Typographic hierarchy and layout | `@glasskit/tokens` |
| SF Symbols | Consistent symbol grammar, weights, optical sizing | Open-source icon set, not Apple assets |
| Localization / RTL | Mirrored layouts and locale-safe spacing | `@glasskit/ui` |
| Drag and Drop | Windows-native drag/drop semantics with Apple-like feedback | `@glasskit/ui` |
| Focus-based navigation | Keyboard focus as a first-class state | `@glasskit/ui` |
| Share sheets | Shared action surfaces | Future component |
| Haptics | Semantic feedback abstraction; Windows support varies | Future abstraction |

### Tier 2 — study later, mostly not applicable

These are relevant to Apple's ecosystem but low priority for a Windows desktop UI kit:

- SpriteKit, SceneKit, RealityKit, ARKit — games, 3D, spatial content.
- Metal, MetalKit, Metal Performance Shaders — custom GPU rendering. Useful only if we add shader-based glass distortion.
- Core Motion — iPhone/iPad sensor data, not desktop UI.
- Vision — image analysis, not UI.
- PencilKit, handwriting recognition — Apple Pencil specific.
- PDFKit, AVKit/AVFoundation — app-specific content viewers.
- GameplayKit — game logic, not UI.
- visionOS, watchOS, tvOS, ClockKit — study the design language, not the interactions or APIs.

## HIG Components index coverage

The Components index has 77 topic pages. All 77 are represented in Glass Kit by 104 registered tags: 51 core elements (28 original plus 23 SwiftUI-derived) and 53 declarative atlas patterns. Some topics have more than one tag where a family needs both a reusable primitive and a translated pattern, such as sidebars plus sidebar items or lists and tables plus list rows.

Each `COMPONENT_REGISTRY` entry carries its HIG source page. The same registry renders the docs homepage atlas, the smart-home lab atlas, and the 5185 Settings Glass Kit pane, so coverage is exercised in all three surfaces.

## SwiftUI-derived component coverage

The 23 SwiftUI-derived elements translate declarative view behaviour into shadow-DOM Web Components. Their code examples on the docs homepage come from Apple's DocC JSON for each linked page; the GlassKit half shows the equivalent markup and event. No Apple assets, symbols, or platform chrome are shipped.

| SwiftUI source | Glass Kit element | Extracted behaviour |
|---|---|---|
| [DatePicker](https://developer.apple.com/documentation/swiftui/datepicker) | `gk-date-picker` | Bounds, displayed components, committed `gk-change` value |
| [ProgressView](https://developer.apple.com/documentation/swiftui/progressview) | `gk-progress-view` | Determinate/indeterminate state, current and bound labels |
| [ContentUnavailableView](https://developer.apple.com/documentation/swiftui/contentunavailableview) | `gk-content-unavailable` | Search/no-results copy with a next action |
| [Menu](https://developer.apple.com/documentation/swiftui/menu) | `gk-action-menu` | Keyboard-ready commands, details, separators |
| [TextEditor](https://developer.apple.com/documentation/swiftui/texteditor) | `gk-text-editor` | Long-form text with live character count |
| [AsyncImage](https://developer.apple.com/documentation/swiftui/asyncimage) | `gk-async-image` | Explicit loading, success, and error states |
| [Gauge](https://developer.apple.com/documentation/swiftui/gauge) | `gk-value-gauge` | Bounded value with circular or linear presentation |
| [NavigationStack](https://developer.apple.com/documentation/swiftui/navigationstack) | `gk-navigation-link`, `gk-navigation-stack` | Route row and root-to-detail stack emitting `gk-navigate` |
| [Alert](https://developer.apple.com/documentation/swiftui/alert) | `gk-alert-dialog` | Modal confirmation with focus management |
| [ColorPicker](https://developer.apple.com/documentation/swiftui/colorpicker) | `gk-color-picker` | Native color input, hex entry, suggested swatches |
| [Table](https://developer.apple.com/documentation/swiftui/table) | `gk-data-table` | Sortable headers and selectable rows |
| [Stepper](https://developer.apple.com/documentation/swiftui/stepper) | `gk-stepper-control` | Range, step, wrap, and disabled bounds |
| [Picker](https://developer.apple.com/documentation/swiftui/picker) | `gk-value-picker` | Radio-style choices with detail and disabled options |
| [Link](https://developer.apple.com/documentation/swiftui/link) | `gk-web-link` | Safe external destination with route event |
| [LazyVGrid](https://developer.apple.com/documentation/swiftui/lazyvgrid) | `gk-grid-view` | Responsive columns, badges, and selected cell events |
| [SecureField](https://developer.apple.com/documentation/swiftui/securefield) | `gk-secure-field` | Masked text with reveal, validation, and commit events |
| [DisclosureGroup](https://developer.apple.com/documentation/swiftui/disclosuregroup) | `gk-disclosure-group` | Nested sections with expansion events |
| [EditButton](https://developer.apple.com/documentation/swiftui/editbutton) | `gk-editable-list` | Edit mode with delete and move events |
| [Form](https://developer.apple.com/documentation/swiftui/form) | `gk-form` | Grouped sections, labelled controls, and submit values |
| [ControlGroup](https://developer.apple.com/documentation/swiftui/controlgroup) | `gk-control-group` | Related actions with shared `gk-control` event |
| [NavigationSplitView](https://developer.apple.com/documentation/swiftui/navigationsplitview) | `gk-navigation-split-view` | Two- or three-column selection with a live route |
| [ActionSheet](https://developer.apple.com/documentation/swiftui/actionsheet) | `gk-confirmation-dialog` | Stacked cancel, default, and destructive choices |

| Glass Kit family | Representative HIG topics | Tags |
|---|---|---|
| Core and material | Glass surfaces, buttons, badges, toolbars, segmented controls | `gk-glass-panel`, `gk-button`, `gk-badge`, `gk-toolbar`, `gk-segmented` |
| Content | Text views, image views, charts, web views | `gk-text-view`, `gk-image-view`, `gk-chart`, `gk-web-view` |
| Layout | Boxes, collections, column views, disclosures, labels, lists and tables, split views, outlines | `gk-box`, `gk-collection`, `gk-column-view`, `gk-disclosure`, `gk-label`, `gk-list-row`, `gk-split-view`, `gk-outline-view` |
| Navigation and search | Sidebars, tab bars, path controls, search fields, token fields | `gk-sidebar`, `gk-sidebar-item`, `gk-tab-bar`, `gk-path-control`, `gk-search-field`, `gk-token-field` |
| Menus and actions | Buttons, menus, context menus, edit menus, pull-down and pop-up buttons, activity views | `gk-menu`, `gk-context-menu`, `gk-edit-menu`, `gk-pull-down-button`, `gk-pop-up-button`, `gk-activity-view` |
| Presentation | Windows, sheets, scroll views, popovers, panels, alerts, action sheets | `gk-window`, `gk-sheet`, `gk-scroll-view`, `gk-popover`, `gk-panel`, `gk-alert`, `gk-action-sheet` |
| Selection and input | Toggles, sliders, text fields, color wells, steppers, pickers, combo boxes, digit entry | `gk-toggle`, `gk-slider`, `gk-text-field`, `gk-color-well`, `gk-stepper`, `gk-picker`, `gk-combo-box`, `gk-digit-entry-view` |
| Status | Progress indicators, gauges, activity rings, rating indicators, notifications, status bars | `gk-progress-indicator`, `gk-gauge`, `gk-activity-ring`, `gk-rating-indicator`, `gk-notification`, `gk-status-bar` |
| System experiences | Widgets, live activities, snippets, top shelf, app shortcuts, watch and TV surfaces | `gk-widget`, `gk-live-activity`, `gk-snippet`, `gk-top-shelf`, `gk-app-shortcut`, `gk-watch-face` |
| Inputs | Keyboards, pointing devices, gestures, focus and selection, camera control, remotes | `gk-keyboard`, `gk-pointing-device`, `gk-gesture`, `gk-focus-and-selection`, `gk-camera-control`, `gk-remote` |

Four topics received closer fidelity work:

- **Sliders** — filled min-to-thumb track, narrow lozenge thumb, optional tick marks and labels, leading/trailing min/max icons, linear and circular variants, paired units, and live `gk-input`/`gk-change`.
- **Text fields** — separate label and placeholder, trailing clear action, leading and trailing slots, secure input types, captions, invalid state, and sensible validation timing.
- **Color wells** — active swatch, native color input, highlight on interaction, value sync, and drag/drop of `#rrggbb` strings.
- **Toggles** — switch, mini switch, checkbox with mixed state, and radio variants; state is carried by shape, position, and text, not colour alone.

These are visual and informational translations. No Apple logos, SF Symbols, SF Pro binaries, traffic lights, menu bar, Dock, or platform gestures are shipped, and the Windows-native shell remains unchanged.

## Mapping Apple ideas to Windows implementations

| Apple concept | Glass Kit implementation |
|---|---|
| SwiftUI modifiers | CSS custom properties and component props |
| UIKit `UIViewPropertyAnimator` | JS motion controller using spring physics |
| AppKit window chrome | Tauri window configuration + DWM material helper |
| HIG | Written rules in `DESIGN.md`; live topic patterns in `COMPONENT_REGISTRY` |
| Liquid Glass | Native DWM blur, flat fills, hairlines, rounded corners |
| `matchedGeometryEffect` | Shared-layout transition recipe |
| `PhaseAnimator` / `KeyframeAnimator` | Named keyframe recipes in `@glasskit/motion` |
| `CASpringAnimation` | Spring solver presets in `@glasskit/motion` |
| Core Graphics / Core Image | CSS, SVG, and Canvas equivalents first; WebGPU later |
| SF Symbols | Custom open-source symbol set with comparable weight hierarchy |
| Dynamic Type | CSS relative units and `--gk-text-*` tokens |
| VoiceOver | Windows UI Automation / Narrator compatibility |
| Reduce Motion | `prefers-reduced-motion` and instant/opacity-only recipes |

## Liquid Glass implementation checklist

Glass Kit should recreate the **visual system**, not the Apple runtime.

- [ ] **Real material** — blur the actual desktop through DWM, not CSS alone.
- [ ] **Thickness tiers** — `thin`, `regular`, `thick` glass tokens.
- [ ] **Specular edge** — subtle top/inner highlight, no fake window border.
- [ ] **Refraction** — optional, restrained. Never distort text or create colour blobs.
- [ ] **Continuous corners** — CSS radius plus DWM rounded corners.
- [ ] **Adaptive contrast** — light/dark and wallpaper-aware variants.
- [ ] **Elevation** — layered shadow/glow that respects rounded corners.
- [ ] **Motion continuity** — open, close, and shared-element transitions use the same physics.
- [ ] **Semantic colour** — accent used sparingly and consistently.
- [ ] **Accessibility** — reduced motion, keyboard focus, text scaling, high contrast.

## Anti-goals

- No macOS traffic-light buttons.
- No Mac gestures as required interactions.
- No SF Pro or SF Symbols assets.
- No activation-dependent Windows backdrops.
- No `SetWindowRgn` on transparent WebView2 windows.
- No CSS `backdrop-filter` as the only blur source.
- No fake colour orbs or oversized shadows pretending to be glass.

## Practical rule

When Apple docs describe an interaction, translate the **intention** to Windows:

> "Feels deceptively calm, layered, and responsive" stays.  
> "Swipe from the edge with three fingers" does not.
