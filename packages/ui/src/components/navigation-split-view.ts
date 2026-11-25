import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface SplitDetail {
  title: string;
  body?: string;
}

interface SplitItem {
  value: string;
  label: string;
  detail?: SplitDetail;
  children?: SplitItem[];
}

interface SplitSelection {
  primary?: string;
  secondary?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .split {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }
  :host([columns="3"]) .split { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1.2fr); }

  .pane {
    display: grid;
    align-content: start;
    gap: 2px;
    min-width: 0;
    padding: 6px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
  }

  .pane-title {
    padding: 3px 6px 6px;
    color: var(--gk-color-text-dim);
    font-size: 10px;
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .item {
    display: block;
    width: 100%;
    padding: 6px 8px;
    overflow: hidden;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font: inherit;
    font-size: var(--gk-font-size-xs);
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }
  .item.is-selected {
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-accent);
    font-weight: var(--gk-font-weight-semibold);
  }

  .detail {
    display: grid;
    align-content: start;
    gap: 5px;
    min-width: 0;
    padding: 8px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
  }
  .detail h3 { margin: 0; font-size: var(--gk-font-size-sm); }
  .detail p { margin: 0; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); line-height: 1.5; }
  .hint { color: var(--gk-color-text-dim); font-size: var(--gk-font-size-xs); }

  .route {
    grid-column: 1 / -1;
    color: var(--gk-color-text-dim);
    font-size: 10px;
  }
`;

const html = `
  <div class="split" part="split">
    <div class="pane" part="primary">
      <div class="pane-title">Sections</div>
      <div class="items" role="group" aria-label="Sections"></div>
    </div>
    <div class="pane content" part="content" hidden>
      <div class="pane-title">Content</div>
      <div class="items" role="group" aria-label="Content"></div>
    </div>
    <div class="detail" part="detail" role="region" aria-live="polite">
      <h3 class="detail-title"></h3>
      <p class="detail-body"></p>
      <span class="hint" hidden>Choose an item to see its content.</span>
    </div>
    <div class="route" part="route"></div>
  </div>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const normaliseItem = (item: SplitItem | string, index: number): SplitItem => {
  if (typeof item === "string") return { value: item, label: item };
  const value = String(item.value ?? item.label ?? index);
  return {
    value,
    label: String(item.label ?? value),
    detail: item.detail
      ? {
          title: String(item.detail.title ?? item.label ?? value),
          body: item.detail.body ? String(item.detail.body) : undefined,
        }
      : undefined,
    children: Array.isArray(item.children) ? item.children.map(normaliseItem) : [],
  };
};

export class NavigationSplitView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["title", "sections", "columns", "selection"];
  }

  #selection: SplitSelection = {};

  get value(): SplitSelection {
    return { ...this.#selection };
  }

  set value(next: SplitSelection) {
    this.setAttribute("selection", JSON.stringify([next]));
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.addEventListener("click", this.#onClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (event: Event): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-level]");
    if (!button) return;
    const level = button.dataset.level as "primary" | "secondary";
    const value = button.dataset.value ?? "";
    const label = button.textContent?.trim() ?? value;

    if (level === "primary") {
      this.#selection = { primary: value, secondary: undefined };
      const sections = this.#sections();
      const selected = sections.find((item) => item.value === value);
      this.#selection.secondary = selected?.children?.[0]?.value;
    } else {
      this.#selection = { ...this.#selection, secondary: value };
    }

    this.value = this.#selection;
    emit(this, "gk-navigate", { level, value, label, selection: this.value, source: this });
  };

  #sections(): SplitItem[] {
    return parseItems<SplitItem | string>(this.getAttribute("sections")).map(normaliseItem);
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const sections = this.#sections();
    let attributed: SplitSelection | undefined;
    try {
      const parsed: unknown = JSON.parse(this.getAttribute("selection") ?? "");
      attributed = (Array.isArray(parsed) ? parsed[0] : parsed) as SplitSelection | undefined;
    } catch {
      attributed = undefined;
    }
    if (attributed && (attributed.primary !== undefined || attributed.secondary !== undefined)) {
      this.#selection = {
        primary: attributed.primary !== undefined ? String(attributed.primary) : undefined,
        secondary: attributed.secondary !== undefined ? String(attributed.secondary) : undefined,
      };
    }

    const primary = sections.find((item) => item.value === this.#selection.primary) ?? sections[0];
    if (!primary) {
      this.#selection = {};
    } else if (this.#selection.primary !== primary.value) {
      this.#selection = { primary: primary.value, secondary: primary.children?.[0]?.value };
    }
    const children = primary?.children ?? [];
    const secondary = children.find((item) => item.value === this.#selection.secondary) ?? children[0];
    if (secondary && this.#selection.secondary !== secondary.value) this.#selection.secondary = secondary.value;

    const threeColumns = Number(this.getAttribute("columns") ?? 2) >= 3;
    const content = root.querySelector<HTMLElement>(".content")!;
    content.hidden = !threeColumns;

    const primaryItems = root.querySelector<HTMLElement>(".pane:not(.content) .items")!;
    primaryItems.innerHTML = sections.length
      ? sections
          .map(
            (item) => `<button type="button" class="item${item.value === primary?.value ? " is-selected" : ""}"
              data-level="primary" data-value="${esc(item.value)}"${item.value === primary?.value ? ' aria-current="true"' : ""}>${esc(item.label)}</button>`,
          )
          .join("")
      : `<span class="hint">No sections</span>`;

    content.querySelector<HTMLElement>(".items")!.innerHTML = threeColumns
      ? children.length
        ? children
            .map(
              (item) => `<button type="button" class="item${item.value === secondary?.value ? " is-selected" : ""}"
                data-level="secondary" data-value="${esc(item.value)}"${item.value === secondary?.value ? ' aria-current="true"' : ""}>${esc(item.label)}</button>`,
            )
            .join("")
        : `<span class="hint">No child items</span>`
      : "";

    const detail = secondary?.detail ?? primary?.detail;
    root.querySelector<HTMLElement>(".detail-title")!.textContent = detail?.title ?? "Nothing selected";
    root.querySelector<HTMLElement>(".detail-body")!.textContent = detail?.body ?? "";
    const hint = root.querySelector<HTMLElement>(".detail .hint")!;
    hint.hidden = Boolean(detail);

    const route = [this.getAttribute("title"), primary?.label, secondary?.label].filter(Boolean).join(" › ");
    root.querySelector<HTMLElement>(".route")!.textContent = route;
  }
}

export const NAVIGATION_SPLIT_VIEW_TAG = "gk-navigation-split-view";
