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
import { COMPONENT_REGISTRY, installGlassKit, type GlassKitComponent } from "@glasskit/ui";
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

const PREVIEW_ATTRIBUTES: Record<string, Record<string, string>> = {
  "gk-badge": { tone: "accent", dot: "" },
  "gk-button": { variant: "primary" },
  "gk-glass-panel": { tone: "thin" },
  "gk-toggle": { checked: "", label: "Enabled" },
  "gk-list-row": { subtitle: "Aligned detail row" },
  "gk-segmented": { value: "one", label: "Choices" },
  "gk-slider": { label: "Brightness", min: "0", max: "100", value: "68", unit: "%" },
  "gk-text-field": { label: "Name", placeholder: "Enter a value", clearable: "" },
  "gk-toolbar": {},
  "gk-box": { title: "Grouped content", subtitle: "Title and subtitle" },
  "gk-chart": { title: "Trend", values: "12,18,14,24,20,9", labels: "Mon,Tue,Wed,Thu,Fri,Sat" },
  "gk-collection": { columns: "2", gap: "8px" },
  "gk-column-view": {
    columns: '[{"title":"Library","selected":"Living Room","items":["Living Room","Kitchen"]},{"title":"Devices","items":[{"label":"Lights","subtitle":"6 devices"}]}]',
  },
  "gk-control-tile": { label: "Wi-Fi", state: "on" },
  "gk-disclosure": { label: "Details", open: "" },
  "gk-image-view": {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='120'%3E%3Crect width='240' height='120' fill='%231f2430'/%3E%3Ccircle cx='120' cy='60' r='26' fill='none' stroke='%230a84ff' stroke-width='3'/%3E%3C/svg%3E",
    alt: "Abstract preview",
    ratio: "16 / 9",
  },
  "gk-label": { text: "Selectable static text", variant: "caption" },
  "gk-live-activity": { title: "Air purifier", status: "Filter at 82%", progress: "82", "action-label": "Pause", expanded: "" },
  "gk-notification": { title: "Automation ready", message: "Your scene is available.", tone: "info" },
  "gk-path-control": { items: '["Home","Living Room","Lights"]' },
  "gk-search-field": { label: "Search", placeholder: "Search components", scopes: '["All","Core","HIG"]', scope: "All" },
  "gk-sidebar": { label: "Sections", active: "general" },
  "gk-snippet": { kind: "confirmation", title: "Run scene?", message: "This dims the lights." },
  "gk-status-bar": { label: "Home", status: "All systems normal", network: "Wi-Fi", battery: "82%", time: "09:41" },
  "gk-tab-bar": { tabs: '[{"id":"all","label":"All"},{"id":"core","label":"Core"},{"id":"hig","label":"HIG"}]', active: "all" },
  "gk-token-field": { label: "Rooms", placeholder: "Add a room", tokens: '["Kitchen","Hallway"]' },
  "gk-web-view": { title: "Inline content", height: "90", srcdoc: "<p>Sandboxed content stays inside the app.</p>" },
};

const PREVIEW_CHILDREN: Record<string, string> = {
  "gk-button": "Action",
  "gk-badge": "Status",
  "gk-glass-panel": "Padded, rounded surface",
  "gk-list-row": "List row",
  "gk-segmented": '<button value="one">One</button><button value="two">Two</button>',
  "gk-toolbar": '<gk-button size="small">Action</gk-button><gk-button size="small" variant="quiet">More</gk-button>',
  "gk-box": '<gk-label text="Shared token system" variant="caption"></gk-label>',
  "gk-sidebar":
    '<span slot="header">Sections</span><gk-sidebar-item value="general" label="General" selected></gk-sidebar-item><gk-sidebar-item value="about" label="About"></gk-sidebar-item>',
};

function createComponentPreview(component: GlassKitComponent): HTMLElement {
  const element = document.createElement(component.tag);
  for (const [name, value] of Object.entries(PREVIEW_ATTRIBUTES[component.tag] ?? {})) {
    element.setAttribute(name, value);
  }
  if (PREVIEW_CHILDREN[component.tag]) element.innerHTML = PREVIEW_CHILDREN[component.tag];
  element.setAttribute("aria-label", component.title);
  return element;
}

function renderComponentAtlas(host: HTMLElement, compact: boolean): number {
  const query = (host.dataset.atlasQuery ?? "").trim().toLowerCase();
  const group = host.dataset.atlasGroup ?? "all";
  const matches = COMPONENT_REGISTRY.filter((component) => {
    const text = `${component.title} ${component.tag} ${component.group} ${component.description}`.toLowerCase();
    const inGroup = group === "all" || (group === "core" ? component.group === "Core" || component.group === "Material" : component.group !== "Core" && component.group !== "Material");
    return text.includes(query) && inGroup;
  });

  host.replaceChildren();
  for (const component of matches) {
    const card = document.createElement("article");
    card.className = compact ? "lab-atlas__card" : "atlas-card";

    const header = document.createElement(compact ? "div" : "h3");
    if (compact) header.className = "lab-atlas__card-header";
    header.textContent = component.title;
    const tag = document.createElement("code");
    tag.textContent = component.tag;
    if (compact) header.append(tag);

    const body = document.createElement("div");
    body.className = compact ? "lab-atlas__card-body" : "atlas-card__body";
    body.append(createComponentPreview(component));

    const meta = document.createElement("div");
    meta.className = compact ? "lab-atlas__card-header" : "atlas-card__meta";
    const groupLabel = document.createElement("span");
    groupLabel.textContent = component.group;
    meta.append(groupLabel);
    if (!compact) meta.append(tag);

    const description = document.createElement("p");
    description.textContent = component.description;

    card.append(header, body, meta);
    if (!compact) {
      card.append(description);
      if (component.higPage) {
        const link = document.createElement("a");
        link.href = component.higPage;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "HIG reference ↗";
        card.append(link);
      }
    }
    host.append(card);
  }

  return matches.length;
}

function configureComponentAtlas(): void {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>("[data-component-atlas], [data-lab-atlas]"));
  if (hosts.length === 0) return;

  const search = one<HTMLElement & { value: string }>("#atlas-search");
  const group = one<HTMLElement & { value: string }>("#atlas-group");
  const labSearch = one<HTMLElement & { value: string }>("#lab-atlas-search");
  const count = one<HTMLElement>("#atlas-count");
  const labCount = one<HTMLElement>("#lab-atlas-count");

  const paint = (): void => {
    const query = search?.value ?? "";
    const groupValue = group?.value ?? "all";
    const labQuery = labSearch?.value ?? "";
    for (const host of hosts) {
      const compact = host.hasAttribute("data-lab-atlas");
      host.dataset.atlasQuery = compact ? labQuery : query;
      host.dataset.atlasGroup = compact ? "all" : groupValue;
      const total = renderComponentAtlas(host, compact);
      if (compact && labCount) labCount.textContent = `${total} components`;
      if (!compact && count) count.textContent = `${total} / ${COMPONENT_REGISTRY.length} shown`;
    }
  };

  let observer: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          paint();
          observer?.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    // The grid starts empty, so observe its non-zero parent container instead.
    for (const host of hosts) observer.observe(host.parentElement ?? host);
  } else {
    paint();
  }

  for (const control of [search, group, labSearch]) {
    control?.addEventListener("gk-input", paint);
    control?.addEventListener("gk-change", paint);
  }
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

  const atlasStatus = one<HTMLElement>("[data-atlas-status]");
  const append = (text: string): void => {
    const chip = document.createElement("span");
    chip.className = "event-chip";
    chip.textContent = text;
    strip.prepend(chip);
    while (strip.children.length > 6) strip.lastElementChild?.remove();
    if (atlasStatus) atlasStatus.textContent = text;
  };

  for (const name of [
    "gk-activate",
    "gk-change",
    "gk-input",
    "gk-select",
    "gk-navigate",
    "gk-open",
    "gk-close",
    "gk-dismiss",
    "gk-state-change",
    "gk-token-change",
    "gk-error",
  ]) {
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
configureComponentAtlas();
initDesktopLab();
