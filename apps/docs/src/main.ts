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
const themeToggleLabel = must<HTMLElement>("#theme-toggle-label");
const recipeGrid = must<HTMLElement>("#recipe-grid");
const recipeTarget = must<HTMLElement>("#recipe-target");
const springBall = must<HTMLElement>("#spring-ball");
const springReplay = must<HTMLElement>("#spring-replay");
const reducedToggle = must<HTMLElement>("#reduced-toggle");
const nativeStatusText = must<HTMLElement>("#native-status");
const nativeTitle = must<HTMLElement>("#native-title");
const nativeReason = must<HTMLElement>("#native-reason");
const nativeCode = must<HTMLElement>("#native-code");
const motionMode = must<HTMLElement>("#motion-mode");

function initialTheme(): "light" | "dark" {
  try {
    const saved = localStorage.getItem("gk-docs-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage can be unavailable in private browsing.
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

const startingTheme = initialTheme();
root.dataset.gkTheme = startingTheme;
themeToggleLabel.textContent = startingTheme === "dark" ? "Light" : "Dark";

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
  empty.textContent = "No events yet.";
  logEl.append(empty);
});

themeToggle.addEventListener("gk-activate", () => {
  const next = root.dataset.gkTheme === "light" ? "dark" : "light";
  root.dataset.gkTheme = next;
  themeToggleLabel.textContent = next === "dark" ? "Light" : "Dark";
  try {
    localStorage.setItem("gk-docs-theme", next);
  } catch {
    // Theme still works for this session without persistence.
  }
  log("theme", next);
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
  motionMode.textContent = checked ? "Reduced motion forced" : "System motion";
  motionMode.dataset.state = checked ? "reduced" : "system";
  log("motion", checked ? "reduced motion forced" : "system motion restored");
  replaySpring();
});

function configureNative(): void {
  const status = nativeStatus();
  nativeTitle.textContent = status.native
    ? "Tauri host detected"
    : "Running in browser preview";
  nativeReason.textContent = status.reason;
  nativeStatusText.textContent = status.native ? "Tauri host" : "Browser preview";
  nativeStatusText.dataset.state = status.native ? "native" : "browser";
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
function configureNav(): void {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      ".top-nav a, .chapter-nav a, .toc a",
    ),
  );
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));

  const activate = (id: string): void => {
    for (const link of links) {
      const active = link.hash === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
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
  activate("overview");
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
