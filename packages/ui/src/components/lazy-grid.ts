import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems, toNumber } from "../shared.js";

interface GridItem {
  label?: string;
  value?: string;
  detail?: string;
}

const CELL_WIDTH = 96;
const ROW_HEIGHT = 34;

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
  .range { color: var(--gk-color-text-dim); font-size: 10px; font-variant-numeric: tabular-nums; }

  .viewport { overflow-x: auto; overflow-y: hidden; border: 1px solid var(--gk-color-soft-hairline); border-radius: var(--gk-radius-sm); background: var(--gk-color-glass-thin); }
  .content { display: flex; width: max-content; min-height: 100%; }
  .spacer { flex: none; }
  .columns { display: flex; flex: none; }
  .column { display: grid; flex: none; width: ${CELL_WIDTH}px; }

  .cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    box-sizing: border-box;
    width: ${CELL_WIDTH}px;
    height: ${ROW_HEIGHT}px;
    padding: 5px 7px;
    border: 0;
    border-right: 1px solid var(--gk-color-soft-hairline);
    border-bottom: 1px solid var(--gk-color-soft-hairline);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: 10px;
    text-align: left;
  }
  .cell:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }
  .cell[aria-current="true"] { background: var(--gk-color-accent-fill); color: var(--gk-color-text); }
  .cell .detail { color: var(--gk-color-text-dim); font-size: 9px; }
`;

const html = `
  <section class="panel" part="panel">
    <header class="head"><span class="label" part="label"></span><span class="range" part="range"></span></header>
    <div class="viewport" part="viewport" tabindex="0"><div class="content" part="content"></div></div>
  </section>`;

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export class LazyGrid extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items", "rows", "value"];
  }

  #start = -1;
  #end = -1;
  #onScroll = (): void => this.#renderWindow();

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      const viewport = this.shadowRoot!.querySelector<HTMLElement>(".viewport")!;
      viewport.addEventListener("scroll", this.#onScroll, { passive: true });
      this.shadowRoot!.querySelector<HTMLElement>(".content")!.addEventListener("click", this.#onCellClick);
    }
    this.#sync();
  }

  disconnectedCallback(): void {
    this.shadowRoot?.querySelector<HTMLElement>(".viewport")?.removeEventListener("scroll", this.#onScroll);
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #items(): GridItem[] {
    const raw = parseItems<GridItem | string>(this.getAttribute("items"));
    const normalized = raw.map((item, index) =>
      typeof item === "string" ? { label: item, value: `cell-${index + 1}` } : item,
    );
    if (normalized.length) return normalized;
    return Array.from({ length: 48 }, (_, index) => ({ label: `Cell ${index + 1}`, value: `cell-${index + 1}` }));
  }

  #rows(): number {
    return Math.max(1, Math.min(6, Math.trunc(toNumber(this.getAttribute("rows"), 2))));
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const rows = this.#rows();
    root.querySelector<HTMLElement>(".viewport")!.style.height = `${rows * ROW_HEIGHT}px`;
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Lazy grid";
    this.#start = -1;
    this.#end = -1;
    this.#renderWindow();
  }

  #renderWindow(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const viewport = root.querySelector<HTMLElement>(".viewport")!;
    const content = root.querySelector<HTMLElement>(".content")!;
    const items = this.#items();
    const rows = this.#rows();
    const columns = Math.ceil(items.length / rows);
    const visible = Math.max(1, Math.ceil(((viewport.clientWidth || CELL_WIDTH * 3) / CELL_WIDTH)));
    const first = Math.max(0, Math.floor(viewport.scrollLeft / CELL_WIDTH) - 2);
    const last = Math.min(columns, first + visible + 4);
    if (first === this.#start && last === this.#end) return;
    this.#start = first;
    this.#end = last;

    const before = document.createElement("div");
    const after = document.createElement("div");
    before.className = after.className = "spacer";
    before.style.width = `${first * CELL_WIDTH}px`;
    after.style.width = `${Math.max(0, columns - last) * CELL_WIDTH}px`;

    const columnsHtml: string[] = [];
    for (let column = first; column < last; column += 1) {
      const cells: string[] = [];
      for (let row = 0; row < rows; row += 1) {
        const index = column * rows + row;
        const item = items[index];
        if (!item) continue;
        const value = String(item.value ?? item.label ?? `cell-${index + 1}`);
        cells.push(
          `<button type="button" class="cell" data-index="${index}" data-value="${esc(value)}" aria-current="${value === this.value}"><span>${esc(item.label ?? value)}</span><span class="detail">${esc(item.detail ?? String(index + 1))}</span></button>`,
        );
      }
      columnsHtml.push(`<div class="column">${cells.join("")}</div>`);
    }

    content.replaceChildren(before);
    content.insertAdjacentHTML("beforeend", `<div class="columns">${columnsHtml.join("")}</div>`);
    content.append(after);
    root.querySelector<HTMLElement>(".range")!.textContent = `columns ${first + 1}–${last} of ${columns}`;
    emit(this, "gk-grid-range", { start: first, end: last, columns, rows, host: this });
  }

  #onCellClick = (event: MouseEvent): void => {
    const cell = (event.target as HTMLElement).closest<HTMLButtonElement>(".cell");
    if (!cell) return;
    const value = cell.dataset.value ?? "";
    this.setAttribute("value", value);
    emit(this, "gk-select", {
      value,
      index: Number(cell.dataset.index),
      label: cell.querySelector("span")?.textContent ?? value,
      host: this,
    });
  };
}

export const LAZY_GRID_TAG = "gk-lazy-grid";
