import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

type LooseRecord = Record<string, unknown>;
type ColumnItem = { label: string; subtitle: string; value: string };
type Column = { title: string; items: ColumnItem[]; selected?: string };

function asRecord(value: unknown): LooseRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as LooseRecord) : {};
}

function normalizeItem(value: unknown): ColumnItem {
  if (typeof value === "string") return { label: value, subtitle: "", value };
  const record = asRecord(value);
  const label = String(record.label ?? record.title ?? record.name ?? record.text ?? "");
  return {
    label,
    subtitle: String(record.subtitle ?? record.detail ?? ""),
    value: String(record.value ?? label),
  };
}

function normalizeColumn(value: unknown): Column {
  const record = asRecord(value);
  const rawItems = Array.isArray(record.items) ? record.items : [];
  return {
    title: String(record.title ?? record.label ?? ""),
    items: rawItems.map(normalizeItem),
    selected: record.selected === undefined ? undefined : String(record.selected),
  };
}

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .columns {
    display: flex;
    min-height: 180px;
    overflow-x: auto;
    background: var(--gk-color-card);
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
  }

  .column {
    flex: 0 0 160px;
    min-width: 0;
    border-right: 1px solid var(--gk-color-hairline);
  }

  .column:last-child { border-right: 0; }

  header {
    padding: 10px 12px;
    border-bottom: 1px solid var(--gk-color-hairline);
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    text-transform: uppercase;
  }

  .list { display: flex; flex-direction: column; gap: 2px; padding: 6px; }

  .item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 7px 9px;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .item:hover { background: var(--gk-color-card-hover); }

  .item[aria-selected="true"] {
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-accent);
  }

  .subtitle { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
`;

export class ColumnView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["columns"];
  }

  #strip: HTMLElement | null = null;
  #columns: Column[] = [];
  #selected: Array<number | null> = [];

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, '<div class="columns" part="columns"></div>', styles);
      this.#strip = this.shadowRoot!.querySelector<HTMLElement>(".columns");
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.#strip) return;
    this.#columns = parseItems<LooseRecord>(this.getAttribute("columns")).map(normalizeColumn);
    this.#selected = this.#columns.map((column) => {
      if (column.selected === undefined) return null;
      const index = column.items.findIndex((item) => item.value === column.selected || item.label === column.selected);
      return index >= 0 ? index : null;
    });
    this.#strip.replaceChildren();
    this.#columns.forEach((column, columnIndex) => this.#strip!.append(this.#renderColumn(column, columnIndex)));
  }

  #renderColumn(column: Column, columnIndex: number): HTMLElement {
    const section = document.createElement("section");
    section.className = "column";

    const header = document.createElement("header");
    header.textContent = column.title;
    section.append(header);

    const list = document.createElement("div");
    list.className = "list";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", column.title || `Column ${columnIndex + 1}`);

    column.items.forEach((item, itemIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "item";
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(this.#selected[columnIndex] === itemIndex));

      const label = document.createElement("span");
      label.textContent = item.label;
      button.append(label);

      if (item.subtitle) {
        const subtitle = document.createElement("span");
        subtitle.className = "subtitle";
        subtitle.textContent = item.subtitle;
        button.append(subtitle);
      }

      button.addEventListener("click", () => this.#select(columnIndex, itemIndex));
      list.append(button);
    });

    section.append(list);
    return section;
  }

  #select(columnIndex: number, itemIndex: number): void {
    this.#selected[columnIndex] = itemIndex;
    const list = this.#strip?.querySelectorAll(".list")[columnIndex];
    list?.querySelectorAll<HTMLButtonElement>(".item").forEach((button, index) => {
      button.setAttribute("aria-selected", String(index === itemIndex));
    });

    const item = this.#columns[columnIndex]?.items[itemIndex];
    if (!item) return;
    emit(this, "gk-select", { column: columnIndex, index: itemIndex, item, value: item.value, source: this });
  }
}

export const COLUMN_VIEW_TAG = "gk-column-view";
