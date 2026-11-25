import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems, toNumber } from "../shared.js";

interface ListItem {
  label?: string;
  value?: string;
  detail?: string;
  section?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .panel {
    display: grid;
    gap: 7px;
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }
  .head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .label:empty { display: none; }
  .count { color: var(--gk-color-text-dim); font-size: 10px; font-variant-numeric: tabular-nums; }

  .viewport {
    overflow-y: auto;
    border: 1px solid var(--gk-color-soft-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    scrollbar-width: thin;
  }
  .section {
    padding: 5px 9px 3px;
    border-bottom: 1px solid var(--gk-color-soft-hairline);
    background: var(--gk-color-card-hover);
    color: var(--gk-color-text-dim);
    font-size: 9px;
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    box-sizing: border-box;
    width: 100%;
    min-height: 30px;
    padding: 5px 9px;
    border: 0;
    border-bottom: 1px solid var(--gk-color-soft-hairline);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
    text-align: left;
  }
  .row:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }
  .row[aria-selected="true"] { background: var(--gk-color-accent-fill); color: var(--gk-color-text); }
  .row .detail { color: var(--gk-color-text-dim); font-size: 10px; }
  .row[aria-selected="true"] .detail { color: var(--gk-color-text-muted); }
`;

const html = `
  <section class="panel" part="panel">
    <header class="head"><span class="label" part="label"></span><span class="count" part="count" aria-live="polite"></span></header>
    <div class="viewport" part="viewport" tabindex="0"><div class="content" part="content" role="listbox"></div></div>
  </section>`;

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");

export class ListView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items", "mode", "value", "height"];
  }

  #renderedItems = "";

  get value(): string[] {
    const raw = this.getAttribute("value") ?? "";
    if (!raw) return [];
    if (raw.trim().startsWith("[")) {
      return parseItems<string>(raw).map((item) => String(item));
    }
    return [raw];
  }

  get multiple(): boolean {
    return this.getAttribute("mode") === "multiple";
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".content")!.addEventListener("click", this.#onRowClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #items(): ListItem[] {
    const raw = parseItems<ListItem | string>(this.getAttribute("items"));
    const normalized = raw.map((item, index) =>
      typeof item === "string" ? { label: item, value: `item-${index + 1}` } : item,
    );
    if (normalized.length) return normalized;
    return [
      { label: "A List Item", value: "one", section: "Examples" },
      { label: "A Second List Item", value: "two", section: "Examples" },
      { label: "A Third List Item", value: "three", section: "Examples" },
    ];
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "List";
    const height = Math.min(360, Math.max(90, toNumber(this.getAttribute("height"), 160)));
    root.querySelector<HTMLElement>(".viewport")!.style.height = `${height}px`;
    const content = root.querySelector<HTMLElement>(".content")!;
    content.setAttribute("aria-label", this.getAttribute("label") ?? "List");
    content.setAttribute("aria-multiselectable", String(this.multiple));

    const items = this.#items();
    const selected = new Set(this.value);
    const sections: string[] = [];
    items.forEach((item) => {
      const section = item.section ?? "";
      if (section && !sections.includes(section)) sections.push(section);
    });

    const rows: string[] = [];
    const emitSection = (section: string): void => {
      if (!section) return;
      rows.push(`<div class="section" role="presentation">${esc(section)}</div>`);
    };

    if (sections.length) {
      sections.forEach((section) => {
        emitSection(section);
        items.filter((item) => (item.section ?? "") === section).forEach((item) => rows.push(this.#row(item, selected)));
      });
    } else {
      items.forEach((item) => rows.push(this.#row(item, selected)));
    }

    const signature = items
      .map((item) => JSON.stringify([item.section ?? "", item.value ?? item.label ?? "item", item.label ?? "", item.detail ?? ""]))
      .join("|");
    if (signature === this.#renderedItems) {
      content.querySelectorAll<HTMLButtonElement>(".row").forEach((row) => {
        row.setAttribute("aria-selected", String(selected.has(row.dataset.value ?? "")));
      });
    } else {
      this.#renderedItems = signature;
      content.innerHTML = rows.join("");
    }
    root.querySelector<HTMLElement>(".count")!.textContent = `${selected.size} selected · ${this.multiple ? "multiple" : "single"}`;
  }

  #row(item: ListItem, selected: Set<string>): string {
    const value = String(item.value ?? item.label ?? "item");
    const label = String(item.label ?? value);
    return `<button type="button" class="row" role="option" data-value="${esc(value)}" aria-selected="${selected.has(value)}"><span>${esc(label)}</span><span class="detail">${esc(item.detail ?? "")}</span></button>`;
  }

  #onRowClick = (event: MouseEvent): void => {
    const row = (event.target as HTMLElement).closest<HTMLButtonElement>(".row");
    if (!row) return;
    const value = row.dataset.value ?? "";
    const selected = new Set(this.value);
    let isSelected: boolean;
    if (this.multiple) {
      isSelected = !selected.has(value);
      if (isSelected) selected.add(value);
      else selected.delete(value);
      this.setAttribute("value", JSON.stringify([...selected]));
    } else {
      isSelected = true;
      selected.clear();
      selected.add(value);
      this.setAttribute("value", value);
    }
    emit(this, "gk-list-select", { value, values: [...selected], selected: isSelected, multiple: this.multiple, host: this });
    if (this.multiple) emit(this, "gk-list-toggle", { value, selected: isSelected, values: [...selected], host: this });
  };
}

export const LIST_VIEW_TAG = "gk-list-view";
