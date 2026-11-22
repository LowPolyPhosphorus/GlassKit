#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    let builder = glasskit_material::register_commands(tauri::Builder::default()).setup(|app| {
        let window = app
            .get_webview_window("main")
            .ok_or("Glass Kit native host is missing the main window")?;

        // Tauri's typed HWND comes from a different `windows` crate version than
        // glasskit-material, so cross the boundary as a raw pointer value.
        let hwnd = window.hwnd()?.0 as isize;
        glasskit_material::set_rounded_corners(hwnd, true)?;
        glasskit_material::apply_glass(
            hwnd,
            glasskit_material::GlassStyle::Blur {
                tint: glasskit_material::DEFAULT_TINT,
            },
        )?;

        Ok(())
    });

    builder
        .run(tauri::generate_context!())
        .expect("failed to run Glass Kit native host");
}
