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

function must<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
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
const logEl = must<HTMLElement>("#event-log");
const themeToggle = must<HTMLElement>("#theme-toggle");
const heroReplay = must<HTMLElement>("#hero-replay");
const heroNative = must<HTMLElement>("#hero-native");
const recipeGrid = must<HTMLElement>("#recipe-grid");
const recipeTarget = must<HTMLElement>("#recipe-target");
const springBall = must<HTMLElement>("#spring-ball");
const springReplay = must<HTMLElement>("#spring-replay");
const reducedToggle = must<HTMLElement>("#reduced-toggle");
const nativeBadge = must<HTMLElement>("#native-badge");
const nativeStatusBadge = must<HTMLElement>("#native-status-badge");
const nativeTitle = must<HTMLElement>("#native-title");
const nativeReason = must<HTMLElement>("#native-reason");
const nativeCode = must<HTMLElement>("#native-code");
const motionModeBadge = must<HTMLElement>("#motion-mode-badge");

function log(kind: string, message: string): void {
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

must<HTMLElement>("#clear-log").addEventListener("gk-activate", () => {
  logEl.replaceChildren();
  const empty = document.createElement("div");
  empty.className = "event-empty";
  empty.textContent = "Interact with any component above.";
  logEl.append(empty);
});

themeToggle.addEventListener("gk-activate", () => {
  const light = root.dataset.gkTheme !== "light";
  root.dataset.gkTheme = light ? "light" : "dark";
  themeToggle.textContent = light ? "Dark" : "Light";
  log("theme", light ? "light" : "dark");
});

function renderAccents(): void {
  const swatches = must<HTMLElement>("#accent-swatches");
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
  const scale = must<HTMLElement>("#type-scale");
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
  const grid = must<HTMLElement>("#spacing-grid");
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
  const grid = must<HTMLElement>("#radius-grid");
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
  const grid = must<HTMLElement>("#motion-token-grid");
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
    <div class="motion-token-group"><h4>Durations</h4>${durations}</div>
    <div class="motion-token-group"><h4>Easings</h4>${eases}</div>
    <div class="motion-token-group"><h4>Springs</h4>${springs}</div>
  `;
}

function renderRecipes(): void {
  for (const name of Object.keys(recipes) as RecipeName[]) {
    const button = document.createElement("gk-button");
    button.setAttribute("size", "small");
    button.textContent = name;
    button.addEventListener("gk-activate", () => {
      animateRecipe(recipeTarget, name);
      log("motion", `recipe · ${name}`);
    });
    recipeGrid.append(button);
  }
}

const springConfig: SpringConfig = {
  stiffness: tokens.motion.spring.snappy.stiffness,
  damping: tokens.motion.spring.snappy.damping,
  mass: tokens.motion.spring.snappy.mass,
};

function replaySpring(): void {
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
  log("motion", `spring · k${springConfig.stiffness} d${springConfig.damping} m${springConfig.mass} · peak ${peak.toFixed(0)}px`);
}

for (const [selector, key] of [
  ["#spring-stiffness", "stiffness"],
  ["#spring-damping", "damping"],
  ["#spring-mass", "mass"],
] as const) {
  must<HTMLElement>(selector).addEventListener("gk-change", (event) => {
    const detail = (event as CustomEvent<{ value: number }>).detail;
    springConfig[key] = detail.value;
    replaySpring();
  });
}

springReplay.addEventListener("gk-activate", replaySpring);

reducedToggle.addEventListener("gk-change", (event) => {
  const checked = (event as CustomEvent<{ checked: boolean }>).detail.checked;
  setReducedMotionOverride(checked);
  motionModeBadge.textContent = checked ? "Reduced motion forced" : "System motion";
  (motionModeBadge as HTMLElement).setAttribute("tone", checked ? "warning" : "accent");
  log("motion", checked ? "reduced motion forced" : "system motion restored");
  replaySpring();
});

function configureNative(): void {
  const status = nativeStatus();
  nativeTitle.textContent = status.native
    ? "Tauri host detected"
    : "Running in browser preview";
  nativeReason.textContent = status.reason;
  nativeBadge.textContent = status.native ? "Native" : "Browser";
  nativeBadge.setAttribute("tone", status.native ? "success" : "warning");
  nativeStatusBadge.textContent = status.native ? "Tauri host" : "Browser preview";
  nativeStatusBadge.setAttribute("tone", status.native ? "success" : "warning");
  nativeCode.textContent = [
    "import { applyNativeGlass, setNativeCorners } from '@glasskit/native';",
    "",
    "await setNativeCorners(true);",
    "await applyNativeGlass('blur');",
    "",
    "",
    "// apps/native-host/src-tauri",
    "glasskit_material::register_commands(tauri::Builder::default())",
    "  .setup(|app| { /* apply blur + rounded corners */ Ok(()) })",
    "",
    "// cd apps/native-host/src-tauri && cargo tauri dev",
  ].join("\n");
}

async function nativeCall(label: string, action: () => Promise<void>): Promise<void> {
  try {
    await action();
    log("native", `${label} applied`);
  } catch (error) {
    log("native", `${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

must<HTMLElement>("#native-blur").addEventListener("gk-activate", () =>
  void nativeCall("blur", () => applyNativeGlass("blur")),
);
must<HTMLElement>("#native-acrylic").addEventListener("gk-activate", () =>
  void nativeCall("acrylic", () => applyNativeGlass("acrylic")),
);
must<HTMLElement>("#native-round").addEventListener("gk-activate", () =>
  void nativeCall("rounded corners", () => setNativeCorners(true)),
);
must<HTMLElement>("#native-clear").addEventListener("gk-activate", () =>
  void nativeCall("clear", () => clearNativeGlass()),
);
heroNative.addEventListener("gk-activate", () =>
  void nativeCall("hero blur", () => applyNativeGlass("blur")),
);

heroReplay.addEventListener("gk-activate", () => {
  animateRecipe(must<HTMLElement>(".overview-copy"), "panel-in");
  document.querySelectorAll<HTMLElement>(".spec-strip > div").forEach((item, index) => {
    window.setTimeout(() => animateRecipe(item, "popover-in"), index * 50);
  });
});

function configureNav(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".side-nav a"));
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));

  const activate = (id: string): void => {
    for (const link of links) link.classList.toggle("is-active", link.hash === `#${id}`);
  };

  for (const link of links) {
    link.addEventListener("click", () => activate(link.hash.slice(1)));
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activate(entry.target.id);
      }
    },
    { rootMargin: "-15% 0px -75% 0px" },
  );
  for (const section of sections) observer.observe(section);
}

renderAccents();
renderTypeScale();
renderSpacing();
renderRadius();
renderMotionTokens();
renderRecipes();
configureNative();
configureNav();
replaySpring();

animateRecipe(must<HTMLElement>(".overview-copy"), "panel-in");
document.querySelectorAll<HTMLElement>(".spec-strip > div").forEach((item, index) => {
  window.setTimeout(() => animateRecipe(item, "popover-in"), index * 60);
});
