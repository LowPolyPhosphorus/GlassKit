# Apple Reference Map

Glass Kit studies Apple's documentation as a **design and behaviour reference**. It does not ship Apple assets, SF Pro fonts, SF Symbols, Apple logos, or macOS interaction rules. The target stays Windows-native: taskbar, tray, right-click menus, keyboard shortcuts, snapping, and no Mac gestures.

Source: <https://developer.apple.com/documentation/>

## Priority tiers

### Tier 0 — study first

These directly define the look and feel Glass Kit needs.

| Apple reference | What to extract | Glass Kit home |
|---|---|---|
| Human Interface Guidelines | Clarity, deference, depth, hierarchy, calm surfaces | `DESIGN.md` |
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

## Mapping Apple ideas to Windows implementations

| Apple concept | Glass Kit implementation |
|---|---|
| SwiftUI modifiers | CSS custom properties and component props |
| UIKit `UIViewPropertyAnimator` | JS motion controller using spring physics |
| AppKit window chrome | Tauri window configuration + DWM material helper |
| HIG | Written rules in `DESIGN.md` |
| Liquid Glass | Native DWM blur, subtle gradients, hairlines, rounded corners |
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
