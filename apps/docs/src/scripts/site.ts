import { tokens } from "@glasskit/tokens";
import {
  animateRecipe,
  animateSpring,
  clearReducedMotionOverride,
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
import { createComponentPreview, GROUP_ORDER } from "./component-previews";

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

  const docsHost = hosts.find((host) => host.hasAttribute("data-component-atlas"));
  const labHost = hosts.find((host) => host.hasAttribute("data-lab-atlas"));

  const painted = new WeakSet<HTMLElement>();
  const paint = (target?: HTMLElement): void => {
    for (const host of target ? [target] : hosts) {
      painted.add(host);
      const compact = host.hasAttribute("data-lab-atlas");
      host.dataset.atlasQuery = compact ? labSearch?.value ?? "" : search?.value ?? "";
      host.dataset.atlasScope = compact ? "all" : scope?.value ?? "all";
      host.dataset.atlasGroup = compact ? labGroupPicker?.value ?? "all" : groupPicker?.value ?? "all";
      host.dataset.atlasComponent = compact ? labComponentPicker?.value ?? "all" : componentPicker?.value ?? "all";
      const total = renderComponentAtlas(host, compact);
      const readout = compact ? labCount : count;
      if (readout) readout.textContent = `${total} / ${COMPONENT_REGISTRY.length} shown`;
      const status = one<HTMLElement>(compact ? "[data-lab-atlas-status]" : "[data-atlas-status]");
      if (status) {
        status.textContent = total === 0
          ? "No components match the filter."
          : `${total} of ${COMPONENT_REGISTRY.length} components shown.`;
      }
    }
  };

  const nearViewport = (host: HTMLElement): boolean => {
    const rect = (host.parentElement ?? host).getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    return rect.top < window.innerHeight + 400 && rect.bottom > -400;
  };
  const reveal = (): void => {
    for (const host of hosts) {
      if (!painted.has(host) && nearViewport(host)) paint(host);
    }
  };

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal();
        if (hosts.every((host) => painted.has(host))) observer.disconnect();
      },
      { rootMargin: "400px" },
    );
    // The grid starts empty, so observe its non-zero parent container instead.
    for (const host of hosts) observer.observe(host.parentElement ?? host);
  }
  // IntersectionObserver and requestAnimationFrame can be throttled in
  // background tabs and embedded previews. Passive scroll/resize checks plus a
  // mutation check keep the registry reliable while still deferring creation
  // until a host is near the viewport.
  window.addEventListener("scroll", reveal, { passive: true });
  window.addEventListener("resize", reveal, { passive: true });
  const labPanel = labHost?.closest<HTMLElement>("[data-room-panel]");
  if (labPanel) {
    const panelObserver = new MutationObserver(() => {
      if (!labPanel.hidden) {
        reveal();
        panelObserver.disconnect();
      }
    });
    panelObserver.observe(labPanel, { attributes: true, attributeFilter: ["hidden"] });
  }
  reveal();

  const bind = (control: HTMLElement | null, host: HTMLElement | undefined, eventName: string): void => {
    if (!host) return;
    control?.addEventListener(eventName, () => paint(host));
  };
  bind(search, docsHost, "gk-input");
  bind(scope, docsHost, "gk-change");
  bind(groupPicker, docsHost, "change");
  bind(componentPicker, docsHost, "change");
  bind(labSearch, labHost, "gk-input");
  bind(labGroupPicker, labHost, "change");
  bind(labComponentPicker, labHost, "change");
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
        const selected = button.dataset.codeTarget === target;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
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
    let copyTimer = 0;
    copy.addEventListener("click", () => {
      const visible = panels.find((panel) => !panel.hidden);
      const text = visible?.querySelector("code")?.textContent ?? "";
      const show = (message: string): void => {
        copy.textContent = message;
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(() => {
          copy.textContent = "Copy";
        }, 1400);
      };
      const clipboard = navigator.clipboard;
      if (!clipboard?.writeText) {
        show("Select code");
        return;
      }
      void clipboard.writeText(text).then(() => show("Copied")).catch(() => show("Select code"));
    });
    tabs.append(copy);

    select(buttons.find((button) => button.getAttribute("aria-selected") === "true")?.dataset.codeTarget ?? "swift");
  }
}

function configureTheme(): void {
  const toggle = one<HTMLButtonElement>("[data-theme-toggle]");
  const label = one<HTMLElement>("[data-theme-label]");
  const favicon = one<HTMLLinkElement>("link[rel='icon']");
  const use = toggle?.querySelector("use");

  const paint = (theme: Theme): void => {
    root.dataset.gkTheme = theme;
    if (favicon) favicon.href = theme === "dark" ? "/assets/dark-mode-logo.png" : "/assets/light-mode-logo.png";
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
    swatch.setAttribute("aria-pressed", String(swatch.classList.contains("is-selected")));
  }

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
      for (const other of swatches) {
        other.classList.toggle("is-selected", other === swatch);
        other.setAttribute("aria-pressed", String(other === swatch));
      }
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
    if (label) label.textContent = material === "liquid" ? "Flat material" : "Liquid material";
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

  const append = (text: string): void => {
    const chip = document.createElement("span");
    chip.className = "event-chip";
    chip.textContent = text;
    strip.prepend(chip);
    while (strip.children.length > 6) strip.lastElementChild?.remove();
  };

  for (const name of [
    "gk-activate",
    "gk-change",
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
  }

  replay?.addEventListener("gk-activate", run);
  reduced?.addEventListener("gk-change", () => {
    if (reduced.checked) setReducedMotionOverride(true);
    else clearReducedMotionOverride();
  });
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
  };

  bind("#native-blur", "Blur", () => applyNativeGlass("blur"));
  bind("#native-acrylic", "Acrylic", () => applyNativeGlass("acrylic"));
  bind("#native-round", "Rounded corners", () => setNativeCorners(true));
  bind("#native-clear", "Clear", () => clearNativeGlass());
}

function configureHeaderNav(): void {
  const active = one<HTMLAnchorElement>(".top-nav a[aria-current='page']");
  const nav = active?.closest<HTMLElement>(".top-nav");
  if (!active || !nav || nav.scrollWidth <= nav.clientWidth) return;
  nav.scrollLeft = Math.max(0, active.offsetLeft - (nav.clientWidth - active.clientWidth) / 2);
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
configureHeaderNav();
