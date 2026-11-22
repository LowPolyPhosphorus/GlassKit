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
</gk-glass-panel>
```

Components use CSS variables from `@glasskit/tokens`, so light/dark theming is just `data-gk-theme="light"` on `<html>`.

Events are `gk-activate`, `gk-change`, and `gk-change` with `detail.value` for segmented controls.
