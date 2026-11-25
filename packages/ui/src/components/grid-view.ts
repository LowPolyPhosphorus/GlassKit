import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems, toNumber } from "../shared.js";

interface GridItem {
  label: string;
  value: string;
  detail?: string;
  badge?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .grid-view {
    display: grid;
    gap: 8px;
    min-width: 0;
  }

  .caption {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }
  .caption:empty { display: none; }

  .grid {
    display: grid;
    grid-template-columns: repeat(var(--gk-grid-columns, 3), minmax(0, 1fr));
    gap: var(--gk-grid-gap, 8px);
    min-width: 0;
  }

  .cell {
    display: grid;
    align-content: start;
    gap: 5px;
    min-width: 0;
    min-height: 72px;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: inherit;
    cursor: pointer;
    text-align: left;
  }
  .cell:hover { background: var(--gk-color-card-hover); }
  .cell[aria-pressed="true"] {
    border-color: var(--gk-color-accent-stroke);
    background: var(--gk-color-accent-fill);
  }
  .cell .label { font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-medium); overflow-wrap: anywhere; }
  .cell .detail { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
  .cell .badge {
    justify-self: start;
    padding: 2px 6px;
    border-radius: var(--gk-radius-pill);
    background: var(--gk-color-glass-regular);
    color: var(--gk-color-text-muted);
    font-size: 10px;
  }
  .empty {
    grid-column: 1 / -1;
    padding: 14px;
    border: 1px dashed var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-sm);
    text-align: center;
  }

  @media (max-width: 640px) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;

const html = `
  <div class="grid-view" part="grid-view">
    <span class="caption" part="caption"></span>
    <div class="grid" part="grid" role="group"></div>
  </div>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class GridView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["caption", "columns", "gap", "items", "value"];
  }

  #renderedItems = "";

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    this.setAttribute("value", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".grid")!.addEventListener("click", this.#onClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #items(): GridItem[] {
    return parseItems<GridItem>(this.getAttribute("items")).map((item, index) =>
      typeof item === "string"
        ? { label: item, value: item }
        : {
            label: String(item.label ?? item.value ?? `Item ${index + 1}`),
            value: String(item.value ?? item.label ?? index),
            detail: item.detail ? String(item.detail) : undefined,
            badge: item.badge ? String(item.badge) : undefined,
          },
    );
  }

  #onClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".cell");
    if (!button) return;
    this.value = button.dataset.value ?? "";
    emit(this, "gk-select", { value: this.value, label: button.dataset.label ?? "", source: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const items = this.#items();
    const grid = root.querySelector<HTMLElement>(".grid")!;
    const columns = Math.max(toNumber(this.getAttribute("columns"), 3), 1);
    const gap = (this.getAttribute("gap") ?? "8px").trim();

    root.querySelector<HTMLElement>(".caption")!.textContent = this.getAttribute("caption") ?? "";
    grid.style.setProperty("--gk-grid-columns", String(columns));
    grid.style.setProperty("--gk-grid-gap", gap);
    const signature = JSON.stringify(items);
    if (signature === this.#renderedItems) {
      grid.querySelectorAll<HTMLButtonElement>(".cell").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.value === this.value));
      });
      return;
    }
    this.#renderedItems = signature;
    grid.innerHTML = items.length
      ? items
          .map(
            (item) => `<button type="button" class="cell" data-value="${esc(item.value)}" data-label="${esc(item.label)}" aria-pressed="${item.value === this.value}">
              ${item.badge ? `<span class="badge">${esc(item.badge)}</span>` : ""}
              <span class="label">${esc(item.label)}</span>
              ${item.detail ? `<span class="detail">${esc(item.detail)}</span>` : ""}
            </button>`,
          )
          .join("")
      : `<p class="empty">No items to display</p>`;
  }
}

export const GRID_VIEW_TAG = "gk-grid-view";
