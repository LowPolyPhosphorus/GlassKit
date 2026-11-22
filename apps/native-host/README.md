# Glass Kit native host

Minimal Tauri 2 host that loads `apps/example-settings` and registers the
`glasskit-material` commands used by `@glasskit/native`.

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
cargo install tauri-cli --version "^2" --locked
cargo tauri dev --manifest-path apps/native-host/src-tauri/Cargo.toml
```

The host starts the Vite dev server for the Settings demo, applies rounded
corners and native blur at startup, and exposes:

- `glasskit_apply_glass`
- `glasskit_set_corners`
- `glasskit_clear_glass`
