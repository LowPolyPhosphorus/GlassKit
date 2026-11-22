# Glass Kit Design Language

Apple documentation reference map: [docs/APPLE_REFERENCE_MAP.md](docs/APPLE_REFERENCE_MAP.md).

## Materials

The visible blur comes from the native window, not from CSS. On Windows the WebView2 window is transparent, so CSS `backdrop-filter` samples transparent pixels and does nothing.

Use the native material helper for real desktop blur. Keep the CSS veil subtle.

## Native rules learned the hard way

- Use DWM rounded corners (`DWMWA_WINDOW_CORNER_PREFERENCE`), not `SetWindowRgn` on a transparent window.
  `SetWindowRgn` can make DWM draw a classic Win95-style bevel during close animations.
- Use the low-level accent policy for stable inactive blur.
  The Windows 11 system backdrop is activation-dependent and collapses to a flat wallpaper fill when a notification steals focus.
- Do not clear and reapply the backdrop on focus events.
  That reintroduces the flat inactive glass.

## Motion tokens

Motion is shared, not hand-rolled per app.

```css
--gk-duration-instant: 80ms;
--gk-duration-fast: 140ms;
--gk-duration-base: 220ms;
--gk-duration-slow: 360ms;

--gk-ease-standard: cubic-bezier(0.2, 0, 0, 1);
--gk-ease-emphasized: cubic-bezier(0.32, 0.72, 0, 1);
--gk-ease-exit: cubic-bezier(0.4, 0, 1, 1);
```

Spring presets:

- `snappy` — toggles, small controls.
- `gentle` — cards, list insertion.
- `sheet` — popups and bottom sheets.

Named recipes:

- `panel-in`, `panel-out`
- `sheet-in`, `sheet-out`
- `popover-in`, `popover-out`
- `toggle-on`, `toggle-off`
- `row-insert`, `row-remove`
- `tab-switch`, `hover-lift`

## Accessibility

Always honour `prefers-reduced-motion`: collapse to instant or opacity-only transitions.
