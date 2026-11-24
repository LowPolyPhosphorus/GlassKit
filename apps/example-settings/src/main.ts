import "@fontsource-variable/inter/wght.css";
import "@glasskit/tokens/tokens.css";
import "./styles.css";

import tokens from "@glasskit/tokens";
import {
  animateRecipe,
  animateSpring,
  clearReducedMotionOverride,
  duration,
  ease,
  getSpring,
  prefersReducedMotion,
  recipeOptions,
  recipes,
  setReducedMotionOverride,
  springKeyframes,
  springValue,
  springs,
  type RecipeName,
  type SpringPresetName,
} from "@glasskit/motion";
import {
  applyNativeGlass,
  clearNativeGlass,
  isTauriHost,
  nativeStatus,
  setNativeCorners,
  type GlassMode,
  type NativeStatus,
} from "@glasskit/native";
import { COMPONENT_REGISTRY, installGlassKit, type GlassKitComponent } from "@glasskit/ui";

installGlassKit();

type ThemePreference = "light" | "dark" | "auto";
type DetailValue = string | number | boolean | undefined;
type KitSlider = HTMLElement & { value: number };
type KitSegmented = HTMLElement & { value: string };
type KitToggle = HTMLElement & { checked: boolean; disabled: boolean };
type KitButton = HTMLElement & { disabled: boolean };

interface PageMeta {
  title: string;
  group: string;
}

const RECIPE_NAMES = Object.keys(recipes) as RecipeName[];
const SPRING_NAMES = Object.keys(springs) as SpringPresetName[];

const PAGES: Record<string, PageMeta> = {
  wifi: { title: "Wi-Fi", group: "Network & internet" },
  bluetooth: { title: "Bluetooth", group: "Network & internet" },
  network: { title: "Network", group: "Network & internet" },
  appearance: { title: "Colors", group: "Personalization" },
  wallpaper: { title: "Background", group: "Personalization" },
  taskbar: { title: "Taskbar", group: "Personalization" },
  notifications: { title: "Notifications", group: "System" },
  sound: { title: "Sound", group: "System" },
  displays: { title: "Display", group: "System" },
  battery: { title: "Power & battery", group: "System" },
  general: { title: "About", group: "System" },
  users: { title: "Accounts", group: "System" },
  kit: { title: "Glass Kit", group: "Glass Kit" },
};

const THEME_KEY = "gk-settings-theme";
const WALLPAPER_KEY = "gk-settings-wallpaper";

function must<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

function detailValue(event: Event): DetailValue {
  if (!(event instanceof CustomEvent) || !event.detail || typeof event.detail !== "object") return undefined;
  const detail = event.detail as Record<string, unknown>;
  const value = detail.value ?? detail.checked;
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? value
    : undefined;
}

function stringValue(value: DetailValue): string {
  if (value === undefined) return "";
  return String(value);
}

const root = document.documentElement;
const windowElement = must<HTMLElement>("#settings-window");
const reopenButton = must<HTMLButtonElement>("#reopen-window");
const nav = must<HTMLElement>("#sidebar-nav");
const pageHost = must<HTMLElement>("#page-host");
const pageTitle = must<HTMLElement>("#page-title");
const breadcrumb = must<HTMLElement>("#breadcrumb");
const backButton = must<HTMLButtonElement>("#back-button");
const search = must<HTMLInputElement>("#settings-search");
const status = must<HTMLElement>("#status");
const themeToggle = must<HTMLElement>("#theme-toggle");
const themeMode = must<HTMLElement>("#theme-mode");
const themeSegmented = themeMode as HTMLElement & { value: string };
const nativeBadge = must<HTMLElement>("#native-badge");
const nativeBadgeDetail = must<HTMLElement>("#native-badge-detail");
const taskbarSettings = must<HTMLButtonElement>("#taskbar-settings");
const titlebar = must<HTMLElement>(".titlebar");
const media = window.matchMedia("(prefers-color-scheme: light)");
const reduceMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
const KIT_CONTROL_IDS = new Set([
  "kit-material-mode",
  "surface-mode",
  "kit-tint",
  "kit-corners",
  "kit-clear-glass",
  "kit-spring-preset",
  "kit-spring-time",
  "kit-reduced-motion",
  "kit-recipe-filter",
  "kit-note-field",
  "kit-hig-search",
  "kit-hig-tabs",
  "kit-hig-tokens",
  "kit-hig-sidebar",
  "kit-atlas-search",
]);

const navItems = Array.from(nav.querySelectorAll<HTMLButtonElement>(".nav-item"));
const panels = Array.from(pageHost.querySelectorAll<HTMLElement>("[data-page-panel]"));
let currentPage = "wifi";
const pageStack: string[] = ["wifi"];

function setStatus(text: string): void {
  status.textContent = text;
}

function resolvedTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "auto") return media.matches ? "light" : "dark";
  return preference;
}

function readPreference(): ThemePreference {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch {
    stored = null;
  }
  const value = stored ?? root.dataset.gkThemePreference ?? "light";
  return value === "light" || value === "dark" ? value : "auto";
}

function applyTheme(preference: ThemePreference, announce = true): void {
  const resolved = resolvedTheme(preference);
  root.dataset.gkTheme = resolved;
  root.dataset.gkThemePreference = preference;
  themeSegmented.value = preference;
  themeToggle.textContent = resolved === "dark" ? "Light" : "Dark";

  const appearanceRow = nav.querySelector<HTMLElement>('[data-page="appearance"] .nav-copy small');
  if (appearanceRow) appearanceRow.textContent = preference === "auto" ? `Auto · ${resolved}` : resolved[0]!.toUpperCase() + resolved.slice(1);

  try {
    localStorage.setItem(THEME_KEY, preference);
  } catch {
    // Private-mode storage fails are safe to ignore.
  }

  if (announce) setStatus(`Appearance: ${preference}${preference === "auto" ? ` · ${resolved}` : ""}`);
}

function showPage(page: string, push = true): void {
  const meta = PAGES[page];
  if (!meta) return;

  if (push && page !== currentPage) {
    pageStack.push(page);
    history.pushState({ page }, "", `#${page}`);
  }

  currentPage = page;
  for (const item of navItems) {
    item.classList.toggle("is-active", item.dataset.page === page);
  }
  for (const panel of panels) {
    panel.hidden = panel.dataset.pagePanel !== page;
  }

  pageTitle.textContent = meta.title;
  breadcrumb.textContent = `Settings / ${meta.group}`;
  document.title = `${meta.title} — Settings`;
  backButton.disabled = pageStack.length <= 1;

  const active = panels.find((panel) => panel.dataset.pagePanel === page);
  if (active) animateRecipe(active, "panel-in");
  setStatus(`${meta.title} selected`);
}

function navigateBack(): void {
  if (pageStack.length <= 1) return;
  pageStack.pop();
  history.back();
}

function filterNavigation(query: string): void {
  const term = query.trim().toLowerCase();
  let visible = 0;

  for (const item of navItems) {
    const haystack = `${item.textContent ?? ""} ${item.dataset.search ?? ""}`.toLowerCase();
    const match = !term || haystack.includes(term);
    item.classList.toggle("is-hidden", !match);
    if (match) visible += 1;
  }

  const nodes = Array.from(nav.children);
  nodes.forEach((node, index) => {
    if (!(node instanceof HTMLParagraphElement)) return;
    let hasVisible = false;
    for (let next = index + 1; next < nodes.length; next += 1) {
      const candidate = nodes[next]!;
      if (candidate instanceof HTMLParagraphElement) break;
      if (candidate instanceof HTMLButtonElement && !candidate.classList.contains("is-hidden")) {
        hasVisible = true;
        break;
      }
    }
    node.hidden = !hasVisible;
  });

  if (term) setStatus(`${visible} result${visible === 1 ? "" : "s"} for “${query.trim()}”`);
  else setStatus("Search cleared");
}

function configureNavigation(): void {
  for (const item of navItems) {
    item.addEventListener("click", () => showPage(item.dataset.page ?? "wifi"));
  }

  backButton.addEventListener("click", navigateBack);
  window.addEventListener("popstate", () => {
    const page = location.hash.replace(/^#/, "") || "wifi";
    if (pageStack.length > 1) pageStack.pop();
    showPage(page, false);
  });
  window.addEventListener("hashchange", () => {
    const page = location.hash.replace(/^#/, "") || "wifi";
    if (page !== currentPage) showPage(page, false);
  });

  const initial = location.hash.replace(/^#/, "");
  showPage(PAGES[initial] ? initial : "wifi", false);
  history.replaceState({ page: currentPage }, "", `${location.pathname}${location.search}#${currentPage}`);
}

function configureSearch(): void {
  search.addEventListener("input", () => filterNavigation(search.value));
  search.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      search.value = "";
      filterNavigation("");
      search.blur();
    }
    if (event.key === "Enter") {
      const first = navItems.find((item) => !item.classList.contains("is-hidden"));
      if (first) {
        showPage(first.dataset.page ?? "wifi");
        search.blur();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
      event.preventDefault();
      search.focus();
      search.select();
    }
    if (event.altKey && event.key === "ArrowLeft") {
      event.preventDefault();
      navigateBack();
    }
  });
}

function configureTheme(): void {
  const preference = readPreference();
  applyTheme(preference, false);
  media.addEventListener("change", () => {
    if (root.dataset.gkThemePreference === "auto") applyTheme("auto", false);
  });

  themeToggle.addEventListener("gk-activate", () => {
    applyTheme(root.dataset.gkTheme === "dark" ? "light" : "dark");
  });

  themeMode.addEventListener("gk-change", (event) => {
    const value = stringValue(detailValue(event));
    if (value === "light" || value === "dark" || value === "auto") applyTheme(value);
  });
}

function configureSurfaceMode(): void {
  const mode = must<HTMLElement & { value: string }>("#surface-mode");
  let stored: string | null = null;
  try {
    stored = localStorage.getItem("gk-settings-material");
  } catch {
    stored = null;
  }
  const initial = stored === "liquid" || stored === "flat" ? stored : "flat";

  const apply = (value: "flat" | "liquid", announce = true): void => {
    mode.value = value;
    if (value === "liquid") root.dataset.gkMaterial = "liquid";
    else delete root.dataset.gkMaterial;
    try {
      localStorage.setItem("gk-settings-material", value);
    } catch {
      // Ignore private-mode storage failures.
    }
    if (announce) setStatus(`Surface counterpart: ${value}`);
  };

  apply(initial, false);
  mode.addEventListener("gk-change", (event) => {
    const value = stringValue(detailValue(event));
    if (value === "flat" || value === "liquid") apply(value);
  });
}

function configureAccents(): void {
  const accents = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-accent]"));
  for (const swatch of accents) {
    swatch.addEventListener("click", () => {
      root.style.setProperty("--app-accent", swatch.dataset.accent!);
      root.style.setProperty("--app-accent-fill", swatch.dataset.accentFill!);
      root.style.setProperty("--app-accent-stroke", swatch.dataset.accentStroke!);
      root.style.setProperty("--gk-color-accent", swatch.dataset.accent!);
      root.style.setProperty("--gk-color-accent-fill", swatch.dataset.accentFill!);
      root.style.setProperty("--gk-color-accent-stroke", swatch.dataset.accentStroke!);
      for (const other of accents) other.classList.toggle("is-selected", other === swatch);
      setStatus(`Accent color: ${swatch.getAttribute("aria-label") ?? "custom"}`);
    });
  }

  const highlights = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-highlight]"));
  for (const swatch of highlights) {
    swatch.addEventListener("click", () => {
      root.style.setProperty("--app-highlight", swatch.dataset.highlight!);
      for (const other of highlights) other.classList.toggle("is-selected", other === swatch);
      setStatus(`Highlight color: ${swatch.getAttribute("aria-label") ?? "custom"}`);
    });
  }

  const size = must<HTMLElement>("#sidebar-size");
  size.addEventListener("gk-change", (event) => {
    const value = stringValue(detailValue(event));
    root.dataset.sidebarSize = value;
    setStatus(`Sidebar icon size: ${value}`);
  });
}

function configureWallpaper(): void {
  const tiles = Array.from(document.querySelectorAll<HTMLButtonElement>(".wallpaper-tile"));
  const preview = must<HTMLElement>("#wallpaper-preview");
  const label = must<HTMLElement>("#wallpaper-preview span");

  for (const tile of tiles) {
    const color = tile.dataset.wallpaper!;
    const swatch = tile.querySelector<HTMLElement>("span");
    swatch?.style.setProperty("--tile-color", color);
  }

  const select = (tile: HTMLButtonElement, announce = true): void => {
    const color = tile.dataset.wallpaper!;
    const name = tile.dataset.name ?? "Wallpaper";
    root.style.setProperty("--app-desktop", color);
    preview.style.setProperty("--app-desktop", color);
    label.textContent = name;
    for (const other of tiles) other.classList.toggle("is-selected", other === tile);
    try {
      localStorage.setItem(WALLPAPER_KEY, name);
    } catch {
      // Ignore storage failures.
    }
    if (announce) setStatus(`Wallpaper: ${name}`);
  };

  for (const tile of tiles) tile.addEventListener("click", () => select(tile));

  let saved: string | null = null;
  try {
    saved = localStorage.getItem(WALLPAPER_KEY);
  } catch {
    saved = null;
  }
  const initial = tiles.find((tile) => tile.dataset.name === saved) ?? tiles[0];
  if (initial) select(initial, false);
}

function configureReadouts(): void {
  const bindings: Array<[string, string, (value: number) => string]> = [
    ["#volume-slider", "#volume-readout", (value) => `${value}%`],
    ["#taskbar-size", "#taskbar-size-readout", (value) => `${value} px`],
    ["#brightness-slider", "#brightness-readout", (value) => `${value}%`],
  ];

  for (const [sliderSelector, readoutSelector, format] of bindings) {
    const slider = document.querySelector<HTMLElement & { value: number }>(sliderSelector);
    const readout = document.querySelector<HTMLElement>(readoutSelector);
    if (!slider || !readout) continue;
    const update = (): void => {
      readout.textContent = format(slider.value);
    };
    slider.addEventListener("gk-input", update);
    slider.addEventListener("input", update);
    update();
  }
}

function configureActions(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-action], [data-detail], [data-connect]")) {
    button.addEventListener("click", () => {
      const label = button.dataset.action ?? button.dataset.detail ?? button.dataset.connect ?? "Action";
      setStatus(`${label} opened`);
    });
  }

  for (const choice of document.querySelectorAll<HTMLButtonElement>(".choice")) {
    choice.addEventListener("click", () => {
      for (const other of document.querySelectorAll<HTMLButtonElement>(".choice")) {
        other.classList.toggle("is-selected", other === choice);
      }
      setStatus(`Output device: ${choice.dataset.output}`);
    });
  }

  for (const name of ["gk-activate", "gk-change", "gk-input"]) {
    document.addEventListener(name, (event) => {
      const target = event.target as HTMLElement;
      if (
        target === themeMode ||
        target === themeToggle ||
        target === must<HTMLElement>("#sidebar-size") ||
        KIT_CONTROL_IDS.has(target.id) ||
        target.dataset.kitAction !== undefined
      ) {
        return;
      }
      const label = target.getAttribute("label") ?? target.textContent?.trim() ?? target.tagName.toLowerCase();
      const value = detailValue(event);
      if (value === undefined) return;
      setStatus(`${name.replace("gk-", "")} · ${label} · ${value}`);
    });
  }
}

let restoreOffset: { left: string; top: string } | null = null;

function setWindowVisible(visible: boolean, message: string): void {
  windowElement.hidden = !visible;
  reopenButton.hidden = visible;
  taskbarSettings.classList.toggle("is-open", visible);
  document.querySelector<HTMLElement>("#context-menu")?.setAttribute("hidden", "");
  setStatus(message);
}

function toggleMaximize(): void {
  const maximized = windowElement.classList.toggle("is-maximized");
  if (maximized) {
    restoreOffset = { left: windowElement.style.left, top: windowElement.style.top };
    windowElement.style.left = "";
    windowElement.style.top = "";
  } else if (restoreOffset) {
    windowElement.style.left = restoreOffset.left;
    windowElement.style.top = restoreOffset.top;
    restoreOffset = null;
  }
  setStatus(maximized ? "Window maximized" : "Window restored");
}

function configureWindow(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-window-action]")) {
    button.addEventListener("click", () => {
      const action = button.dataset.windowAction;
      if (action === "close") setWindowVisible(false, "Window closed");
      if (action === "minimize") setWindowVisible(false, "Window minimized");
      if (action === "maximize") toggleMaximize();
    });
  }

  reopenButton.addEventListener("click", () => setWindowVisible(true, "Window reopened"));
}

function configureWindowDrag(): void {
  let dragging = false;
  let origin = { x: 0, y: 0, left: 0, top: 0 };

  const isControl = (target: EventTarget | null): boolean =>
    target instanceof Element && Boolean(target.closest("button, input, .search-field"));

  titlebar.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || isControl(event.target) || windowElement.classList.contains("is-maximized")) return;
    dragging = true;
    origin = {
      x: event.clientX,
      y: event.clientY,
      left: Number.parseFloat(windowElement.style.left) || 0,
      top: Number.parseFloat(windowElement.style.top) || 0,
    };
    titlebar.classList.add("is-dragging");
    try {
      titlebar.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best-effort; the drag still works with window listeners.
    }
  });

  titlebar.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    windowElement.style.left = `${origin.left + event.clientX - origin.x}px`;
    windowElement.style.top = `${origin.top + event.clientY - origin.y}px`;
  });

  const stopDrag = (event: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    titlebar.classList.remove("is-dragging");
    try {
      titlebar.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore capture-release failures when the pointer was never captured.
    }
  };

  titlebar.addEventListener("pointerup", stopDrag);
  titlebar.addEventListener("pointercancel", stopDrag);
  titlebar.addEventListener("dblclick", (event) => {
    if (!isControl(event.target)) toggleMaximize();
  });
}

function configureTaskbar(): void {
  must<HTMLButtonElement>("#start-button").addEventListener("click", () => {
    setStatus("Start is native Windows chrome in the Tauri host");
  });

  must<HTMLButtonElement>("#taskbar-search").addEventListener("click", () => {
    if (windowElement.hidden) setWindowVisible(true, "Settings restored from taskbar");
    search.focus();
  });

  taskbarSettings.addEventListener("click", () => {
    if (windowElement.hidden) setWindowVisible(true, "Settings restored from taskbar");
    else setWindowVisible(false, "Settings minimized to taskbar");
  });
}

function configureContextMenu(): void {
  const menu = must<HTMLElement>("#context-menu");

  windowElement.addEventListener("contextmenu", (event) => {
    if (!(event.target instanceof Element) || event.target.closest("input, textarea")) return;
    event.preventDefault();
    menu.hidden = false;
    const width = menu.offsetWidth || 210;
    const height = menu.offsetHeight || 168;
    menu.style.left = `${Math.max(8, Math.min(event.clientX, window.innerWidth - width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(event.clientY, window.innerHeight - height - 8))}px`;
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target as Node)) menu.hidden = true;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") menu.hidden = true;
  });
  menu.querySelectorAll<HTMLButtonElement>("[data-context-action]").forEach((button) => {
    button.addEventListener("click", () => {
      setStatus(`${button.dataset.contextAction ?? "Action"} selected`);
      menu.hidden = true;
    });
  });
}

function configureClock(): void {
  const clock = must<HTMLElement>("#clock");
  const update = (): void => {
    clock.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };
  update();
  window.setInterval(update, 30_000);
}

function tokenRows(value: unknown, path: string[] = []): Array<[string, string]> {
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) => tokenRows(child, [...path, key]));
  }
  return [[path.join("."), String(value)]];
}

function configureKitCoverage(): void {
  installGlassKit();
  const host = must<HTMLElement>("#kit-coverage");
  host.replaceChildren();
  must<HTMLElement>("#kit-hero-count").textContent = `${COMPONENT_REGISTRY.length} components`;
  must<HTMLElement>("#kit-registration-count").textContent = `${COMPONENT_REGISTRY.length} elements`;

  for (const { tag, ctor } of COMPONENT_REGISTRY) {
    const row = document.createElement("div");
    row.className = "kit-coverage-row";
    const name = document.createElement("code");
    name.textContent = tag;
    const badge = document.createElement("gk-badge");
    const registered = customElements.get(tag) === ctor;
    badge.setAttribute("tone", registered ? "success" : "danger");
    badge.textContent = registered ? "registered" : "missing";
    row.append(name, badge);
    host.append(row);
  }
}

const GROUP_ORDER = [
  "Core",
  "Material",
  "Layout",
  "Content",
  "Navigation and search",
  "Selection and input",
  "Menus and actions",
  "Presentation",
  "Status",
  "System experiences",
  "Inputs",
];

const ATLAS_ATTRIBUTES: Record<string, Record<string, string>> = {
  "gk-badge": { tone: "accent", dot: "" },
  "gk-button": { variant: "primary" },
  "gk-glass-panel": { tone: "thin" },
  "gk-toggle": { checked: "", label: "Enabled" },
  "gk-list-row": { subtitle: "Aligned detail row" },
  "gk-segmented": { value: "one", label: "Choices" },
  "gk-slider": { label: "Brightness", min: "0", max: "100", value: "68", unit: "%" },
  "gk-text-field": { label: "Name", placeholder: "Enter a value", clearable: "" },
  "gk-box": { title: "Grouped content", subtitle: "Title and subtitle" },
  "gk-chart": { title: "Trend", values: "12,18,14,24,20,9", labels: "Mon,Tue,Wed,Thu,Fri,Sat" },
  "gk-color-well": { value: "#0a84ff" },
  "gk-combo-box": {},
  "gk-collection": { columns: "2", gap: "8px" },
  "gk-column-view": {
    columns: '[{"title":"Library","selected":"Living Room","items":["Living Room","Kitchen"]},{"title":"Devices","items":[{"label":"Lights","subtitle":"6 devices"}]}]',
  },
  "gk-control-tile": { label: "Wi-Fi", state: "on" },
  "gk-digit-entry-view": {},
  "gk-disclosure": { label: "Details", open: "" },
  "gk-image-view": {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='120'%3E%3Crect width='240' height='120' fill='%231f2430'/%3E%3Ccircle cx='120' cy='60' r='26' fill='none' stroke='%230a84ff' stroke-width='3'/%3E%3C/svg%3E",
    alt: "Abstract preview",
    ratio: "16 / 9",
  },
  "gk-image-well": {},
  "gk-label": { text: "Selectable static text", variant: "caption" },
  "gk-live-activity": { title: "Air purifier", status: "Filter at 82%", progress: "82", "action-label": "Pause", expanded: "" },
  "gk-notification": { title: "Automation ready", message: "Your scene is available.", tone: "info" },
  "gk-path-control": { items: '["Home","Living Room","Lights"]' },
  "gk-picker": {},
  "gk-search-field": { label: "Search", placeholder: "Search components", scopes: '["All","Core","HIG"]', scope: "All" },
  "gk-sidebar": { label: "Sections", active: "general" },
  "gk-snippet": { kind: "confirmation", title: "Run scene?", message: "This dims the lights." },
  "gk-status-bar": { label: "Home", status: "All systems normal", network: "Wi-Fi", battery: "82%", time: "09:41" },
  "gk-stepper": { value: "2", min: "0", max: "8" },
  "gk-tab-bar": { tabs: '[{"id":"all","label":"All"},{"id":"core","label":"Core"},{"id":"hig","label":"HIG"}]', active: "all" },
  "gk-token-field": { label: "Rooms", placeholder: "Add a room", tokens: '["Kitchen","Hallway"]' },
  "gk-virtual-keyboard": {},
  "gk-web-view": { title: "Inline content", height: "90", srcdoc: "<p>Sandboxed content stays inside the app.</p>" },
  "gk-action-menu": {
    label: "Actions",
    items: '[{"label":"Duplicate","detail":"⌘D"},{"label":"Rename"},{"separator":true},{"label":"Delete","value":"delete"}]',
  },
  "gk-async-image": {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%231c1c1e'/%3E%3Ccircle cx='160' cy='90' r='30' fill='none' stroke='%230a84ff' stroke-width='4'/%3E%3C/svg%3E",
    alt: "Abstract preview",
    ratio: "16 / 9",
  },
  "gk-content-unavailable": {
    title: "No results",
    message: "Try a different room or clear the filter.",
    "action-label": "Clear filter",
    search: "",
  },
  "gk-date-picker": { label: "Start date", value: "2026-11-23T09:00", components: "date,hourAndMinute" },
  "gk-navigation-link": { label: "Living Room", detail: "6 devices", value: "living-room" },
  "gk-progress-view": { label: "Syncing", value: "68", total: "100", "current-value-label": "68%" },
  "gk-text-editor": { label: "Notes", value: "Describe the scene you want to save.", rows: "3", "max-length": "120" },
  "gk-value-gauge": { label: "Comfort", value: "68", min: "0", max: "100", "current-value-label": "68%" },
  "gk-alert-dialog": {
    title: "Discard scene?",
    message: "This removes changes that have not been saved.",
    "trigger-label": "Review",
    "action-label": "Discard",
    "cancel-label": "Keep editing",
    tone: "danger",
  },
  "gk-color-picker": {
    label: "Accent color",
    value: "#0a84ff",
    swatches: '["#0a84ff","#30d158","#ff9f0a","#ff453a"]',
  },
  "gk-data-table": {
    caption: "Devices",
    columns: '[{"key":"name","title":"Device"},{"key":"room","title":"Room"},{"key":"state","title":"State","align":"end"}]',
    rows: '[{"id":"lights","name":"Lights","room":"Living Room","state":"On"},{"id":"thermostat","name":"Thermostat","room":"Hallway","state":"Auto"},{"id":"lock","name":"Front Lock","room":"Entry","state":"Locked"}]',
    "row-key": "id",
    value: "lights",
  },
  "gk-stepper-control": { label: "Brightness", value: "2", min: "0", max: "8", step: "1", unit: "×" },
  "gk-value-picker": {
    label: "Notify me about",
    value: "mentions",
    options: '[{"label":"Direct messages","value":"direct","detail":"Only people you follow"},{"label":"Mentions","value":"mentions","detail":"When your name appears"},{"label":"Anything","value":"all","detail":"Every update"}]',
  },
  "gk-web-link": { label: "SwiftUI documentation", href: "https://developer.apple.com/documentation/swiftui/", detail: "Source" },
  "gk-grid-view": {
    caption: "Rooms",
    columns: "3",
    items: '[{"label":"Living Room","value":"living","detail":"6 devices","badge":"Active"},{"label":"Kitchen","value":"kitchen","detail":"4 devices"},{"label":"Entry","value":"entry","detail":"2 devices","badge":"Away"}]',
    value: "living",
  },
  "gk-navigation-stack": {
    title: "Destinations",
    items: '[{"label":"Living Room","value":"living","detail":"6 devices","description":"Lights, climate, and media in the main living space."},{"label":"Kitchen","value":"kitchen","detail":"4 devices","description":"Counter lights, kettle, and fridge sensors."}]',
  },
  "gk-secure-field": {
    label: "Password",
    value: "glasskit-preview",
    placeholder: "Enter a password",
    caption: "Private text stays masked until revealed.",
    autocomplete: "current-password",
  },
  "gk-form": {
    label: "Scene settings",
    "submit-label": "Save form",
    "show-actions": "",
    sections: '[{"title":"Notifications","rows":[{"label":"Notify me about","control":"picker","value":"mentions","options":[{"label":"Direct messages","value":"direct"},{"label":"Mentions","value":"mentions"},{"label":"Anything","value":"all"}]},{"label":"Play notification sounds","control":"toggle","checked":true}],"footer":"Choose how alerts arrive."},{"title":"Profile","rows":[{"label":"Display name","control":"text","value":"Home Hub"},{"label":"Repeat","control":"stepper","value":"2","min":"0","max":"8"}]}]',
  },
  "gk-disclosure-group": {
    label: "Details",
    items: '[{"title":"Items","expanded":true,"content":"Light, climate, and media controls.","children":[{"title":"Sub-items","content":"Scene steps and schedules."}]},{"title":"Access","content":"Who can run this scene."}]',
  },
  "gk-editable-list": {
    label: "Oceans",
    items: '[{"label":"Living Room","value":"living","detail":"6 devices"},{"label":"Kitchen","value":"kitchen","detail":"4 devices"},{"label":"Entry","value":"entry","detail":"2 devices"}]',
  },
  "gk-control-group": {
    label: "Playback",
    items: '[{"label":"Rewind","value":"rewind"},{"label":"Play","value":"play","variant":"primary"},{"label":"Forward","value":"forward"},{"label":"Share","value":"share","variant":"quiet","disabled":true}]',
  },
  "gk-navigation-split-view": {
    title: "Library",
    columns: "3",
    sections: '[{"value":"living","label":"Living Room","detail":{"title":"Living Room","body":"Six responsive devices."},"children":[{"value":"lights","label":"Lights","detail":{"title":"Lights","body":"Three scenes available."}},{"value":"climate","label":"Climate","detail":{"title":"Climate","body":"21 °C, auto."}}]},{"value":"kitchen","label":"Kitchen","detail":{"title":"Kitchen","body":"Four devices."},"children":[{"value":"sensors","label":"Sensors","detail":{"title":"Sensors","body":"Occupancy and temperature."}}]}]',
  },
  "gk-confirmation-dialog": {
    "trigger-label": "Choose destination",
    title: "Resume workout recording",
    message: "Choose a destination for workout data.",
    actions: '[{"label":"Append to current workout","value":"append"},{"label":"Overwrite current workout","value":"overwrite","style":"destructive"},{"label":"Cancel","value":"cancel","style":"cancel"}]',
  },
};

const ATLAS_CHILDREN: Record<string, string> = {
  "gk-button": "Action",
  "gk-badge": "Status",
  "gk-glass-panel": "Padded, rounded surface",
  "gk-list-row": "List row",
  "gk-segmented": '<button value="one">One</button><button value="two">Two</button>',
  "gk-box": '<gk-label text="Shared token system" variant="caption"></gk-label>',
  "gk-sidebar":
    '<span slot="header">Sections</span><gk-sidebar-item value="general" label="General" selected></gk-sidebar-item><gk-sidebar-item value="about" label="About"></gk-sidebar-item>',
};

function createAtlasPreview(component: GlassKitComponent): HTMLElement {
  const element = document.createElement(component.tag);
  for (const [name, value] of Object.entries(ATLAS_ATTRIBUTES[component.tag] ?? {})) {
    element.setAttribute(name, value);
  }
  if (ATLAS_CHILDREN[component.tag]) element.innerHTML = ATLAS_CHILDREN[component.tag];
  element.setAttribute("aria-label", component.title);
  return element;
}

function atlasGroupRank(group: string): number {
  const index = GROUP_ORDER.indexOf(group);
  return index === -1 ? GROUP_ORDER.length : index;
}

function populateAtlasPickers(): { group: HTMLSelectElement; component: HTMLSelectElement } {
  const group = must<HTMLSelectElement>("#kit-atlas-group");
  const component = must<HTMLSelectElement>("#kit-atlas-component");
  const groupValues = Array.from(new Set(COMPONENT_REGISTRY.map((item) => item.group))).sort(
    (left, right) => atlasGroupRank(left) - atlasGroupRank(right) || left.localeCompare(right),
  );

  for (const select of [group, component]) select.replaceChildren();
  const allGroups = document.createElement("option");
  allGroups.value = "all";
  allGroups.textContent = "All groups";
  group.append(allGroups);
  for (const value of groupValues) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    group.append(option);
  }

  const allComponents = document.createElement("option");
  allComponents.value = "all";
  allComponents.textContent = "All components";
  component.append(allComponents);
  for (const item of COMPONENT_REGISTRY) {
    const option = document.createElement("option");
    option.value = item.tag;
    option.textContent = `${item.title} · ${item.tag}`;
    component.append(option);
  }
  return { group, component };
}

function renderKitAtlas(query: string, group: string, componentId: string): number {
  const host = must<HTMLElement>("#kit-atlas");
  const needle = query.trim().toLowerCase();
  const matches = COMPONENT_REGISTRY.filter((component) => {
    const text = `${component.title} ${component.tag} ${component.group} ${component.description}`.toLowerCase();
    return text.includes(needle) && (group === "all" || component.group === group) && (componentId === "all" || component.tag === componentId);
  });

  const grouped = new Map<string, GlassKitComponent[]>();
  for (const component of matches) {
    const list = grouped.get(component.group) ?? [];
    list.push(component);
    grouped.set(component.group, list);
  }
  const names = Array.from(grouped.keys()).sort(
    (left, right) => atlasGroupRank(left) - atlasGroupRank(right) || left.localeCompare(right),
  );
  const focused = Boolean(needle || group !== "all" || componentId !== "all");

  host.replaceChildren();
  for (const [index, name] of names.entries()) {
    const items = grouped.get(name)!;
    const section = document.createElement("details");
    section.className = "kit-atlas-group";
    section.open = focused || index === 0 || items.length <= 6;

    const summary = document.createElement("summary");
    const title = document.createElement("strong");
    title.textContent = name;
    const count = document.createElement("span");
    count.textContent = `${items.length}`;
    summary.append(title, count);

    const grid = document.createElement("div");
    grid.className = "kit-atlas-group__grid";
    for (const component of items) {
      const card = document.createElement("article");
      card.className = "kit-atlas-card";

      const head = document.createElement("div");
      head.className = "kit-atlas-card__head";
      const componentTitle = document.createElement("strong");
      componentTitle.textContent = component.title;
      const tag = document.createElement("code");
      tag.textContent = component.tag;
      head.append(componentTitle, tag);

      const body = document.createElement("div");
      body.className = "kit-atlas-card__body";
      body.append(createAtlasPreview(component));

      const meta = document.createElement("span");
      meta.textContent = component.group;

      card.append(head, body, meta);
      grid.append(card);
    }

    section.append(summary, grid);
    host.append(section);
  }

  return matches.length;
}

function configureKitAtlas(): void {
  const search = must<HTMLElement & { value: string }>("#kit-atlas-search");
  const count = must<HTMLElement>("#kit-atlas-count");
  const readout = must<HTMLElement>("#kit-atlas-readout");
  const pickers = populateAtlasPickers();

  const paint = (): void => {
    const total = renderKitAtlas(search.value, pickers.group.value, pickers.component.value);
    count.textContent = `${total} / ${COMPONENT_REGISTRY.length} shown`;
    readout.textContent =
      total === COMPONENT_REGISTRY.length
        ? "Every registered Glass Kit element is rendered here."
        : `${total} components match the filter.`;
  };

  for (const control of [search, pickers.group, pickers.component]) {
    control.addEventListener("gk-input", paint);
    control.addEventListener("gk-change", paint);
    control.addEventListener("change", paint);
  }
  paint();
}

function configureKitHig(): void {
  const readout = must<HTMLElement>("#kit-hig-readout");
  const names = [
    "gk-select",
    "gk-open",
    "gk-close",
    "gk-navigate",
    "gk-tab-change",
    "gk-scope-change",
    "gk-clear",
    "gk-token-add",
    "gk-token-remove",
    "gk-token-change",
    "gk-toggle",
    "gk-state-change",
    "gk-dismiss",
    "gk-expand-change",
    "gk-confirm",
    "gk-cancel",
    "gk-point-select",
    "gk-load",
    "gk-sort",
    "gk-reveal-change",
    "gk-submit",
    "gk-reset",
    "gk-delete",
    "gk-move",
    "gk-edit-change",
    "gk-control",
    "gk-error",
  ];

  for (const name of names) {
    document.addEventListener(name, (event) => {
      const detail = (event as CustomEvent<Record<string, unknown>>).detail ?? {};
      const info = Object.entries(detail)
        .filter(([key, value]) => key !== "source" && value !== null && typeof value !== "object")
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(" ");
      readout.textContent = `${name}${info ? ` · ${info}` : ""}`;
      setStatus(`HIG pattern: ${name}`);
    });
  }
}

function configureKitTokens(): void {
  const summary = must<HTMLElement>("#kit-token-summary");
  const grid = must<HTMLElement>("#kit-token-grid");
  const vars = must<HTMLElement>("#kit-token-vars");
  const tones = ["accent", "success", "warning", "danger", ""];

  summary.replaceChildren();
  Object.entries(tokens).forEach(([group, values], index) => {
    const badge = document.createElement("gk-badge");
    if (tones[index]) badge.setAttribute("tone", tones[index]!);
    badge.textContent = `${group} · ${Object.keys(values as object).length}`;
    summary.append(badge);
  });

  grid.replaceChildren();
  for (const [path, value] of tokenRows(tokens)) {
    const row = document.createElement("div");
    row.className = "kit-token-row";
    const name = document.createElement("code");
    name.textContent = path;
    const tokenValue = document.createElement("span");
    tokenValue.textContent = value;
    row.append(name, tokenValue);
    grid.append(row);
  }

  const cssVars = [
    "--gk-color-accent",
    "--gk-radius-md",
    "--gk-space-3",
    "--gk-font-size-md",
    "--gk-font-weight-medium",
    "--gk-font-tracking-tight",
    "--gk-material-blur-px",
    "--gk-material-saturate",
    "--gk-motion-duration-base",
    "--gk-motion-ease-emphasized",
  ];
  vars.replaceChildren();
  for (const name of cssVars) {
    const row = document.createElement("div");
    row.className = "kit-token-row";
    const label = document.createElement("code");
    label.textContent = name;
    const value = document.createElement("span");
    value.textContent = getComputedStyle(root).getPropertyValue(name).trim();
    row.append(label, value);
    vars.append(row);
  }
}

let kitAnimation: Animation | null = null;
let kitSequence = 0;

function setKitMotionState(text: string): void {
  must<HTMLElement>("#kit-motion-state").textContent = text;
}

function stopMotionSequence(): void {
  kitSequence += 1;
  kitAnimation?.cancel();
  kitAnimation = null;
  setKitMotionState("Idle");
}

function runRecipe(name: RecipeName): Animation {
  const preview = must<HTMLElement>("#kit-motion-preview");
  const recipe = recipes[name];
  const reduced = prefersReducedMotion();
  const frames: Keyframe[] = reduced
    ? [recipe.reducedFrom, recipe.reducedTo]
    : [recipe.from, recipe.to];

  kitAnimation?.cancel();
  preview.style.left = "0px";
  kitAnimation = animateRecipe(preview, name, frames, { fill: "both" });
  setKitMotionState(name);
  return kitAnimation;
}

function playRecipe(name: RecipeName): void {
  stopMotionSequence();
  runRecipe(name);
  setStatus(`Motion recipe: ${name}`);
}

async function playAllRecipes(): Promise<void> {
  stopMotionSequence();
  const token = kitSequence;
  for (const name of RECIPE_NAMES) {
    if (token !== kitSequence) return;
    const animation = runRecipe(name);
    try {
      await animation.finished;
    } catch {
      return;
    }
  }
  if (token === kitSequence) {
    setKitMotionState("Complete");
    setStatus(`Played all ${RECIPE_NAMES.length} motion recipes`);
  }
}

function playSpring(): void {
  stopMotionSequence();
  const preset = (must<HTMLElement>("#kit-spring-preset") as KitSegmented).value as SpringPresetName;
  const time = (must<HTMLElement>("#kit-spring-time") as KitSlider).value || 420;
  kitAnimation = animateSpring(must<HTMLElement>("#kit-motion-preview"), "left", {
    preset,
    from: 0,
    to: 48,
    unit: "px",
    durationMs: time,
    fill: "both",
  });
  setKitMotionState(`spring · ${preset}`);
  setStatus(`Spring preview: ${preset}`);
}

function updateSpringMetrics(): void {
  const preset = (must<HTMLElement>("#kit-spring-preset") as KitSegmented).value as SpringPresetName;
  const time = (must<HTMLElement>("#kit-spring-time") as KitSlider).value;
  const config = getSpring(preset);
  const sample = springValue(config, time);
  const frames = springKeyframes({
    property: "opacity",
    preset,
    durationMs: Math.max(time, 80),
    steps: 12,
  });
  const options = recipeOptions("panel-in");

  must<HTMLElement>("#kit-spring-readout").textContent = `${time} ms`;
  must<HTMLElement>("#kit-metrics").textContent =
    `${preset}: k=${config.stiffness} c=${config.damping} m=${config.mass} · ` +
    `sample ${sample.toFixed(3)} · ${frames.length} keyframes · ${SPRING_NAMES.length} presets · ` +
    `${duration("fast")} / ${ease("standard")} · ${options.fill} · ` +
    `reduced ${prefersReducedMotion() ? "on" : "off"}`;
}

function applyReducedPreference(value: string): void {
  if (value === "reduced") setReducedMotionOverride(true);
  else if (value === "full") setReducedMotionOverride(false);
  else clearReducedMotionOverride();
  updateSpringMetrics();
  setStatus(`Reduced motion: ${value}`);
}

function renderRecipeRows(filter = ""): void {
  const host = must<HTMLElement>("#kit-recipe-list");
  const term = filter.trim().toLowerCase();
  const names = RECIPE_NAMES.filter((name) => name.includes(term));
  host.replaceChildren();

  for (const name of names) {
    const recipe = recipes[name];
    const row = document.createElement("gk-list-row");
    row.setAttribute("subtitle", "");
    row.setAttribute("interactive", "");
    row.dataset.recipe = name;
    row.innerHTML = `
      <svg slot="leading" class="row-icon"><use href="/icons.svg#icon-sparkle" /></svg>
      ${name}
      <span slot="subtitle">${recipe.preset} · ${recipe.durationMs}ms · ${ease("standard")}</span>
      <svg slot="trailing" class="row-chevron"><use href="/icons.svg#icon-arrow-right" /></svg>`;
    row.addEventListener("click", () => playRecipe(name));
    host.append(row);
  }

  if (names.length === 0) {
    const empty = document.createElement("p");
    empty.className = "kit-empty";
    empty.textContent = `No recipes match “${filter}”`;
    host.append(empty);
  }
}

function configureKitActions(): void {
  const note = must<HTMLElement>("#kit-note-field");
  const noteReadout = must<HTMLElement>("#kit-note-readout");
  const updateNote = (event?: Event): void => {
    const value = event ? stringValue(detailValue(event)) : note.getAttribute("value") ?? "";
    noteReadout.textContent = value ? `Value: ${value}` : "Type a note to see gk-input and gk-change";
    if (event?.type === "gk-change") setStatus(`Text field committed: ${value || "empty"}`);
  };
  note.addEventListener("gk-input", updateNote);
  note.addEventListener("gk-change", updateNote);
  updateNote();

  document.addEventListener("gk-activate", (event) => {
    const source = (event as CustomEvent<{ source?: HTMLElement }>).detail?.source;
    if (!(source instanceof HTMLElement)) return;
    const action = source.dataset.kitAction;
    if (!action) return;

    if (action === "play-recipes") void playAllRecipes();
    else if (action === "stop-motion") stopMotionSequence();
    else if (action === "play-spring") playSpring();
    else if (action === "reinstall") {
      installGlassKit();
      configureKitCoverage();
      setStatus("Glass Kit components re-registered");
    } else {
      setStatus(`Kit button: ${action}`);
    }
  });
}

function configureKitMotion(): void {
  renderRecipeRows();
  updateSpringMetrics();

  const filter = must<HTMLElement>("#kit-recipe-filter");
  filter.addEventListener("gk-input", (event) => renderRecipeRows(stringValue(detailValue(event))));
  filter.addEventListener("gk-change", (event) => renderRecipeRows(stringValue(detailValue(event))));

  const preset = must<HTMLElement>("#kit-spring-preset");
  const time = must<HTMLElement>("#kit-spring-time");
  const reduced = must<HTMLElement>("#kit-reduced-motion");

  preset.addEventListener("gk-change", () => {
    updateSpringMetrics();
    playSpring();
  });
  time.addEventListener("gk-input", updateSpringMetrics);
  time.addEventListener("gk-change", playSpring);
  reduced.addEventListener("gk-change", (event) => applyReducedPreference(stringValue(detailValue(event))));
  reduceMedia.addEventListener("change", () => {
    if ((reduced as KitSegmented).value === "system") updateSpringMetrics();
  });
}

function configureKitMaterial(native: NativeStatus): void {
  const ready = native.native && isTauriHost();
  const mode = must<HTMLElement>("#kit-material-mode") as KitSegmented;
  const tint = must<HTMLElement>("#kit-tint") as KitSlider;
  const corners = must<HTMLElement>("#kit-corners") as KitToggle;
  const clear = must<HTMLElement>("#kit-clear-glass") as KitButton;
  const badge = must<HTMLElement>("#kit-native-badge");
  const reason = must<HTMLElement>("#kit-native-reason");
  const readout = must<HTMLElement>("#kit-tint-readout");

  badge.textContent = ready ? "Native" : "Browser";
  badge.setAttribute("tone", ready ? "success" : "warning");
  reason.textContent = native.reason;
  clear.disabled = !ready;
  corners.disabled = !ready;

  const updateTint = (): void => {
    const alpha = Math.round(tint.value);
    const progress = getComputedStyle(tint).getPropertyValue("--gk-slider-progress").trim();
    readout.textContent = `${alpha} · ${progress}`;
  };

  const apply = async (announce = true): Promise<void> => {
    updateTint();
    if (!ready) {
      if (announce) setStatus(native.reason);
      return;
    }
    const selected = mode.value as GlassMode;
    const alpha = Math.round(tint.value);
    try {
      await applyNativeGlass(selected, (alpha << 24) | 0x00ffffff);
      if (announce) setStatus(`Native material: ${selected} · alpha ${alpha}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  };

  mode.addEventListener("gk-change", () => void apply());
  tint.addEventListener("gk-input", updateTint);
  tint.addEventListener("gk-change", () => void apply());
  corners.addEventListener("gk-change", (event) => {
    const checked = Boolean(detailValue(event));
    if (!ready) return;
    void setNativeCorners(checked)
      .then(() => setStatus(`Rounded corners: ${checked ? "on" : "off"}`))
      .catch((error: unknown) => setStatus(error instanceof Error ? error.message : String(error)));
  });
  clear.addEventListener("gk-activate", () => {
    if (!ready) return;
    void clearNativeGlass()
      .then(() => setStatus("Native glass cleared"))
      .catch((error: unknown) => setStatus(error instanceof Error ? error.message : String(error)));
  });

  updateTint();
}

function configureKit(): void {
  const native = nativeStatus();
  configureKitCoverage();
  configureKitAtlas();
  configureKitHig();
  configureKitTokens();
  configureKitMotion();
  configureKitMaterial(native);
  configureKitActions();
}

async function configureNative(): Promise<void> {
  const native = nativeStatus();
  const label = native.native ? "Native" : "Browser";
  nativeBadge.textContent = label;
  nativeBadgeDetail.textContent = native.native ? "Native glass active" : "Browser preview";
  nativeBadge.setAttribute("tone", native.native ? "success" : "warning");
  nativeBadgeDetail.setAttribute("tone", native.native ? "success" : "warning");
  setStatus(native.reason);

  if (!native.native) return;
  try {
    await setNativeCorners(true);
    await applyNativeGlass("blur");
    setStatus("Native glass applied to this window");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  }
}

configureNavigation();
configureSearch();
configureTheme();
configureSurfaceMode();
configureAccents();
configureWallpaper();
configureReadouts();
configureActions();
configureWindow();
configureWindowDrag();
configureTaskbar();
configureContextMenu();
configureClock();
configureKit();
void configureNative();
