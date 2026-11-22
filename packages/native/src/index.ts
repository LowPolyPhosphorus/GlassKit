export type GlassMode = "blur" | "acrylic" | "none";

export interface NativeStatus {
  native: boolean;
  reason: string;
}

interface TauriInternals {
  invoke?: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
}

function internals(): TauriInternals | null {
  if (typeof window === "undefined") return null;
  const bridge = (window as Window & { __TAURI_INTERNALS__?: TauriInternals })
    .__TAURI_INTERNALS__;
  return bridge?.invoke ? bridge : null;
}

export function isTauriHost(): boolean {
  return internals() !== null;
}

export function nativeStatus(): NativeStatus {
  return isTauriHost()
    ? { native: true, reason: "Tauri host detected" }
    : {
        native: false,
        reason: "Browser preview: native DWM material needs a Tauri window",
      };
}

async function call<T>(command: string, args: Record<string, unknown>): Promise<T> {
  const bridge = internals();
  if (!bridge?.invoke) {
    throw new Error("Glass Kit native commands are only available in a Tauri window");
  }
  return bridge.invoke<T>(command, args);
}

export async function applyNativeGlass(
  mode: GlassMode = "blur",
  tint?: number,
): Promise<void> {
  await call("glasskit_apply_glass", { mode, tint });
}

export async function setNativeCorners(round = true): Promise<void> {
  await call("glasskit_set_corners", { round });
}

export async function clearNativeGlass(): Promise<void> {
  await call("glasskit_clear_glass", {});
}
