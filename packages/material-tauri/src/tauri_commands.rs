//! Tauri 2 commands backing `@glasskit/native`.
//!
//! Enable with `features = ["tauri"]` and register with
//! `glasskit_material::register_commands(tauri::Builder::default())`.

use tauri::{Runtime, WebviewWindow};

use crate::{apply_glass, clear_glass, set_rounded_corners, GlassStyle, Tint, DEFAULT_TINT};

#[cfg(windows)]
fn window_hwnd<R: Runtime>(window: &WebviewWindow<R>) -> Result<isize, String> {
    // Tauri's HWND comes from a different `windows` crate version than ours.
    // Cast the raw pointer instead of passing the typed handle across crates.
    Ok(window.hwnd().map_err(|error| error.to_string())?.0 as isize)
}

#[cfg(not(windows))]
fn window_hwnd<R: Runtime>(_window: &WebviewWindow<R>) -> Result<isize, String> {
    Err("native glass is only available on Windows".to_string())
}

#[tauri::command]
pub fn glasskit_apply_glass<R: Runtime>(
    window: WebviewWindow<R>,
    mode: String,
    tint: Option<u32>,
) -> Result<(), String> {
    let hwnd = window_hwnd(&window)?;
    let tint = tint.map(Tint::from_abgr).unwrap_or(DEFAULT_TINT);
    let result = match mode.as_str() {
        "blur" => apply_glass(hwnd, GlassStyle::Blur { tint }),
        "acrylic" => apply_glass(hwnd, GlassStyle::Acrylic { tint }),
        "none" => clear_glass(hwnd),
        other => return Err(format!("unknown Glass Kit material mode: {other}")),
    };
    result.map_err(|error| error.to_string())
}

#[tauri::command]
pub fn glasskit_set_corners<R: Runtime>(
    window: WebviewWindow<R>,
    round: bool,
) -> Result<(), String> {
    set_rounded_corners(window_hwnd(&window)?, round).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn glasskit_clear_glass<R: Runtime>(window: WebviewWindow<R>) -> Result<(), String> {
    clear_glass(window_hwnd(&window)?).map_err(|error| error.to_string())
}

/// Register all Glass Kit native commands on a Tauri builder.
pub fn register_commands<R: Runtime>(builder: tauri::Builder<R>) -> tauri::Builder<R> {
    builder.invoke_handler(tauri::generate_handler![
        glasskit_apply_glass,
        glasskit_set_corners,
        glasskit_clear_glass
    ])
}
