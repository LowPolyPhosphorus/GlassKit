#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Native material is applied from the Settings UI so the chosen mode,
    // tint, and corner state have one source of truth. Keeping setup free of
    // DWM calls also avoids aborting startup on Windows versions that do not
    // support rounded-corner attributes.
    let builder = glasskit_material::register_commands(tauri::Builder::default());

    builder
        .run(tauri::generate_context!())
        .expect("failed to run Glass Kit native host");
}
