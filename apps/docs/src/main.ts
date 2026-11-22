import "@glasskit/tokens/tokens.css";
import "./styles.css";

import { tokens } from "@glasskit/tokens";
import {
  animateRecipe,
  animateSpring,
  recipes,
  setReducedMotionOverride,
  springValue,
} from "@glasskit/motion";
import type { RecipeName, SpringConfig } from "@glasskit/motion";
import {
  applyNativeGlass,
  clearNativeGlass,
  nativeStatus,
  setNativeCorners,
} from "@glasskit/native";
import { installGlassKit } from "@glasskit/ui";

installGlassKit();

function one<T extends Element>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function cssKey(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const root = document.documentElement;
const logEl = one<HTMLElement>("#event-log");
const themeToggle = one<HTMLElement>("#theme-toggle");
const themeToggleLabel = one<HTMLElement>("#theme-toggle-label");
const themeToggleIcon = themeToggle?.querySelector("use") ?? null;

function initialTheme(): "light" | "dark" {
  try {
    const saved = localStorage.getItem("gk-docs-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage can be unavailable in private browsing.
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function paintTheme(theme: "light" | "dark"): void {
  root.dataset.gkTheme = theme;
  if (themeToggleLabel) themeToggleLabel.textContent = theme === "dark" ? "Light" : "Dark";
  themeToggleIcon?.setAttribute(
    "href",
    theme === "dark" ? "/icons.svg#icon-sun" : "/icons.svg#icon-moon",
  );
}

paintTheme(initialTheme());

function log(kind: string, message: string): void {
  if (!logEl) return;
  logEl.querySelector(".event-empty")?.remove();
  const row = document.createElement("div");
  row.className = "event-row";
  const stamp = document.createElement("span");
  stamp.className = "event-kind";
  stamp.textContent = kind;
  const text = document.createElement("span");
  text.textContent = message;
  row.append(stamp, text);
  logEl.prepend(row);
  while (logEl.children.length > 40) logEl.lastElementChild?.remove();
}

function eventDetail(event: Event): string {
  const detail = (event as CustomEvent<Record<string, unknown>>).detail;
  if (!detail) return "";
  if (typeof detail.checked === "boolean") return `checked=${detail.checked}`;
  if (typeof detail.value === "string" || typeof detail.value === "number") {
    return `value=${detail.value}`;
  }
  return "";
}

for (const name of ["gk-activate", "gk-input", "gk-change"]) {
  document.addEventListener(name, (event) => {
    const target = event.target as HTMLElement;
    const label = target.tagName.toLowerCase();
    const detail = eventDetail(event);
    log(name.replace("gk-", ""), `${label}${detail ? ` · ${detail}` : ""}`);
  });
}

one<HTMLElement>("#clear-log")?.addEventListener("gk-activate", () => {
  if (!logEl) return;
  logEl.replaceChildren();
  const empty = document.createElement("div");
  empty.className = "event-empty";
  empty.textContent = "No events yet.";
  logEl.append(empty);
});

themeToggle?.addEventListener("gk-activate", () => {
  const next = root.dataset.gkTheme === "light" ? "dark" : "light";
  paintTheme(next);
  try {
    localStorage.setItem("gk-docs-theme", next);
  } catch {
    // Theme still works for this session without persistence.
  }
  log("theme", next);
});

function renderAccents(): void {
  const swatches = one<HTMLElement>("#accent-swatches");
  if (!swatches) return;
  const accents = [
    { name: "Blue", value: "#0a84ff" },
    { name: "Violet", value: "#bf5af2" },
    { name: "Pink", value: "#ff375f" },
    { name: "Orange", value: "#ff9f0a" },
    { name: "Green", value: "#30d158" },
  ];

  for (const accent of accents) {
    const button = document.createElement("button");
    button.className = "swatch";
    button.style.background = accent.value;
    button.title = accent.name;
    button.setAttribute("aria-label", `Use ${accent.name} accent`);
    button.addEventListener("click", () => {
      root.style.setProperty("--gk-color-accent", accent.value);
      root.style.setProperty("--gk-color-accent-fill", hexToRgba(accent.value, 0.16));
      root.style.setProperty("--gk-color-accent-stroke", hexToRgba(accent.value, 0.6));
      log("token", `accent → ${accent.name}`);
    });
    swatches.append(button);
  }
}

function renderTypeScale(): void {
  const scale = one<HTMLElement>("#type-scale");
  if (!scale) return;
  for (const [name, size] of Object.entries(tokens.font.size)) {
    const row = document.createElement("div");
    row.className = "type-row";
    const sample = document.createElement("span");
    sample.className = "type-sample";
    sample.style.fontSize = `var(--gk-font-size-${cssKey(name)})`;
    sample.textContent = "Ag";
    const meta = document.createElement("span");
    meta.className = "type-meta";
    meta.textContent = `${name} · ${size}`;
    row.append(sample, meta);
    scale.append(row);
  }
}

function renderSpacing(): void {
  const grid = one<HTMLElement>("#spacing-grid");
  if (!grid) return;
  for (const [name, value] of Object.entries(tokens.space)) {
    const row = document.createElement("div");
    row.className = "space-row";
    const bar = document.createElement("span");
    bar.className = "space-bar";
    bar.style.width = value === "0" ? "2px" : value;
    const label = document.createElement("span");
    label.textContent = `${name} · ${value}`;
    row.append(bar, label);
    grid.append(row);
  }
}

function renderRadius(): void {
  const grid = one<HTMLElement>("#radius-grid");
  if (!grid) return;
  for (const [name, value] of Object.entries(tokens.radius)) {
    const box = document.createElement("div");
    box.className = "radius-box";
    box.style.borderRadius = value;
    const label = document.createElement("span");
    label.textContent = name;
    box.append(label);
    grid.append(box);
  }
}

function renderMotionTokens(): void {
  const grid = one<HTMLElement>("#motion-token-grid");
  if (!grid) return;
  const durations = Object.entries(tokens.motion.duration)
    .map(([name, value]) => `<div><span>${name}</span><code>${value}</code></div>`)
    .join("");
  const eases = Object.entries(tokens.motion.ease)
    .map(([name, value]) => `<div><span>${name}</span><code>${value}</code></div>`)
    .join("");
  const springs = Object.entries(tokens.motion.spring)
    .map(
      ([name, value]) =>
        `<div><span>${name}</span><code>k ${value.stiffness} · d ${value.damping} · m ${value.mass}</code></div>`,
    )
    .join("");
  grid.innerHTML = `
    <div class="motion-token-group"><h3>Durations</h3>${durations}</div>
    <div class="motion-token-group"><h3>Easings</h3>${eases}</div>
    <div class="motion-token-group"><h3>Springs</h3>${springs}</div>
  `;
}

function renderRecipes(): void {
  const grid = one<HTMLElement>("#recipe-grid");
  const target = one<HTMLElement>("#recipe-target");
  if (!grid || !target) return;
  for (const name of Object.keys(recipes) as RecipeName[]) {
    const button = document.createElement("gk-button");
    button.setAttribute("size", "small");
    button.textContent = name;
    button.addEventListener("gk-activate", () => {
      animateRecipe(target, name);
      log("motion", `recipe · ${name}`);
    });
    grid.append(button);
  }
}

const springConfig: SpringConfig = {
  stiffness: tokens.motion.spring.snappy.stiffness,
  damping: tokens.motion.spring.snappy.damping,
  mass: tokens.motion.spring.snappy.mass,
};

const springBall = one<HTMLElement>("#spring-ball");
const springReplay = one<HTMLElement>("#spring-replay");
const motionMode = one<HTMLElement>("#motion-mode");
const reducedToggle = one<HTMLElement>("#reduced-toggle");

function replaySpring(): void {
  if (!springBall) return;
  for (const animation of springBall.getAnimations()) animation.cancel();
  animateSpring(springBall, "translate", {
    from: 0,
    to: 220,
    unit: "px",
    config: { ...springConfig },
    durationMs: 900,
    steps: 64,
  });
  const peak = springValue(springConfig, 220, 0, 220);
  log(
    "motion",
    `spring · k${springConfig.stiffness} d${springConfig.damping} m${springConfig.mass} · peak ${peak.toFixed(0)}px`,
  );
}

for (const [selector, key] of [
  ["#spring-stiffness", "stiffness"],
  ["#spring-damping", "damping"],
  ["#spring-mass", "mass"],
] as const) {
  one<HTMLElement>(selector)?.addEventListener("gk-change", (event) => {
    const detail = (event as CustomEvent<{ value: number }>).detail;
    springConfig[key] = detail.value;
    replaySpring();
  });
}

springReplay?.addEventListener("gk-activate", replaySpring);

reducedToggle?.addEventListener("gk-change", (event) => {
  const checked = (event as CustomEvent<{ checked: boolean }>).detail.checked;
  setReducedMotionOverride(checked);
  if (motionMode) {
    motionMode.textContent = checked ? "Reduced motion forced" : "System motion";
    motionMode.dataset.state = checked ? "reduced" : "system";
  }
  log("motion", checked ? "reduced motion forced" : "system motion restored");
  replaySpring();
});

async function nativeCall(label: string, action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
    log("native", `${label} applied`);
  } catch (error) {
    log("native", `${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function configureNative(): void {
  const statusText = one<HTMLElement>("#native-status");
  if (!statusText) return;

  const status = nativeStatus();
  const title = one<HTMLElement>("#native-title");
  const reason = one<HTMLElement>("#native-reason");
  const code = one<HTMLElement>("#native-code");

  if (title) title.textContent = status.native ? "Tauri host detected" : "Running in browser preview";
  if (reason) reason.textContent = status.reason;
  statusText.textContent = status.native ? "Tauri host" : "Browser preview";
  statusText.dataset.state = status.native ? "native" : "browser";
  if (code) {
    code.textContent = [
      "import { applyNativeGlass, setNativeCorners } from '@glasskit/native';",
      "",
      "await setNativeCorners(true);",
      "await applyNativeGlass('blur');",
      "",
      "// apps/native-host/src-tauri",
      "glasskit_material::register_commands(tauri::Builder::default())",
      "  .setup(|app| { /* apply blur + rounded corners */ Ok(()) })",
      "",
      "// cd apps/native-host/src-tauri && cargo tauri dev",
    ].join("\n");
  }

  one<HTMLElement>("#native-blur")?.addEventListener("gk-activate", () =>
    void nativeCall("blur", () => applyNativeGlass("blur")),
  );
  one<HTMLElement>("#native-acrylic")?.addEventListener("gk-activate", () =>
    void nativeCall("acrylic", () => applyNativeGlass("acrylic")),
  );
  one<HTMLElement>("#native-round")?.addEventListener("gk-activate", () =>
    void nativeCall("rounded corners", () => setNativeCorners(true)),
  );
  one<HTMLElement>("#native-clear")?.addEventListener("gk-activate", () =>
    void nativeCall("clear", () => clearNativeGlass()),
  );
}

function configureNav(): void {
  const path = window.location.pathname.split("/").pop() ?? "";
  const currentPage = path || "index.html";
  for (const link of document.querySelectorAll<HTMLAnchorElement>(".top-nav a")) {
    if (link.getAttribute("href") !== currentPage) continue;
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }

  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".toc a"));
  if (!tocLinks.length) return;

  const targets: Array<{ link: HTMLAnchorElement; id: string; element: HTMLElement }> = [];
  for (const link of tocLinks) {
    const id = decodeURIComponent(link.hash.slice(1));
    const element = document.getElementById(id);
    if (element) targets.push({ link, id, element });
  }
  if (!targets.length) return;

  const activate = (id: string): void => {
    for (const link of tocLinks) {
      const active = link.hash === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };

  for (const target of targets) {
    target.link.addEventListener("click", () => activate(target.id));
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) activate(visible.target.id);
    },
    { rootMargin: "-96px 0px -65% 0px", threshold: [0, 0.25, 0.6] },
  );
  for (const target of targets) observer.observe(target.element);

  const initial = window.location.hash.slice(1);
  activate(targets.some((target) => target.id === initial) ? initial : targets[0]!.id);
}

function configurePlayground(): void {
  for (const preview of document.querySelectorAll<HTMLElement>(".preview-app")) {
    const panel = preview.closest<HTMLElement>(".preview-panel");
    const buttons = Array.from(
      panel?.querySelectorAll<HTMLButtonElement>("[data-preview-theme]") ?? [],
    );

    const paint = (theme: "light" | "dark"): void => {
      preview.dataset.gkTheme = theme;
      for (const button of buttons) {
        button.setAttribute("aria-pressed", String(button.dataset.previewTheme === theme));
      }
    };

    paint(preview.dataset.gkTheme === "light" ? "light" : "dark");
    for (const button of buttons) {
      button.addEventListener("click", () => {
        paint(button.dataset.previewTheme === "light" ? "light" : "dark");
        log("preview", `${panel?.querySelector("h3")?.textContent?.trim() ?? "Preview"} theme`);
      });
    }

    const status = preview.querySelector<HTMLElement>("[data-preview-status]");
    if (!status) continue;
    for (const name of ["gk-activate", "gk-change", "gk-input"]) {
      preview.addEventListener(name, (event) => {
        const target = event.target as HTMLElement;
        const detail = eventDetail(event);
        const label =
          target.getAttribute("label") ??
          target.textContent?.trim().replace(/\s+/g, " ") ??
          target.tagName.toLowerCase();
        status.textContent = `${name.replace("gk-", "")} · ${label}${detail ? ` · ${detail}` : ""}`;
      });
    }
  }
}

renderAccents();
renderTypeScale();
renderSpacing();
renderRadius();
renderMotionTokens();
renderRecipes();
configureNative();
configureNav();
configurePlayground();
replaySpring();
