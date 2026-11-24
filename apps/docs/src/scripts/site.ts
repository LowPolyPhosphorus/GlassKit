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
};

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

function groupRank(group: string): number {
  const index = GROUP_ORDER.indexOf(group);
  return index === -1 ? GROUP_ORDER.length : index;
}

function renderComponentAtlas(host: HTMLElement, compact: boolean): number {
  const query = (host.dataset.atlasQuery ?? "").trim().toLowerCase();
  const group = host.dataset.atlasGroup ?? "all";
  const scope = host.dataset.atlasScope ?? "all";
  const componentId = host.dataset.atlasComponent ?? "all";
  const matches = COMPONENT_REGISTRY.filter((component) => {
    const text = `${component.title} ${component.tag} ${component.group} ${component.description}`.toLowerCase();
    const inGroup = group === "all" || component.group === group;
    const inScope =
      scope === "all" ||
      (scope === "core"
        ? component.group === "Core" || component.group === "Material"
        : component.group !== "Core" && component.group !== "Material");
    const inComponent = componentId === "all" || component.tag === componentId;
    return text.includes(query) && inGroup && inScope && inComponent;
  });

  const grouped = new Map<string, GlassKitComponent[]>();
  for (const component of matches) {
    const list = grouped.get(component.group) ?? [];
    list.push(component);
    grouped.set(component.group, list);
  }
  const names = Array.from(grouped.keys()).sort((left, right) => groupRank(left) - groupRank(right) || left.localeCompare(right));
  const focused = Boolean(query || componentId !== "all" || group !== "all");

  host.replaceChildren();
  for (const [index, name] of names.entries()) {
    const items = grouped.get(name)!;
    const section = document.createElement("details");
    section.className = "atlas-group";
    section.open = focused || index === 0 || items.length <= 6;

    const summary = document.createElement("summary");
    const title = document.createElement("span");
    title.textContent = name;
    const count = document.createElement("span");
    count.className = "atlas-group__count";
    count.textContent = `${items.length}`;
    summary.append(title, count);

    const grid = document.createElement("div");
    grid.className = "atlas-group__grid";
    for (const component of items) {
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
          link.textContent = "Reference ↗";
          card.append(link);
        }
      }
      grid.append(card);
    }

    section.append(summary, grid);
    host.append(section);
  }

  return matches.length;
}

function populateAtlasSelect(select: HTMLSelectElement | null, allLabel: string, groups = false): void {
  if (!select) return;
  select.replaceChildren();
  const all = document.createElement("option");
  all.value = "all";
  all.textContent = allLabel;
  select.append(all);
  const values = groups
    ? Array.from(new Set(COMPONENT_REGISTRY.map((component) => component.group))).sort(
        (left, right) => groupRank(left) - groupRank(right) || left.localeCompare(right),
      )
    : COMPONENT_REGISTRY.map((component) => component.tag);
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = groups ? value : `${COMPONENT_REGISTRY.find((component) => component.tag === value)!.title} · ${value}`;
    select.append(option);
  }
}

function configureComponentAtlas(): void {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>("[data-component-atlas], [data-lab-atlas]"));
  if (hosts.length === 0) return;

  const search = one<HTMLElement & { value: string }>("#atlas-search");
  const scope = one<HTMLElement & { value: string }>("#atlas-group");
  const groupPicker = one<HTMLSelectElement>("#atlas-group-picker");
  const componentPicker = one<HTMLSelectElement>("#atlas-component-picker");
  const labSearch = one<HTMLElement & { value: string }>("#lab-atlas-search");
  const labGroupPicker = one<HTMLSelectElement>("#lab-atlas-group-picker");
  const labComponentPicker = one<HTMLSelectElement>("#lab-atlas-component-picker");
  const count = one<HTMLElement>("#atlas-count");
  const labCount = one<HTMLElement>("#lab-atlas-count");

  populateAtlasSelect(groupPicker, "All groups", true);
  populateAtlasSelect(labGroupPicker, "All groups", true);
  populateAtlasSelect(componentPicker, "All components");
  populateAtlasSelect(labComponentPicker, "All components");

  let painted = false;
  const paint = (): void => {
    painted = true;
    for (const host of hosts) {
      const compact = host.hasAttribute("data-lab-atlas");
      host.dataset.atlasQuery = compact ? labSearch?.value ?? "" : search?.value ?? "";
      host.dataset.atlasScope = compact ? "all" : scope?.value ?? "all";
      host.dataset.atlasGroup = compact ? labGroupPicker?.value ?? "all" : groupPicker?.value ?? "all";
      host.dataset.atlasComponent = compact ? labComponentPicker?.value ?? "all" : componentPicker?.value ?? "all";
      const total = renderComponentAtlas(host, compact);
      const readout = compact ? labCount : count;
      if (readout) readout.textContent = `${total} / ${COMPONENT_REGISTRY.length} shown`;
    }
  };

  let observer: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          if (!painted) paint();
          observer?.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    // The grid starts empty, so observe its non-zero parent container instead.
    for (const host of hosts) observer.observe(host.parentElement ?? host);
  }
  // IntersectionObserver can be throttled in background tabs and embedded
  // previews. The fallback keeps the registry visible; content-visibility in
  // CSS still avoids laying out off-screen cards.
  window.setTimeout(() => {
    if (!painted) paint();
  }, 120);

  for (const control of [search, scope, groupPicker, componentPicker, labSearch, labGroupPicker, labComponentPicker]) {
    control?.addEventListener("gk-input", paint);
    control?.addEventListener("gk-change", paint);
    control?.addEventListener("change", paint);
  }
}

function configureCodeTabs(): void {
  let groupIndex = 0;

  for (const tabs of Array.from(document.querySelectorAll<HTMLElement>("[data-code-tabs]"))) {
    const buttons = Array.from(tabs.querySelectorAll<HTMLButtonElement>("[data-code-target]"));
    const panels = Array.from(tabs.querySelectorAll<HTMLElement>("[data-code-panel]"));
    const groupId = `gk-code-${++groupIndex}`;

    for (const button of buttons) {
      const target = button.dataset.codeTarget ?? "swift";
      button.id = `${groupId}-tab-${target}`;
      button.setAttribute("aria-controls", `${groupId}-panel-${target}`);
    }
    for (const panel of panels) {
      const target = panel.dataset.codePanel ?? "swift";
      panel.id = `${groupId}-panel-${target}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `${groupId}-tab-${target}`);
    }

    const select = (target: string): void => {
      for (const button of buttons) {
        button.setAttribute("aria-selected", String(button.dataset.codeTarget === target));
      }
      for (const panel of panels) panel.hidden = panel.dataset.codePanel !== target;
    };

    for (const [index, button] of buttons.entries()) {
      button.addEventListener("click", () => select(button.dataset.codeTarget ?? "swift"));
      button.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        const next = buttons[(index + step + buttons.length) % buttons.length]!;
        next.focus();
        select(next.dataset.codeTarget ?? "swift");
      });
    }

    const copy = document.createElement("button");
    copy.type = "button";
    copy.dataset.codeCopy = "";
    copy.textContent = "Copy";
    copy.addEventListener("click", () => {
      const visible = panels.find((panel) => !panel.hidden);
      const text = visible?.querySelector("code")?.textContent ?? "";
      void navigator.clipboard
        ?.writeText(text)
        .then(() => {
          copy.textContent = "Copied";
        })
        .catch(() => {
          copy.textContent = "Select code";
        });
      window.setTimeout(() => {
        copy.textContent = "Copy";
      }, 1400);
    });
    tabs.querySelector<HTMLElement>(".code-tabs__bar")?.append(copy);

    select(buttons.find((button) => button.getAttribute("aria-selected") === "true")?.dataset.codeTarget ?? "swift");
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

function darken(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return hex;
  const channel = (index: number): string =>
    Math.round(Number.parseInt(value.slice(index, index + 2), 16) * (1 - amount))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

function configureAccents(): void {
  const swatches = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-accent]"));
  const section = one<HTMLElement>("#tokens");
  if (swatches.length === 0 || !section) return;

  for (const swatch of swatches) {
    swatch.addEventListener("click", () => {
      const accent = swatch.dataset.accent!;
      const fill = swatch.dataset.accentFill ?? "transparent";
      const stroke = swatch.dataset.accentStroke ?? accent;
      const solid = darken(accent, 0.18);
      const solidHover = darken(accent, 0.28);
      const properties: Record<string, string> = {
        "--gk-color-accent": accent,
        "--gk-color-accent-fill": fill,
        "--gk-color-accent-stroke": stroke,
        "--page-accent": accent,
        "--page-accent-solid": solid,
        "--page-accent-solid-hover": solidHover,
        "--page-accent-fill": fill,
        "--page-accent-stroke": stroke,
      };
      for (const [name, value] of Object.entries(properties)) section.style.setProperty(name, value);
      for (const other of swatches) other.classList.toggle("is-selected", other === swatch);
    });
  }
}

function configureMaterial(): void {
  const toggle = one<HTMLButtonElement>("[data-material-toggle]");
  const label = one<HTMLElement>("[data-material-label]");
  if (!toggle) return;

  let material: "flat" | "liquid" = root.dataset.gkMaterial === "liquid" ? "liquid" : "flat";
  const paint = (): void => {
    if (material === "liquid") root.dataset.gkMaterial = "liquid";
    else delete root.dataset.gkMaterial;
    toggle.setAttribute("aria-pressed", String(material === "liquid"));
    if (label) label.textContent = material === "liquid" ? "Flat" : "Liquid";
    try {
      localStorage.setItem("gk-docs-material", material);
    } catch {
      // Ignore private-mode storage failures.
    }
  };

  paint();
  toggle.addEventListener("click", () => {
    material = material === "liquid" ? "flat" : "liquid";
    paint();
  });
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
configureMaterial();
configureAccents();
configureEventStrip();
configureCodeTabs();
configureMotion();
configureNative();
configureComponentAtlas();
initDesktopLab();
