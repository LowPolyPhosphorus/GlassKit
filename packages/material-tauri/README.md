# glasskit-material

Native Windows glass and rounded corners for Tauri apps.

The visible blur is applied to the HWND by DWM. CSS `backdrop-filter` cannot sample the Windows desktop through a transparent WebView2 window.

```rust
use glasskit_material::{apply_default_glass, set_rounded_corners};

// Tauri's HWND comes from a different `windows` crate version, so pass the raw pointer.
let hwnd = window.hwnd()?.0 .0 as isize;
set_rounded_corners(hwnd, true)?;
apply_default_glass(hwnd)?;
```

Rules learned in production:

- Use `DWMWA_WINDOW_CORNER_PREFERENCE`, not `SetWindowRgn`.
- Use the low-level accent policy for inactive-window stability.
- Do not clear and reapply the material on focus events.
