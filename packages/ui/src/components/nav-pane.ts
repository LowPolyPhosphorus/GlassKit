import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface NavItem {
  label?: string;
  value?: string;
  detail?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .pane {
    display: grid;
    grid-template-columns: minmax(110px, 0.7fr) minmax(0, 1fr);
    gap: 8px;
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }
  .head { grid-column: 1 / -1; display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .label:empty { display: none; }
  .hint { color: var(--gk-color-text-dim); font-size: 10px; }

  .list, .detail { min-width: 0; border: 1px solid var(--gk-color-soft-hairline); border-radius: var(--gk-radius-sm); background: var(--gk-color-glass-thin); }
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    box-sizing: border-box;
    width: 100%;
    min-height: 30px;
    padding: 5px 8px;
    border: 0;
    border-bottom: 1px solid var(--gk-color-soft-hairline);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
    text-align: left;
  }
  .item:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }
  .item[aria-current="true"] { background: var(--gk-color-accent-fill); color: var(--gk-color-text); }
  .item .detail { color: var(--gk-color-text-dim); font-size: 9px; }

  .detail { display: grid; align-content: start; gap: 6px; padding: 10px; }
  .detail-title { font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-semibold); }
  .detail-body { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); line-height: 1.45; }
  .back { justify-self: start; min-height: 24px; padding: 3px 8px; border: 1px solid var(--gk-color-hairline); border-radius: var(--gk-radius-xs); background: transparent; color: var(--gk-color-text-muted); cursor: pointer; font-size: 10px; }
  .back:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }
`;

const html = `
  <section class="pane" part="pane">
    <header class="head"><span class="label" part="label"></span><span class="hint" part="hint"></span></header>
    <div class="list" part="list" role="listbox"></div>
    <div class="detail" part="detail">
      <strong class="detail-title" part="detail-title"></strong>
      <span class="detail-body" part="detail-body"></span>
      <button type="button" class="back" part="back">Back</button>
    </div>
  </section>`;

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");

export class NavPane extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items", "value", "detail-title", "detail-body"];
  }

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".list")!.addEventListener("click", this.#onItemClick);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".back")!.addEventListener("click", this.#onBack);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #items(): NavItem[] {
    const raw = parseItems<NavItem | string>(this.getAttribute("items"));
    const normalized = raw.map((item, index) =>
      typeof item === "string" ? { label: item, value: `note-${index + 1}` } : item,
    );
    if (normalized.length) return normalized;
    return [{ label: "Select a Note", value: "empty", detail: "Empty" }];
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const items = this.#items();
    const current = items.find((item) => String(item.value ?? "") === this.value);
    const label = this.getAttribute("label") ?? "Notes";
    root.querySelector<HTMLElement>(".label")!.textContent = label;
    root.querySelector<HTMLElement>(".list")!.setAttribute("aria-label", label);
    root.querySelector<HTMLElement>(".hint")!.textContent = current ? "Detail shown" : `${items.length} items`;
    root.querySelector<HTMLElement>(".list")!.innerHTML = items
      .map((item) => {
        const value = String(item.value ?? item.label ?? "item");
        return `<button type="button" class="item" role="option" data-value="${esc(value)}" aria-current="${value === this.value}"><span>${esc(item.label ?? value)}</span><span class="detail">${esc(item.detail ?? "")}</span></button>`;
      })
      .join("");
    root.querySelector<HTMLElement>(".detail-title")!.textContent =
      this.getAttribute("detail-title") ?? current?.label ?? "Select a Note";
    root.querySelector<HTMLElement>(".detail-body")!.textContent =
      this.getAttribute("detail-body") ?? current?.detail ?? "Choose an item to see its details here.";
    root.querySelector<HTMLButtonElement>(".back")!.hidden = !current;
  }

  #onItemClick = (event: MouseEvent): void => {
    const item = (event.target as HTMLElement).closest<HTMLButtonElement>(".item");
    if (!item) return;
    const value = item.dataset.value ?? "";
    const label = item.querySelector("span")?.textContent ?? value;
    this.setAttribute("value", value);
    emit(this, "gk-navigate", { value, label, source: this });
  };

  #onBack = (): void => {
    this.removeAttribute("value");
    emit(this, "gk-navigate", { value: "back", label: "Back", source: this });
  };
}

export const NAV_PANE_TAG = "gk-nav-pane";
