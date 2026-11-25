# Glass Kit native host

Minimal Tauri 2 host that loads `apps/example-settings` and registers the
`glasskit-material` commands used by `@glasskit/native`.

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
cargo install tauri-cli --version "^2" --locked
cd apps/native-host/src-tauri
cargo tauri dev
```

The host starts the Vite dev server for the Settings demo and registers the
commands below. The Settings UI applies rounded corners and native material
after load; `setup()` deliberately makes no DWM/HWND calls.

- `glasskit_apply_glass`
- `glasskit_set_corners`
- `glasskit_clear_glass`
