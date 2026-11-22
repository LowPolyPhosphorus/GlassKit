# @glasskit/motion

Shared motion physics for Glass Kit.

- Token-backed durations and easings from `@glasskit/tokens`.
- Analytic spring solver: underdamped, critically damped, and overdamped.
- Spring-to-keyframe sampling for the Web Animations API.
- Named recipes: `sheet-in`, `popover-out`, `toggle-on`, `row-insert`, and more.
- `prefers-reduced-motion` is respected automatically.

```ts
import { animateRecipe, animateSpring } from "@glasskit/motion";

animateRecipe(panel, "sheet-in");
animateSpring(thumb, "transform", {
  from: 0,
  to: 16,
  unit: "px",
  preset: "snappy",
});
```
