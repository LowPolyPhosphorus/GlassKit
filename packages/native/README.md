# @glasskit/native

Browser-safe bridge to the `glasskit-material` Tauri commands.

In a normal browser it reports `native: false` and the calls reject with a clear message. In a Tauri 2 window it calls the commands exposed by the `tauri` feature of `glasskit-material`.

```ts
import { nativeStatus, applyNativeGlass, setNativeCorners } from "@glasskit/native";

console.log(nativeStatus());
if (nativeStatus().native) {
  await setNativeCorners(true);
  await applyNativeGlass("blur");
}
```

Commands: `glasskit_apply_glass`, `glasskit_set_corners`, `glasskit_clear_glass`.
