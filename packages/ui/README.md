# @glasskit/ui

Framework-agnostic Web Components for Glass Kit. The package exports 125 registered elements — 72 core components (28 original plus 44 SwiftUI-derived) and a 53-pattern atlas covering all 77 topics in Apple’s HIG Components index — and one idempotent installer.

```ts
import { installGlassKit } from "@glasskit/ui";
import "@glasskit/tokens/tokens.css";

installGlassKit();
```

```html
<gk-glass-panel elevation="high" tone="regular">
  <gk-status-bar label="Glass Kit" status="All systems normal" time="09:41"></gk-status-bar>

  <gk-list-row subtitle="Connected">
    Noise control
    <gk-toggle slot="trailing" checked></gk-toggle>
  </gk-list-row>

  <gk-search-field label="Search" placeholder="Search devices" scopes='["All","Lights"]'></gk-search-field>
  <gk-text-field label="Device name" value="Living Room Buds"></gk-text-field>
  <gk-slider label="Stiffness" min="80" max="600" value="420"></gk-slider>
  <gk-token-field label="Rooms" tokens='["Kitchen","Hallway"]'></gk-token-field>
  <gk-chart title="Energy use" values="12,18,14,24" labels="Mon,Tue,Wed,Thu"></gk-chart>
  <gk-badge tone="accent" dot>Live</gk-badge>
  <gk-toolbar></gk-toolbar>
</gk-glass-panel>
```

## Component groups

- **Core:** `gk-glass-panel`, `gk-button`, `gk-toggle`, `gk-segmented`, `gk-list-row`, `gk-text-field`, `gk-slider`, `gk-badge`, `gk-toolbar`
- **Layout:** `gk-box`, `gk-collection`, `gk-column-view`, `gk-disclosure`, `gk-label`
- **Navigation and search:** `gk-path-control`, `gk-search-field`, `gk-sidebar`, `gk-sidebar-item`, `gk-tab-bar`, `gk-token-field`
- **Status and feedback:** `gk-control-tile`, `gk-live-activity`, `gk-notification`, `gk-snippet`, `gk-status-bar`
- **Media and data:** `gk-chart`, `gk-image-view`, `gk-web-view`
- **SwiftUI-derived:** `gk-date-picker`, `gk-progress-view`, `gk-content-unavailable`, `gk-action-menu`, `gk-text-editor`, `gk-async-image`, `gk-value-gauge`, `gk-navigation-link`, `gk-alert-dialog`, `gk-color-picker`, `gk-data-table`, `gk-stepper-control`, `gk-value-picker`, `gk-web-link`, `gk-grid-view`, `gk-navigation-stack`, `gk-secure-field`, `gk-disclosure-group`, `gk-editable-list`, `gk-form`, `gk-control-group`, `gk-navigation-split-view`, `gk-confirmation-dialog`, `gk-outline-group`, `gk-group-box`, `gk-labeled-content`, `gk-adaptive-view`, `gk-timeline-view`, `gk-canvas-view`, `gk-scroll-navigator`, `gk-share-action`, `gk-long-press`, `gk-paste-button`, `gk-multi-date-picker`, `gk-lazy-stack`, `gk-drag-surface`, `gk-tap-counter`, `gk-lazy-grid`, `gk-rotate-view`, `gk-lazy-vgrid`, `gk-list-view`, `gk-rich-text`, `gk-icon-label`, `gk-grid-layout`
- **HIG atlas:** `gk-text-view`, `gk-tab-view`, `gk-split-view`, `gk-color-well`, `gk-stepper`, `gk-popover`, `gk-menu`, `gk-widget`, `gk-gesture`, and 44 more topic patterns

`COMPONENT_REGISTRY` is the single source of truth for tag, constructor, title, group, description, and HIG source page. `installGlassKit()` registers every entry once. Sliders, text fields, color wells, and toggles follow their HIG pages at the visual and interaction level; all patterns keep Windows-native behaviour and use no Apple artwork, fonts, or symbols.

Components use CSS variables from `@glasskit/tokens`, so light/dark theming is just `data-gk-theme="light"` on `<html>`.

## Events

Core controls emit `gk-activate`, `gk-input`, and `gk-change`: segmented controls, sliders, text fields, search fields, and token fields include `detail.value`; toggles include `detail.checked`.

Richer patterns add focused events: `gk-select`, `gk-navigate`, `gk-open`, `gk-close`, `gk-scope-change`, `gk-token-add`, `gk-token-remove`, `gk-token-change`, `gk-toggle`, `gk-state-change`, `gk-dismiss`, `gk-expand-change`, `gk-confirm`, `gk-cancel`, `gk-snippet-action`, `gk-point-select`, `gk-sort`, `gk-error`, and `gk-load`. All events bubble and cross the shadow boundary.
