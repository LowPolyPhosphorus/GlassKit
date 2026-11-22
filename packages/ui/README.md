# @glasskit/ui

Framework-agnostic Web Components for Glass Kit.

```ts
import { installGlassKit } from "@glasskit/ui";
import "@glasskit/tokens/tokens.css";

installGlassKit();
```

```html
<gk-glass-panel elevation="high" tone="regular">
  <gk-list-row subtitle="Connected">
    Noise control
    <gk-toggle slot="trailing" checked></gk-toggle>
  </gk-list-row>
  <gk-text-field label="Device name" value="Living Room Buds"></gk-text-field>
  <gk-slider label="Stiffness" min="80" max="600" value="420"></gk-slider>
  <gk-badge tone="accent" dot>Live</gk-badge>
  <gk-toolbar></gk-toolbar>
</gk-glass-panel>
```

Components use CSS variables from `@glasskit/tokens`, so light/dark theming is just `data-gk-theme="light"` on `<html>`.

Events: `gk-activate`, `gk-input`, and `gk-change`. Segmented controls, sliders, and text fields include `detail.value`; toggles include `detail.checked`.
