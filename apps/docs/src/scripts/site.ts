import { tokens } from "@glasskit/tokens";
import {
  animateRecipe,
  animateSpring,
  recipes,
  setReducedMotionOverride,
  type RecipeName,
  type SpringConfig,
} from "@glasskit/motion";
import {
  applyNativeGlass,
  clearNativeGlass,
  nativeStatus,
  setNativeCorners,
} from "@glasskit/native";
import { installGlassKit } from "@glasskit/ui";
import { initDesktopLab } from "./desktop-lab";

installGlassKit();

type Theme = "light" | "dark";
const THEME_KEY = "gk-docs-theme";
const root = document.documentElement;

function one<T extends Element>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function eventDetail(event: Event): Record<string, unknown> {
  return event instanceof CustomEvent && event.detail && typeof event.detail === "object"
    ? (event.detail as Record<string, unknown>)
    : {};
}

function configureTheme(): void {
  const toggle = one<HTMLButtonElement>("[data-theme-toggle]");
  const label = one<HTMLElement>("[data-theme-label]");
  const use = toggle?.querySelector("use");

  const paint = (theme: Theme): void => {
    root.dataset.gkTheme = theme;
    if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
    use?.setAttribute(
      "href",
      theme === "dark" ? "/icons.svg#icon-sun" : "/icons.svg#icon-moon",
    );
  };

  paint(root.dataset.gkTheme === "light" ? "light" : "dark");

  toggle?.addEventListener("click", () => {
    const next: Theme = root.dataset.gkTheme === "dark" ? "light" : "dark";
    paint(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Ignore private-mode storage failures.
    }
  });
}

function configureAccents(): void {
  const swatches = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-accent]"));
  if (swatches.length === 0) return;

  for (const swatch of swatches) {
    swatch.addEventListener("click", () => {
      root.style.setProperty("--gk-color-accent", swatch.dataset.accent!);
      root.style.setProperty("--gk-color-accent-fill", swatch.dataset.accentFill ?? "transparent");
      root.style.setProperty("--gk-color-accent-stroke", swatch.dataset.accentStroke ?? swatch.dataset.accent!);
      for (const other of swatches) other.classList.toggle("is-selected", other === swatch);
    });
  }
}

function configureEventStrip(): void {
  const strip = one<HTMLElement>("[data-event-strip]");
  if (!strip) return;

  const append = (text: string): void => {
    const chip = document.createElement("span");
    chip.className = "event-chip";
    chip.textContent = text;
    strip.prepend(chip);
    while (strip.children.length > 6) strip.lastElementChild?.remove();
  };

  for (const name of ["gk-activate", "gk-change", "gk-input"]) {
    document.addEventListener(name, (event) => {
      const target = event.target as HTMLElement;
      const detail = eventDetail(event);
      const value = detail.value ?? detail.checked;
      const label = target.getAttribute("label") ?? target.textContent?.trim() ?? target.tagName.toLowerCase();
      append(`${name.replace("gk-", "")} · ${label}${value === undefined ? "" : ` · ${value}`}`);
    });
  }
}

function configureMotion(): void {
  const grid = one<HTMLElement>("#recipe-grid");
  const target = one<HTMLElement>("#recipe-target");

  if (grid) {
    for (const name of Object.keys(recipes) as RecipeName[]) {
      const button = document.createElement("gk-button");
      button.setAttribute("variant", "quiet");
      button.setAttribute("size", "small");
      button.textContent = name;
      button.addEventListener("gk-activate", () => {
        if (target) animateRecipe(target, name);
      });
      grid.append(button);
    }
  }

  const stiffness = one<HTMLElement>("#spring-stiffness");
  const damping = one<HTMLElement>("#spring-damping");
  const mass = one<HTMLElement>("#spring-mass");
  const replay = one<HTMLElement>("#spring-replay");
  const reduced = one<HTMLElement & { checked: boolean }>("#reduced-toggle");
  const springTarget = one<HTMLElement>("#spring-target");
  const config: SpringConfig = { ...tokens.motion.spring.snappy };

  const run = (): void => {
    if (!springTarget) return;
    animateSpring(springTarget, "translate", {
      config,
      from: -190,
      to: 0,
      unit: "px",
      durationMs: 720,
      steps: 48,
    });
  };

  const sync = (): void => {
    config.stiffness = Number(stiffness?.getAttribute("value") ?? config.stiffness);
    config.damping = Number(damping?.getAttribute("value") ?? config.damping);
    config.mass = Number(mass?.getAttribute("value") ?? config.mass);
    run();
  };

  for (const control of [stiffness, damping, mass]) {
    control?.addEventListener("gk-input", sync);
    control?.addEventListener("input", sync);
  }

  replay?.addEventListener("click", run);
  replay?.addEventListener("gk-activate", run);
  reduced?.addEventListener("gk-change", () => setReducedMotionOverride(reduced.checked));

  if (springTarget) requestAnimationFrame(run);
}

async function nativeCall(label: string, action: () => Promise<unknown>): Promise<void> {
  const output = one<HTMLElement>("#native-output");
  try {
    await action();
    if (output) output.textContent = `${label} applied`;
  } catch (error) {
    if (output) output.textContent = error instanceof Error ? error.message : String(error);
  }
}

function configureNative(): void {
  const status = nativeStatus();
  const statusText = one<HTMLElement>("#native-status");
  const title = one<HTMLElement>("#native-title");
  const reason = one<HTMLElement>("#native-reason");
  const code = one<HTMLElement>("#native-code");
  const dot = one<HTMLElement>("#native-dot");

  if (statusText) statusText.textContent = status.native ? "Tauri host detected" : "Browser preview";
  if (title) title.textContent = status.native ? "Native material is live" : "Browser preview, native-ready";
  if (reason) reason.textContent = status.reason;
  if (dot) dot.dataset.state = status.native ? "native" : "browser";
  if (code) {
    code.textContent = [
      "import { applyNativeGlass, setNativeCorners } from '@glasskit/native';",
      "",
      "await applyNativeGlass('acrylic');",
      "await setNativeCorners(true);",
      "",
      "// apps/native-host/src-tauri",
      "// cd apps/native-host/src-tauri && cargo tauri dev",
    ].join("\n");
  }

  const bind = (selector: string, label: string, action: () => Promise<unknown>): void => {
    const button = one<HTMLElement>(selector);
    button?.addEventListener("gk-activate", () => void nativeCall(label, action));
    button?.addEventListener("click", () => void nativeCall(label, action));
  };

  bind("#native-blur", "Blur", () => applyNativeGlass("blur"));
  bind("#native-acrylic", "Acrylic", () => applyNativeGlass("acrylic"));
  bind("#native-round", "Rounded corners", () => setNativeCorners(true));
  bind("#native-clear", "Clear", () => clearNativeGlass());
}

configureTheme();
configureAccents();
configureEventStrip();
configureMotion();
configureNative();
initDesktopLab();
