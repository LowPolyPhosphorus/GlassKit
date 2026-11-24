import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems, toNumber } from "../shared.js";

interface GridCell {
  label?: string;
  value?: string;
  detail?: string;
  glyph?: string;
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
  .meta { color: var(--gk-color-text-dim); font-size: 10px; font-variant-numeric: tabular-nums; }

  .grid {
    display: grid;
    gap: var(--gk-grid-gap, 6px);
    grid-template-columns: repeat(var(--gk-grid-cols, 3), minmax(0, 1fr));
  }
  .cell {
    display: grid;
    gap: 3px;
    min-width: 0;
    padding: 8px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-text);
    cursor: pointer;
    text-align: left;
  }
  .cell:hover { background: var(--gk-color-card-hover); }
  .cell[aria-current="true"] { border-color: var(--gk-color-accent); background: var(--gk-color-accent-fill); }
  .glyph { color: var(--gk-color-text-dim); font-size: 14px; }
  .title { overflow: hidden; font-size: var(--gk-font-size-xs); text-overflow: ellipsis; white-space: nowrap; }
  .detail { color: var(--gk-color-text-dim); font-size: 9px; }
`;

const html = `
  <section class="panel" part="panel">
    <header class="head"><span class="label" part="label"></span><span class="meta" part="meta"></span></header>
    <div class="grid" part="grid" role="group"></div>
  </section>`;

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");

export class GridLayout extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items", "columns", "gap", "value"];
  }

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".grid")!.addEventListener("click", this.#onCellClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #items(): GridCell[] {
    const raw = parseItems<GridCell | string>(this.getAttribute("items"));
    const normalized = raw.map((item, index) =>
      typeof item === "string" ? { label: item, value: `cell-${index + 1}` } : item,
    );
    if (normalized.length) return normalized;
    return [
      { label: "Hello", value: "hello", glyph: "◇" },
      { label: "World", value: "world", glyph: "◈" },
    ];
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const columns = Math.max(1, Math.min(6, Math.trunc(toNumber(this.getAttribute("columns"), 3))));
    const gap = Math.max(0, Math.min(20, Math.trunc(toNumber(this.getAttribute("gap"), 6))));
    const grid = root.querySelector<HTMLElement>(".grid")!;
    grid.style.setProperty("--gk-grid-cols", String(columns));
    grid.style.setProperty("--gk-grid-gap", `${gap}px`);
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Grid";

    const items = this.#items();
    grid.innerHTML = items
      .map((item, index) => {
        const value = String(item.value ?? item.label ?? `cell-${index + 1}`);
        return `<button type="button" class="cell" data-index="${index}" data-value="${esc(value)}" aria-current="${value === this.value}"><span class="glyph" aria-hidden="true">${esc(item.glyph ?? "·")}</span><span class="title">${esc(item.label ?? value)}</span><span class="detail">${esc(item.detail ?? String(index + 1))}</span></button>`;
      })
      .join("");
    root.querySelector<HTMLElement>(".meta")!.textContent = `${items.length} cells · ${columns} columns`;
  }

  #onCellClick = (event: MouseEvent): void => {
    const cell = (event.target as HTMLElement).closest<HTMLButtonElement>(".cell");
    if (!cell) return;
    const value = cell.dataset.value ?? "";
    this.setAttribute("value", value);
    this.#sync();
    emit(this, "gk-cell-select", {
      value,
      index: Number(cell.dataset.index),
      label: cell.querySelector(".title")?.textContent ?? value,
      host: this,
    });
  };
}

export const GRID_LAYOUT_TAG = "gk-grid-layout";
