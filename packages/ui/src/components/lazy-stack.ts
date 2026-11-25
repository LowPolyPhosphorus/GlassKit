import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems, toNumber } from "../shared.js";

interface LazyItem {
  label?: string;
  value?: string;
  detail?: string;
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
  .range { color: var(--gk-color-text-dim); font-size: 10px; font-variant-numeric: tabular-nums; }

  .viewport {
    overflow: auto;
    max-width: 100%;
    border: 1px solid var(--gk-color-soft-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    scrollbar-width: thin;
  }
  .content { min-width: 0; min-height: 0; }
  :host([orientation="horizontal"]) .viewport { display: flex; }
  :host([orientation="horizontal"]) .content { display: flex; flex: none; }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    box-sizing: border-box;
    width: 100%;
    height: 32px;
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
  .row[aria-current="true"] { background: var(--gk-color-accent-fill); color: var(--gk-color-text); }
  .row .detail { color: var(--gk-color-text-dim); font-size: 10px; }
  :host([orientation="horizontal"]) .row { width: 120px; height: 100%; border-right: 1px solid var(--gk-color-soft-hairline); border-bottom: 0; }
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

export class LazyStack extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items", "orientation", "height", "value"];
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
      this.shadowRoot!.querySelector<HTMLElement>(".content")!.addEventListener("click", this.#onRowClick);
    }
    this.#sync();
  }

  disconnectedCallback(): void {
    this.shadowRoot?.querySelector<HTMLElement>(".viewport")?.removeEventListener("scroll", this.#onScroll);
  }

  attributeChangedCallback(name: string): void {
    if (name === "value" && this.shadowRoot) {
      this.shadowRoot.querySelectorAll<HTMLButtonElement>(".row").forEach((row) => {
        row.setAttribute("aria-current", String(row.dataset.value === this.value));
      });
      return;
    }
    this.#sync();
  }

  #items(): LazyItem[] {
    const raw = parseItems<LazyItem | string>(this.getAttribute("items"));
    const normalized = raw.map((item, index) =>
      typeof item === "string" ? { label: item, value: `item-${index + 1}` } : item,
    );
    if (normalized.length) return normalized;
    return Array.from({ length: 100 }, (_, index) => ({ label: `Row ${index + 1}`, value: `row-${index + 1}` }));
  }

  #horizontal(): boolean {
    return this.getAttribute("orientation") === "horizontal";
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const viewport = root.querySelector<HTMLElement>(".viewport")!;
    const height = Math.min(360, Math.max(80, toNumber(this.getAttribute("height"), 160)));
    viewport.style.height = `${height}px`;
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Lazy stack";
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
    const horizontal = this.#horizontal();
    const extent = horizontal ? 120 : 32;
    const visible = Math.max(1, Math.ceil(((horizontal ? viewport.clientWidth : viewport.clientHeight) || extent) / extent));
    const offset = horizontal ? viewport.scrollLeft : viewport.scrollTop;
    const first = Math.max(0, Math.floor(offset / extent) - 3);
    const last = Math.min(items.length, first + visible + 6);
    if (first === this.#start && last === this.#end) return;
    this.#start = first;
    this.#end = last;

    const before = document.createElement("div");
    const after = document.createElement("div");
    if (horizontal) {
      before.style.width = `${first * extent}px`;
      after.style.width = `${Math.max(0, items.length - last) * extent}px`;
      before.style.flex = after.style.flex = "none";
    } else {
      before.style.height = `${first * extent}px`;
      after.style.height = `${Math.max(0, items.length - last) * extent}px`;
    }
    const rows = items.slice(first, last).map((item, index) => {
      const absolute = first + index;
      const value = String(item.value ?? item.label ?? `item-${absolute + 1}`);
      return `<button type="button" class="row" data-index="${absolute}" data-value="${esc(value)}" aria-current="${value === this.value}"><span>${esc(item.label ?? value)}</span><span class="detail">${esc(item.detail ?? `${absolute + 1} / ${items.length}`)}</span></button>`;
    });
    const active = root.activeElement;
    const focusedValue = active instanceof HTMLButtonElement && active.classList.contains("row") ? active.dataset.value : undefined;
    content.replaceChildren(before);
    rows.forEach((row) => content.insertAdjacentHTML("beforeend", row));
    content.append(after);
    if (focusedValue !== undefined) {
      [...content.querySelectorAll<HTMLButtonElement>(".row")].find((row) => row.dataset.value === focusedValue)?.focus();
    }
    root.querySelector<HTMLElement>(".range")!.textContent = `${first + 1}–${last} of ${items.length}`;
    emit(this, "gk-range-change", { start: first, end: last, total: items.length, host: this });
  }

  #onRowClick = (event: MouseEvent): void => {
    const row = (event.target as HTMLElement).closest<HTMLButtonElement>(".row");
    if (!row) return;
    const value = row.dataset.value ?? "";
    this.setAttribute("value", value);
    emit(this, "gk-select", { value, index: Number(row.dataset.index), label: row.querySelector("span")?.textContent ?? value, host: this });
  };
}

export const LAZY_STACK_TAG = "gk-lazy-stack";
