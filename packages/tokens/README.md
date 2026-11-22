# @glasskit/tokens

Single source of truth for Glass Kit values.

- `tokens.json` is the source.
- `scripts/generate.mjs` writes `tokens.css` and `src/generated.ts`.
- `tokens.css` exposes variables as `--gk-*`.
- Dark is the default; set `data-gk-theme="light"` on `<html>` for light.

```ts
import { tokens } from "@glasskit/tokens";
console.log(tokens.motion.spring.snappy.stiffness);
```

```css
@import "@glasskit/tokens/tokens.css";
```
