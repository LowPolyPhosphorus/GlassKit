import { COMPONENT_REGISTRY, type GlassKitComponent } from "@glasskit/ui";

type SearchEntry = {
  kind: "Guide" | "Component";
  title: string;
  detail: string;
  target: string;
  tag?: string;
};

// Event names are extracted from packages/ui/src/components/*.ts so this reference
// cannot drift into guessed events that a component never emits.
const COMPONENT_EVENTS: Record<string, string[]> = {
  "gk-action-menu": ["gk-select"],
  "gk-adaptive-view": ["gk-adapt"],
  "gk-alert-dialog": ["gk-open", "gk-close", "gk-confirm", "gk-cancel", "gk-dismiss"],
  "gk-async-image": ["gk-load", "gk-error"],
  "gk-button": ["gk-activate"],
  "gk-canvas-view": ["gk-draw", "gk-clear", "gk-undo"],
  "gk-chart": ["gk-point-select"],
  "gk-check-row": ["gk-check"],
  "gk-color-picker": ["gk-input", "gk-change"],
  "gk-column-view": ["gk-select"],
  "gk-combo-box": ["gk-input", "gk-change"],
  "gk-confirmation-dialog": ["gk-close", "gk-dismiss", "gk-open"],
  "gk-content-unavailable": ["gk-activate"],
  "gk-control-group": ["gk-activate", "gk-control"],
  "gk-control-tile": ["gk-activate", "gk-state-change"],
  "gk-data-table": ["gk-sort", "gk-select"],
  "gk-date-picker": ["gk-change"],
  "gk-disclosure": ["gk-toggle"],
  "gk-disclosure-group": ["gk-expand-change"],
  "gk-drag-surface": ["gk-drag-start", "gk-drag-move", "gk-drag-end"],
  "gk-editable-list": ["gk-activate", "gk-edit-change", "gk-delete", "gk-move"],
  "gk-form": ["gk-activate", "gk-submit", "gk-reset"],
  "gk-grid-layout": ["gk-cell-select"],
  "gk-grid-view": ["gk-select"],
  "gk-group-box": ["gk-activate", "gk-group-action"],
  "gk-icon-label": ["gk-activate"],
  "gk-image-view": ["gk-load", "gk-error"],
  "gk-labeled-content": ["gk-copy", "gk-labeled-action"],
  "gk-lazy-grid": ["gk-grid-range", "gk-select"],
  "gk-lazy-stack": ["gk-range-change", "gk-select"],
  "gk-lazy-vgrid": ["gk-vgrid-range", "gk-select"],
  "gk-list-view": ["gk-list-select", "gk-list-toggle"],
  "gk-live-activity": ["gk-activate", "gk-expand-change"],
  "gk-long-press": ["gk-press-start", "gk-press-progress", "gk-press-complete", "gk-press-cancel"],
  "gk-multi-date-picker": ["gk-date-toggle", "gk-change"],
  "gk-nav-pane": ["gk-navigate"],
  "gk-navigation-link": ["gk-navigate"],
  "gk-navigation-split-view": ["gk-navigate"],
  "gk-navigation-stack": ["gk-navigate"],
  "gk-notification": ["gk-dismiss"],
  "gk-outline-group": ["gk-outline-toggle", "gk-outline-select"],
  "gk-paste-button": ["gk-paste", "gk-change"],
  "gk-path-control": ["gk-navigate"],
  "gk-push-button": ["gk-activate"],
  "gk-rich-text": ["gk-text-copy"],
  "gk-rotate-view": ["gk-rotate-start", "gk-rotate-change", "gk-rotate-end"],
  "gk-scroll-navigator": ["gk-scroll-to", "gk-scroll-position"],
  "gk-search-field": ["gk-input", "gk-change", "gk-clear", "gk-scope-change"],
  "gk-secure-field": ["gk-input", "gk-change", "gk-reveal-change"],
  "gk-segmented": ["gk-change"],
  "gk-share-action": ["gk-share", "gk-share-copy"],
  "gk-sidebar": ["gk-select", "gk-navigate"],
  "gk-sidebar-item": ["gk-select"],
  "gk-slider": ["gk-input", "gk-change"],
  "gk-snippet": ["gk-snippet-action", "gk-confirm", "gk-cancel"],
  "gk-stepper": ["gk-change"],
  "gk-stepper-control": ["gk-change"],
  "gk-tab-bar": ["gk-tab-change"],
  "gk-tap-counter": ["gk-tap", "gk-tap-complete"],
  "gk-text-editor": ["gk-input", "gk-change"],
  "gk-text-field": ["gk-input", "gk-change"],
  "gk-timeline-view": ["gk-tick"],
  "gk-token-field": ["gk-input", "gk-token-add", "gk-token-remove", "gk-token-change"],
  "gk-toggle": ["gk-change"],
  "gk-value-picker": ["gk-change"],
  "gk-web-link": ["gk-navigate"],
  "gk-web-view": ["gk-load"],
};

const COMPONENT_ATTRIBUTES: Record<string, string> = {
  "gk-badge": 'tone="accent" dot',
  "gk-button": 'variant="primary"',
  "gk-glass-panel": 'tone="regular" elevation="high"',
  "gk-toggle": 'label="Wi-Fi" checked',
  "gk-list-row": 'subtitle="2 devices"',
  "gk-segmented": 'value="one" label="Choices"',
  "gk-slider": 'label="Brightness" min="0" max="100" value="68" unit="%"',
  "gk-text-field": 'label="Device name" placeholder="Name this device" clearable',
  "gk-search-field": 'label="Search" placeholder="Search devices" scopes=\'["All","Lights"]\'',
  "gk-token-field": 'label="Rooms" tokens=\'["Kitchen","Hallway"]\'',
  "gk-box": 'title="Grouped content" subtitle="Title and subtitle"',
  "gk-chart": 'title="Energy" values="12,18,14,24" labels="Mon,Tue,Wed,Thu"',
  "gk-color-well": 'value="#0a84ff"',
  "gk-color-picker": 'value="#0a84ff"',
  "gk-stepper": 'value="2" min="0" max="8"',
  "gk-stepper-control": 'value="2" min="0" max="8"',
  "gk-value-picker": 'options=\'["Comfort","Quiet","Away"]\' value="Comfort"',
  "gk-date-picker": 'value="2026-11-24"',
  "gk-progress-view": 'value="68" min="0" max="100" label="Progress"',
  "gk-value-gauge": 'value="68" min="0" max="100" label="Humidity"',
  "gk-image-view": 'alt="Room preview" ratio="16 / 9"',
  "gk-web-view": 'title="Inline content" height="100" srcdoc="<p>Sandboxed content.</p>"',
  "gk-status-bar": 'label="Home" status="All systems normal" time="09:41"',
  "gk-live-activity": 'title="Air purifier" status="Filter at 82%" progress="82"',
  "gk-notification": 'title="Scene ready" message="Your scene is available." tone="info"',
  "gk-snippet": 'kind="confirmation" title="Run scene?" message="This dims the lights."',
  "gk-path-control": 'items=\'["Home","Living Room","Lights"]\'',
  "gk-tab-bar": 'tabs=\'[{"id":"all","label":"All"},{"id":"core","label":"Core"}]\' active="all"',
  "gk-combo-box": 'label="Device" options=\'["Lamp","Sensor"]\'',
  "gk-action-menu": 'label="Actions" items=\'[{"label":"Duplicate"},{"label":"Rename"}]\'',
  "gk-content-unavailable": 'title="No devices" message="Add a device to get started." action-label="Add device"',
  "gk-data-table": 'columns=\'["Room","Devices"]\' rows=\'[["Living Room","6"],["Kitchen","3"]]\'',
  "gk-editable-list": 'items=\'[{"label":"Living Room","value":"living"}]\'',
  "gk-form": 'label="Settings" sections=\'[{"title":"General","rows":[]}]\'',
  "gk-disclosure-group": 'items=\'[{"title":"Details","content":"More information."}]\'',
  "gk-group-box": 'title="Scene" caption="Quick controls"',
  "gk-labeled-content": 'label="Device" value="Living Room Lamp" copyable',
  "gk-outline-group": 'items=\'[{"title":"Rooms","children":[{"title":"Living Room"}]}]\'',
  "gk-long-press": 'label="Hold to run" value="Run scene"',
  "gk-tap-counter": 'label="Taps" goal="5"',
  "gk-drag-surface": 'label="Drag surface"',
  "gk-rotate-view": 'label="Rotate"',
  "gk-scroll-navigator": 'items=\'["Overview","Details"]\'',
  "gk-share-action": 'title="Share scene" url="/scenes/evening"',
  "gk-navigation-link": 'label="Open details" value="details"',
  "gk-navigation-stack": 'title="Settings"',
  "gk-nav-pane": 'items=\'["Wi-Fi","Bluetooth"]\' value="Wi-Fi"',
  "gk-navigation-split-view": 'title="Settings"',
  "gk-text-editor": 'label="Notes" placeholder="Write a note"',
  "gk-secure-field": 'label="Password" placeholder="Password"',
  "gk-check-row": 'label="Notify me"',
  "gk-icon-label": 'title="Wi-Fi" icon="wifi"',
};

const COMPONENT_CHILDREN: Record<string, string> = {
  "gk-segmented": "<button value='one'>One</button><button value='two'>Two</button>",
  "gk-push-button": "Run scene",
  "gk-action-menu": "",
  "gk-sidebar": "<gk-sidebar-item value='general' label='General'></gk-sidebar-item>",
  "gk-tab-bar": "",
};

const EVENT_FALLBACK = [
  "All Glass Kit events bubble and cross the shadow boundary.",
  "Use gk-activate for actions, gk-input for live values, and gk-change for committed values.",
];

function one<T extends Element>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function sampleFor(component: GlassKitComponent): string {
  const attributes = COMPONENT_ATTRIBUTES[component.tag] ?? "";
  const children = COMPONENT_CHILDREN[component.tag] ?? "";
  return `<${component.tag}${attributes ? ` ${attributes}` : ""}>${children}</${component.tag}>`;
}

function eventsFor(component: GlassKitComponent): string[] {
  return COMPONENT_EVENTS[component.tag] ?? EVENT_FALLBACK;
}

function make<T extends HTMLElement>(tag: string, className: string, text?: string): T {
  const element = document.createElement(tag) as T;
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    let copied = false;
    try {
      const legacyCopy = (document as unknown as { execCommand?: (commandId: string) => boolean }).execCommand;
      copied = legacyCopy ? legacyCopy.call(document, "copy") : false;
    } catch {
      copied = false;
    }
    area.remove();
    return copied;
  }
}

function configureRegistryCounts(): void {
  const count = String(COMPONENT_REGISTRY.length);
  for (const element of Array.from(document.querySelectorAll<HTMLElement>("[data-component-count]"))) {
    element.textContent = count;
  }
}

function configureCodeCopies(): void {
  for (const pre of Array.from(document.querySelectorAll<HTMLPreElement>(".docs-section > pre"))) {
    const wrap = make("div", "docs-code");
    const button = make<HTMLButtonElement>("button", "docs-code__copy", "Copy");
    button.type = "button";
    const section = pre.closest<HTMLElement>(".docs-section");
    const sectionTitle = section?.querySelector("h2")?.textContent?.trim() ?? "this guide";
    button.setAttribute("aria-label", `Copy code sample from ${sectionTitle}`);
    button.addEventListener("click", async () => {
      const copied = await copyText(pre.textContent ?? "");
      button.textContent = copied ? "Copied" : "Select and copy";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1600);
    });
    pre.before(wrap);
    wrap.append(button, pre);
  }
}

function configureApiBrowser(): void {
  const list = one<HTMLDivElement>("[data-api-list]");
  const detail = one<HTMLElement>("[data-api-detail]");
  const search = one<HTMLInputElement>("[data-api-search]");
  const group = one<HTMLSelectElement>("[data-api-group]");
  const count = one<HTMLElement>("[data-api-count]");
  if (!list || !detail) return;

  const groups = Array.from(new Set(COMPONENT_REGISTRY.map((component) => component.group))).sort();
  if (group) {
    const all = document.createElement("option");
    all.value = "all";
    all.textContent = `All groups (${COMPONENT_REGISTRY.length})`;
    group.append(all);
    for (const value of groups) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      group.append(option);
    }
  }

  let filtered: GlassKitComponent[] = [...COMPONENT_REGISTRY];
  let selectedTag = COMPONENT_REGISTRY[0]?.tag ?? "";

  const filter = (): void => {
    const query = (search?.value ?? "").trim().toLowerCase();
    const activeGroup = group?.value ?? "all";
    filtered = COMPONENT_REGISTRY.filter((component) => {
      const inGroup = activeGroup === "all" || component.group === activeGroup;
      const haystack = `${component.title} ${component.tag} ${component.description} ${component.group}`.toLowerCase();
      return inGroup && (query.length === 0 || haystack.includes(query));
    });
    if (!filtered.some((component) => component.tag === selectedTag)) {
      selectedTag = filtered[0]?.tag ?? "";
    }
    renderList();
    renderDetail();
  };

  const renderList = (): void => {
    list.replaceChildren();
    if (count) count.textContent = `${filtered.length} of ${COMPONENT_REGISTRY.length} components`;
    if (filtered.length === 0) {
      list.append(make("p", "docs-api__empty", "No components match this filter."));
      return;
    }
    for (const component of filtered) {
      const button = make<HTMLButtonElement>("button", "docs-api__item");
      button.type = "button";
      button.dataset.tag = component.tag;
      button.setAttribute("aria-pressed", String(component.tag === selectedTag));
      const title = make("span", "docs-api__item-title", component.title);
      const tag = make("code", "docs-api__item-tag", component.tag);
      const description = make("span", "docs-api__item-desc", component.description);
      button.append(title, tag, description);
      list.append(button);
    }
  };

  const renderDetail = (): void => {
    detail.replaceChildren();
    const component = COMPONENT_REGISTRY.find((item) => item.tag === selectedTag);
    if (!component) {
      detail.append(make("p", "docs-api__empty", "Choose a component to see its reference."));
      return;
    }

    const header = make("div", "docs-api__head");
    const heading = make("div", "docs-api__heading");
    heading.append(make("h3", "", component.title), make("code", "", component.tag));
    header.append(heading);
    const groupBadge = make("span", "docs-pill", component.group);
    header.append(groupBadge);
    detail.append(header);

    detail.append(make("p", "docs-api__description", component.description));

    const sample = sampleFor(component);
    const sampleBlock = make("section", "docs-api__block");
    const sampleHead = make("div", "docs-api__block-head");
    sampleHead.append(make("h4", "", "Markup"));
    const copy = make<HTMLButtonElement>("button", "docs-copy", "Copy");
    copy.type = "button";
    copy.dataset.copyTarget = component.tag;
    sampleHead.append(copy);
    sampleBlock.append(sampleHead);
    const code = document.createElement("pre");
    const codeText = document.createElement("code");
    codeText.textContent = sample;
    code.append(codeText);
    sampleBlock.append(code);
    detail.append(sampleBlock);

    const events = make("section", "docs-api__block");
    events.append(make("h4", "", "Events"));
    const eventList = document.createElement("ul");
    for (const event of eventsFor(component)) {
      const item = document.createElement("li");
      const codeTag = document.createElement("code");
      codeTag.textContent = event;
      item.append(codeTag);
      eventList.append(item);
    }
    events.append(eventList);
    detail.append(events);

    if (component.higPage) {
      const links = make("section", "docs-api__block");
      links.append(make("h4", "", "Reference"));
      const link = document.createElement("a");
      link.href = component.higPage;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "Read the source guidance ↗";
      links.append(link);
      detail.append(links);
    }

    const previewHost = one<HTMLElement>("[data-api-preview]");
    if (previewHost) {
      previewHost.replaceChildren();
      const label = make("p", "docs-api__preview-label", `Live preview · ${component.title}`);
      const stage = make("div", "docs-api__preview-stage");
      const element = document.createElement(component.tag);
      const attributes = (COMPONENT_ATTRIBUTES[component.tag] ?? "").trim();
      if (attributes) {
        const parsed = new DOMParser().parseFromString(`<x ${attributes}></x>`, "text/html").body.firstElementChild;
        if (parsed) {
          for (const attribute of Array.from(parsed.attributes)) element.setAttribute(attribute.name, attribute.value);
        }
      }
      if (COMPONENT_CHILDREN[component.tag]) element.innerHTML = COMPONENT_CHILDREN[component.tag];
      stage.append(element);
      previewHost.append(label, stage);
    }
  };

  list.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".docs-api__item");
    if (!button?.dataset.tag) return;
    selectedTag = button.dataset.tag;
    renderList();
    renderDetail();
  });

  list.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
    const items = Array.from(list.querySelectorAll<HTMLButtonElement>(".docs-api__item"));
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? Math.min(current + 1, items.length - 1)
            : Math.max(current - 1, 0);
    items[next]?.focus();
  });

  search?.addEventListener("input", filter);
  group?.addEventListener("change", filter);

  detail.addEventListener("click", async (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-copy-target]");
    if (!button) return;
    const component = COMPONENT_REGISTRY.find((item) => item.tag === button.dataset.copyTarget);
    if (!component) return;
    const copied = await copyText(sampleFor(component));
    button.textContent = copied ? "Copied" : "Select and copy";
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 1600);
  });

  filter();
}

function configureDocsSearch(selectComponent: (tag: string) => void): void {
  const input = one<HTMLInputElement>("[data-docs-search]");
  const results = one<HTMLElement>("[data-docs-results]");
  if (!input || !results) return;

  const setOpen = (open: boolean): void => {
    results.hidden = !open;
    input.setAttribute("aria-expanded", String(open));
  };

  const entries: SearchEntry[] = [];
  const seen = new Set<string>();
  const anchors = Array.from(
    document.querySelectorAll<HTMLElement>(".docs-article section[id], .docs-article header[id], .docs-article h2[id], .docs-article h3[id]"),
  );
  for (const anchor of anchors) {
    const key = `#${anchor.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const heading = anchor.matches("h2, h3") ? anchor : anchor.querySelector<HTMLElement>("h2, h3");
    entries.push({
      kind: "Guide",
      title: heading?.textContent?.trim() ?? anchor.id.replace(/-/g, " "),
      detail: anchor.closest("section")?.querySelector("h2")?.textContent?.trim() ?? "Documentation",
      target: key,
    });
  }
  for (const component of COMPONENT_REGISTRY) {
    entries.push({
      kind: "Component",
      title: component.title,
      detail: `${component.tag} · ${component.group}`,
      target: "#api",
      tag: component.tag,
    });
  }

  const render = (): void => {
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    if (query.length < 2) {
      setOpen(false);
      return;
    }
    const matches = entries
      .filter((entry) => `${entry.title} ${entry.detail} ${entry.tag ?? ""}`.toLowerCase().includes(query))
      .slice(0, 10);
    setOpen(true);
    if (matches.length === 0) {
      results.append(make("p", "docs-search__empty", "No matches. Try a tag like gk-slider or a topic like tokens."));
      return;
    }
    for (const entry of matches) {
      const button = make<HTMLButtonElement>("button", "docs-search__result");
      button.type = "button";
      button.dataset.target = entry.target;
      if (entry.tag) button.dataset.tag = entry.tag;
      const kind = make("span", "docs-search__kind", entry.kind);
      const title = make("strong", "", entry.title);
      const detail = make("span", "docs-search__detail", entry.detail);
      button.append(kind, title, detail);
      results.append(button);
    }
  };

  input.addEventListener("input", render);
  input.addEventListener("focus", render);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      setOpen(false);
      input.blur();
      return;
    }
    if (event.key === "ArrowDown" && !results.hidden) {
      const first = results.querySelector<HTMLButtonElement>(".docs-search__result");
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  results.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      input.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(results.querySelectorAll<HTMLButtonElement>(".docs-search__result"));
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0 || buttons.length === 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : event.key === "ArrowDown"
            ? Math.min(current + 1, buttons.length - 1)
            : Math.max(current - 1, 0);
    buttons[next]?.focus();
  });

  results.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".docs-search__result");
    if (!button) return;
    if (button.dataset.tag) selectComponent(button.dataset.tag);
    const target = button.dataset.target ? document.querySelector<HTMLElement>(button.dataset.target) : null;
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 82;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }
    setOpen(false);
    input.value = "";
  });

  document.addEventListener("click", (event) => {
    if (!results.hidden && !(event.target as HTMLElement).closest(".docs-search")) setOpen(false);
  });
}

function configureDemoLog(): void {
  const host = one<HTMLElement>("[data-docs-demo]");
  const output = one<HTMLElement>("[data-docs-output]");
  if (!host || !output) return;

  let count = 0;
  const log = (event: Event): void => {
    count += 1;
    const target = event.target as HTMLElement;
    const detail = event instanceof CustomEvent && event.detail ? event.detail : null;
    const value =
      detail && typeof detail === "object" && "value" in detail
        ? String((detail as Record<string, unknown>).value)
        : target.hasAttribute("checked")
          ? String(target.hasAttribute("checked"))
          : "";
    output.textContent = `${count}. ${event.type}${value ? ` → ${value}` : ""}`;
  };

  for (const type of ["gk-activate", "gk-input", "gk-change"]) {
    host.addEventListener(type, log);
  }
}

function configureRail(): void {
  const rail = document.querySelector<HTMLElement>(".docs-rail");
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".docs-rail a[href^='#']"));
  if (links.length === 0) return;

  const targets = links
    .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter((target): target is HTMLElement => Boolean(target));
  if (targets.length === 0) return;

  let paintedId = "";
  const paint = (): void => {
    let active = targets[0];
    for (const target of targets) {
      if (target.getBoundingClientRect().top <= 140) active = target;
    }
    let activeLink: HTMLAnchorElement | undefined;
    for (const link of links) {
      const isActive = active?.id === decodeURIComponent(link.hash.slice(1));
      if (isActive) {
        link.setAttribute("aria-current", "location");
        activeLink = link;
      } else {
        link.removeAttribute("aria-current");
      }
    }
    if (window.scrollY === 0 || !rail || active?.id === paintedId || rail.scrollWidth <= rail.clientWidth || !activeLink) return;
    paintedId = active?.id ?? "";
    const left =
      activeLink.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft -
      (rail.clientWidth - activeLink.clientWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: "instant" });
  };

  window.addEventListener("scroll", paint, { passive: true });
  window.addEventListener("resize", paint);
  paint();
}

configureRegistryCounts();
configureCodeCopies();
configureApiBrowser();
configureDocsSearch((tag) => {
  const item = document.querySelector<HTMLButtonElement>(`.docs-api__item[data-tag="${tag}"]`);
  item?.click();
});
configureDemoLog();
configureRail();
