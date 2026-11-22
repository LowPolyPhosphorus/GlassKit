//! Native Windows material primitives for Glass Kit apps.
//!
//! CSS `backdrop-filter` cannot sample the desktop through a transparent
//! WebView2 window. The visible glass has to be applied to the HWND. This crate
//! uses the low-level `SetWindowCompositionAttribute` accent policy because the
//! Windows 11 system backdrop is activation-dependent and collapses when a
//! notification takes focus.
//!
//! This crate deliberately does not depend on Tauri. Pass the raw HWND from
//! your Tauri window; that avoids version mismatches between `windows` crates.

use std::fmt;

/// Faint white ABGR tint used by the current Glass Kit material.
pub const DEFAULT_TINT: Tint = Tint(0x08FFFFFF);

/// An ABGR colour value, matching the accent policy's `gradient_color` field.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Tint(pub u32);

impl Tint {
    pub const fn from_abgr(value: u32) -> Self {
        Self(value)
    }

    pub const fn from_rgba(r: u8, g: u8, b: u8, a: u8) -> Self {
        Self((a as u32) << 24 | (b as u32) << 16 | (g as u32) << 8 | r as u32)
    }

    pub const fn abgr(self) -> u32 {
        self.0
    }
}

/// The native backdrop mode.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum GlassStyle {
    /// DWM blur-behind. Slightly weaker and less milky than full acrylic.
    Blur { tint: Tint },
    /// Full acrylic blur. Stronger and more opaque.
    Acrylic { tint: Tint },
    /// Remove the backdrop. Useful during a close animation.
    Disabled,
}

/// Failures returned by the native material helpers.
#[derive(Debug)]
pub enum MaterialError {
    UnsupportedPlatform,
    InvalidWindow,
    Windows(String),
}

impl fmt::Display for MaterialError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnsupportedPlatform => f.write_str("native glass is only available on Windows"),
            Self::InvalidWindow => f.write_str("a non-zero HWND is required"),
            Self::Windows(message) => write!(f, "Windows material call failed: {message}"),
        }
    }
}

impl std::error::Error for MaterialError {}

/// True when native materials can be applied.
pub fn is_supported() -> bool {
    cfg!(windows)
}

/// Apply a native material to a top-level HWND.
pub fn apply_glass(hwnd: isize, style: GlassStyle) -> Result<(), MaterialError> {
    if hwnd == 0 {
        return Err(MaterialError::InvalidWindow);
    }

    #[cfg(windows)]
    unsafe {
        windows_impl::set_style(hwnd, style)
    }

    #[cfg(not(windows))]
    {
        let _ = style;
        Err(MaterialError::UnsupportedPlatform)
    }
}

/// Apply the recommended Glass Kit material: plain blur with a faint tint.
pub fn apply_default_glass(hwnd: isize) -> Result<(), MaterialError> {
    apply_glass(
        hwnd,
        GlassStyle::Blur {
            tint: DEFAULT_TINT,
        },
    )
}

/// Remove the native backdrop.
pub fn clear_glass(hwnd: isize) -> Result<(), MaterialError> {
    apply_glass(hwnd, GlassStyle::Disabled)
}

/// Ask DWM to clip the top-level window to the Windows rounded-corner shape.
///
/// CSS radius alone leaves square acrylic in the HWND corners. Do not use
/// `SetWindowRgn` for this on a transparent WebView2 window: it can make DWM
/// draw a classic bevel during close animations.
pub fn set_rounded_corners(hwnd: isize, round: bool) -> Result<(), MaterialError> {
    if hwnd == 0 {
        return Err(MaterialError::InvalidWindow);
    }

    #[cfg(windows)]
    unsafe {
        windows_impl::set_corner_preference(hwnd, round)
    }

    #[cfg(not(windows))]
    {
        let _ = round;
        Err(MaterialError::UnsupportedPlatform)
    }
}

#[cfg(windows)]
mod windows_impl {
    use super::{GlassStyle, MaterialError, Tint};
    use std::ffi::c_void;
    use std::mem::size_of;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::Graphics::Dwm::{
        DwmSetWindowAttribute, DWMWA_WINDOW_CORNER_PREFERENCE, DWMWCP_DONOTROUND, DWMWCP_ROUND,
    };

    const WCA_ACCENT_POLICY: u32 = 19;
    const ACCENT_DISABLED: u32 = 0;
    const ACCENT_ENABLE_BLURBEHIND: u32 = 3;
    const ACCENT_ENABLE_ACRYLICBLURBEHIND: u32 = 4;

    #[repr(C)]
    struct AccentPolicy {
        state: u32,
        flags: u32,
        gradient_color: u32,
        animation_id: u32,
    }

    #[repr(C)]
    struct CompositionAttributeData {
        attribute: u32,
        data: *mut c_void,
        data_size: usize,
    }

    type SetCompositionAttribute =
        unsafe extern "system" fn(*mut c_void, *mut CompositionAttributeData) -> i32;

    extern "system" {
        fn LoadLibraryA(name: *const i8) -> *mut c_void;
        fn GetProcAddress(module: *mut c_void, name: *const i8) -> *mut c_void;
    }

    unsafe fn set_accent(hwnd: isize, state: u32, tint: Tint) {
        // SetWindowCompositionAttribute is undocumented and absent from
        // user32.lib, so resolve it at runtime.
        let module = LoadLibraryA(b"user32.dll\0".as_ptr() as *const i8);
        if module.is_null() {
            return;
        }
        let address = GetProcAddress(
            module,
            b"SetWindowCompositionAttribute\0".as_ptr() as *const i8,
        );
        if address.is_null() {
            return;
        }
        let function: SetCompositionAttribute = std::mem::transmute(address);

        let mut policy = AccentPolicy {
            state,
            flags: 0,
            gradient_color: tint.abgr(),
            animation_id: 0,
        };
        let mut data = CompositionAttributeData {
            attribute: WCA_ACCENT_POLICY,
            data: &mut policy as *mut AccentPolicy as *mut c_void,
            data_size: size_of::<AccentPolicy>(),
        };
        let _ = function(hwnd as *mut c_void, &mut data);
    }

    pub(crate) unsafe fn set_style(hwnd: isize, style: GlassStyle) -> Result<(), MaterialError> {
        match style {
            GlassStyle::Blur { tint } => set_accent(hwnd, ACCENT_ENABLE_BLURBEHIND, tint),
            GlassStyle::Acrylic { tint } => {
                set_accent(hwnd, ACCENT_ENABLE_ACRYLICBLURBEHIND, tint)
            }
            GlassStyle::Disabled => set_accent(hwnd, ACCENT_DISABLED, Tint(0)),
        }
        Ok(())
    }

    pub(crate) unsafe fn set_corner_preference(
        hwnd: isize,
        round: bool,
    ) -> Result<(), MaterialError> {
        let preference = if round {
            DWMWCP_ROUND
        } else {
            DWMWCP_DONOTROUND
        };
        DwmSetWindowAttribute(
            HWND(hwnd as *mut c_void),
            DWMWA_WINDOW_CORNER_PREFERENCE,
            &preference as *const _ as *const c_void,
            size_of_val(&preference) as u32,
        )
        .map_err(|error| MaterialError::Windows(error.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tint_uses_abgr_order() {
        assert_eq!(Tint::from_rgba(10, 132, 255, 8).abgr(), 0x08FF840A);
        assert_eq!(DEFAULT_TINT.abgr(), 0x08FFFFFF);
    }

    #[test]
    fn invalid_window_is_rejected_before_platform_dispatch() {
        assert!(matches!(
            apply_glass(0, GlassStyle::Disabled),
            Err(MaterialError::InvalidWindow)
        ));
        assert!(matches!(
            set_rounded_corners(0, true),
            Err(MaterialError::InvalidWindow)
        ));
    }

    #[test]
    fn error_messages_are_human_readable() {
        assert_eq!(
            MaterialError::InvalidWindow.to_string(),
            "a non-zero HWND is required"
        );
    }
}
