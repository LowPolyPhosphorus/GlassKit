import "@fontsource-variable/inter/wght.css";
import "@glasskit/tokens/tokens.css";
import "./styles.css";

import { animateRecipe } from "@glasskit/motion";
import { applyNativeGlass, nativeStatus, setNativeCorners } from "@glasskit/native";
import { installGlassKit } from "@glasskit/ui";

installGlassKit();

type ThemePreference = "light" | "dark" | "auto";
type DetailValue = string | number | boolean | undefined;

interface PageMeta {
  title: string;
  group: string;
}

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
  return (detail.value ?? detail.checked) as DetailValue;
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
  const value = stored ?? root.dataset.gkThemePreference ?? "auto";
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

function configureAccents(): void {
  const accents = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-accent]"));
  for (const swatch of accents) {
    swatch.addEventListener("click", () => {
      root.style.setProperty("--app-accent", swatch.dataset.accent!);
      root.style.setProperty("--app-accent-fill", swatch.dataset.accentFill!);
      root.style.setProperty("--app-accent-stroke", swatch.dataset.accentStroke!);
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
      if (target === themeMode || target === themeToggle || target === must<HTMLElement>("#sidebar-size")) return;
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
configureAccents();
configureWallpaper();
configureReadouts();
configureActions();
configureWindow();
configureWindowDrag();
configureTaskbar();
configureContextMenu();
configureClock();
void configureNative();
