import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface DisclosureItem {
  title: string;
  content?: string;
  expanded?: boolean;
  disabled?: boolean;
  children?: DisclosureItem[];
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .group {
    overflow: hidden;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-bottom: 1px solid var(--gk-color-hairline);
  }

  .heading {
    min-width: 0;
    overflow: hidden;
    font-size: var(--gk-font-size-sm);
    font-weight: var(--gk-font-weight-semibold);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .all {
    margin-left: auto;
    padding: 3px 7px;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-accent);
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }
  .all:hover { background: var(--gk-color-accent-fill); }

  .items { display: grid; min-width: 0; padding: 6px; }

  .item {
    display: grid;
    gap: 0;
    min-width: 0;
    border-radius: var(--gk-radius-sm);
  }
  .item + .item { margin-top: 2px; }

  .summary {
    display: grid;
    grid-template-columns: 14px minmax(0, 1fr);
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 7px 8px;
    border: 0;
    border-radius: var(--gk-radius-sm);
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }
  .summary:hover { background: var(--gk-color-card-hover); }
  .summary:disabled { opacity: 0.45; cursor: default; }
  .summary[aria-expanded="true"] { font-weight: var(--gk-font-weight-medium); }

  .chevron {
    color: var(--gk-color-text-dim);
    font-size: var(--gk-font-size-sm);
    line-height: 1;
    transition: transform 160ms var(--gk-motion-ease-standard, ease);
  }
  .summary[aria-expanded="true"] .chevron { transform: rotate(90deg); }

  .label { overflow-wrap: anywhere; font-size: var(--gk-font-size-sm); }

  .content {
    display: grid;
    gap: 6px;
    padding: 2px 8px 8px 28px;
  }
  .content[hidden] { display: none; }
  .copy {
    margin: 0;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    line-height: 1.5;
  }

  .nested { border-left: 1px solid var(--gk-color-hairline); padding-left: 6px; }
`;

const html = `
  <div class="group" part="group">
    <div class="bar">
      <span class="heading" part="heading"></span>
      <button type="button" class="all" part="all">Collapse all</button>
    </div>
    <div class="items" part="items" role="group"></div>
  </div>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class DisclosureGroup extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items", "multiple"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      const root = this.shadowRoot!;
      root.querySelector<HTMLElement>(".items")!.addEventListener("click", this.#onToggle);
      root.querySelector<HTMLButtonElement>(".all")!.addEventListener("click", this.#onAll);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #render(items: DisclosureItem[], nested = false): string {
    if (!items.length) return "";
    return items
      .map(
        (item, index) => `<div class="item${nested ? " nested" : ""}" data-index="${index}">
          <button type="button" class="summary" aria-expanded="${item.expanded ? "true" : "false"}"${item.disabled ? " disabled" : ""}>
            <span class="chevron" aria-hidden="true">›</span>
            <span class="label">${esc(item.title ?? `Section ${index + 1}`)}</span>
          </button>
          <div class="content"${item.expanded ? "" : " hidden"}>
            ${item.content ? `<p class="copy">${esc(item.content)}</p>` : ""}
            ${this.#render(item.children ?? [], true)}
          </div>
        </div>`,
      )
      .join("");
  }

  #onToggle = (event: MouseEvent): void => {
    const summary = (event.target as HTMLElement).closest<HTMLButtonElement>(".summary");
    if (!summary || summary.disabled) return;
    const item = summary.closest<HTMLElement>(".item")!;
    const content = item.querySelector<HTMLElement>(":scope > .content")!;
    const expanded = summary.getAttribute("aria-expanded") !== "true";

    if (!this.hasAttribute("multiple")) this.#setAll(false);
    summary.setAttribute("aria-expanded", String(expanded));
    content.hidden = !expanded;
    emit(this, "gk-expand-change", {
      title: summary.querySelector<HTMLElement>(".label")?.textContent ?? "",
      expanded,
      source: this,
    });
    this.#syncAllLabel();
  };

  #onAll = (): void => {
    if (!this.shadowRoot) return;
    const summaries = Array.from(this.shadowRoot.querySelectorAll<HTMLButtonElement>(".summary"));
    const shouldExpand = summaries.every((summary) => summary.getAttribute("aria-expanded") !== "true");
    if (shouldExpand && !this.hasAttribute("multiple")) {
      this.#setAll(false);
      const first = summaries[0];
      if (first) {
        first.setAttribute("aria-expanded", "true");
        const content = first.closest<HTMLElement>(".item")!.querySelector<HTMLElement>(":scope > .content");
        if (content) content.hidden = false;
      }
    } else {
      this.#setAll(shouldExpand);
    }
    emit(this, "gk-expand-change", { expanded: shouldExpand, all: true, source: this });
    this.#syncAllLabel();
  };

  #syncAllLabel(): void {
    if (!this.shadowRoot) return;
    const anyExpanded = Array.from(this.shadowRoot.querySelectorAll<HTMLButtonElement>(".summary")).some(
      (summary) => summary.getAttribute("aria-expanded") === "true",
    );
    const all = this.shadowRoot.querySelector<HTMLButtonElement>(".all");
    if (all) all.textContent = anyExpanded ? "Collapse all" : "Expand all";
  }

  #setAll(expanded: boolean): void {
    if (!this.shadowRoot) return;
    for (const summary of Array.from(this.shadowRoot.querySelectorAll<HTMLButtonElement>(".summary"))) {
      summary.setAttribute("aria-expanded", String(expanded));
      const content = summary.closest<HTMLElement>(".item")!.querySelector<HTMLElement>(":scope > .content");
      if (content) content.hidden = !expanded;
    }
    this.#syncAllLabel();
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const items = parseItems<DisclosureItem>(this.getAttribute("items"));
    root.querySelector<HTMLElement>(".heading")!.textContent = this.getAttribute("label") ?? "Sections";
    root.querySelector<HTMLElement>(".items")!.innerHTML = this.#render(items);
    this.#syncAllLabel();
  }
}

export const DISCLOSURE_GROUP_TAG = "gk-disclosure-group";
