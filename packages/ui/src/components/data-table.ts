import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface TableColumn {
  key: string;
  title: string;
  align?: "start" | "end";
}

type TableRow = Record<string, unknown>;

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .table {
    overflow-x: auto;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  table { width: 100%; border-collapse: collapse; font-size: var(--gk-font-size-sm); }
  caption {
    padding: 10px 12px;
    border-bottom: 1px solid var(--gk-color-hairline);
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
    text-align: left;
  }

  th, td {
    padding: 9px 12px;
    border-bottom: 1px solid var(--gk-color-soft-hairline);
    text-align: left;
    white-space: nowrap;
  }

  th:last-child, td:last-child { border-bottom: 0; }
  th button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-weight: var(--gk-font-weight-semibold);
  }
  th button:hover { color: var(--gk-color-accent); }
  th[aria-sort] button { color: var(--gk-color-accent); }
  .sort { font-size: 9px; }

  tbody tr { cursor: pointer; }
  tbody tr:hover { background: var(--gk-color-card-hover); }
  tbody tr[aria-selected="true"] { background: var(--gk-color-accent-fill); }
  tbody tr:focus-visible { outline: 2px solid var(--gk-color-accent); outline-offset: -2px; }
  .empty { padding: 14px; color: var(--gk-color-text-muted); text-align: center; }
`;

const html = `
  <div class="table" part="table">
    <table>
      <caption part="caption"></caption>
      <thead></thead>
      <tbody></tbody>
    </table>
  </div>`;

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export class DataTable extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["caption", "columns", "rows", "value", "row-key"];
  }

  #sortKey = "";
  #sortDirection: "ascending" | "descending" = "ascending";

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    this.setAttribute("value", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>("thead")!.addEventListener("click", this.#onHeaderClick);
      this.shadowRoot!.querySelector<HTMLElement>("tbody")!.addEventListener("click", this.#onRowClick);
      this.shadowRoot!.querySelector<HTMLElement>("tbody")!.addEventListener("keydown", this.#onRowKeydown);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #columns(): TableColumn[] {
    return parseItems<TableColumn>(this.getAttribute("columns")).filter((column) => column.key && column.title);
  }

  #rows(): TableRow[] {
    const rows = parseItems<TableRow>(this.getAttribute("rows"));
    if (!this.#sortKey) return rows;
    const key = this.#sortKey;
    const direction = this.#sortDirection === "ascending" ? 1 : -1;
    return [...rows].sort((left, right) => {
      const a = left[key];
      const b = right[key];
      const comparison = String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });
      return comparison * direction;
    });
  }

  #rowKey(row: TableRow, index: number): string {
    const key = this.getAttribute("row-key") ?? "id";
    return String(row[key] ?? index);
  }

  #onHeaderClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-key]");
    if (!button) return;
    const key = button.dataset.key!;
    if (this.#sortKey === key) {
      this.#sortDirection = this.#sortDirection === "ascending" ? "descending" : "ascending";
    } else {
      this.#sortKey = key;
      this.#sortDirection = "ascending";
    }
    this.#sync();
    emit(this, "gk-sort", { key, direction: this.#sortDirection, source: this });
  };

  #onRowClick = (event: MouseEvent): void => {
    const row = (event.target as HTMLElement).closest<HTMLTableRowElement>("tr[data-key]");
    if (row) this.#select(row.dataset.key ?? "");
  };

  #onRowKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const row = (event.target as HTMLElement).closest<HTMLTableRowElement>("tr[data-key]");
    if (!row) return;
    event.preventDefault();
    this.#select(row.dataset.key ?? "");
  };

  #select(key: string): void {
    this.value = key;
    emit(this, "gk-select", { value: key, source: this });
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const columns = this.#columns();
    const rows = this.#rows();

    root.querySelector<HTMLElement>("caption")!.textContent = this.getAttribute("caption") ?? "";
    root.querySelector<HTMLElement>("thead")!.innerHTML = columns
      .map((column) => {
        const active = this.#sortKey === column.key;
        const sort = active ? (this.#sortDirection === "ascending" ? "↑" : "↓") : "";
        const ariaSort = active ? ` aria-sort="${this.#sortDirection}"` : "";
        const align = column.align === "end" ? "right" : "left";
        return `<th scope="col"${ariaSort} style="text-align:${align}"><button type="button" data-key="${esc(column.key)}">${esc(column.title)}<span class="sort" aria-hidden="true">${sort}</span></button></th>`;
      })
      .join("");

    root.querySelector<HTMLElement>("tbody")!.innerHTML = rows.length
      ? rows
          .map((row, index) => {
            const key = this.#rowKey(row, index);
            const cells = columns
              .map((column) => {
                const align = column.align === "end" ? "right" : "left";
                return `<td style="text-align:${align}">${esc(row[column.key])}</td>`;
              })
              .join("");
            return `<tr tabindex="0" data-key="${esc(key)}" aria-selected="${key === this.value}">${cells}</tr>`;
          })
          .join("")
      : `<tr><td class="empty" colspan="${Math.max(columns.length, 1)}">No rows to display</td></tr>`;
  }
}

export const DATA_TABLE_TAG = "gk-data-table";
