import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface StackItem {
  label: string;
  value: string;
  detail?: string;
  description?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .stack {
    overflow: hidden;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    padding: 7px 10px;
    border-bottom: 1px solid var(--gk-color-hairline);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-accent);
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }
  .back:hover { background: var(--gk-color-accent-fill); }
  .back[hidden] { display: none; }

  .title {
    min-width: 0;
    overflow: hidden;
    font-size: var(--gk-font-size-sm);
    font-weight: var(--gk-font-weight-semibold);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .crumb {
    margin-left: auto;
    color: var(--gk-color-text-dim);
    font-size: 10px;
  }

  .root, .detail { padding: 8px; }

  .route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border: 1px solid transparent;
    border-radius: var(--gk-radius-sm);
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }
  .route:hover { background: var(--gk-color-card-hover); }
  .route .name { font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-medium); }
  .route .meta { display: block; margin-top: 2px; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
  .route .chevron { color: var(--gk-color-text-dim); }
  .route[hidden], .detail[hidden], .root[hidden] { display: none !important; }

  .detail-title { margin: 0 0 6px; font-size: var(--gk-font-size-lg); }
  .detail-copy { margin: 0; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-sm); line-height: 1.55; }
  .empty { padding: 14px; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-sm); text-align: center; }
`;

const html = `
  <div class="stack" part="stack">
    <div class="bar">
      <button type="button" class="back" part="back" hidden>‹ Back</button>
      <span class="title" part="title"></span>
      <span class="crumb" part="crumb"></span>
    </div>
    <div class="root" part="root" role="group" aria-label="Destinations"></div>
    <div class="detail" part="detail" hidden>
      <h3 class="detail-title" part="detail-title"></h3>
      <p class="detail-copy" part="detail-copy"></p>
      <slot></slot>
    </div>
  </div>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class NavigationStack extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["title", "items", "value"];
  }

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    this.setAttribute("value", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".root")!.addEventListener("click", this.#onRootClick);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".back")!.addEventListener("click", () => this.back());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  back(): void {
    const from = this.value;
    this.value = "";
    emit(this, "gk-navigate", { value: "back", from, source: this });
  }

  #items(): StackItem[] {
    return parseItems<StackItem>(this.getAttribute("items")).map((item, index) =>
      typeof item === "string"
        ? { label: item, value: item }
        : {
            label: String(item.label ?? item.value ?? `Item ${index + 1}`),
            value: String(item.value ?? item.label ?? index),
            detail: item.detail ? String(item.detail) : undefined,
            description: item.description ? String(item.description) : undefined,
          },
    );
  }

  #onRootClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".route");
    if (!button) return;
    this.value = button.dataset.value ?? "";
    emit(this, "gk-navigate", { value: this.value, label: button.dataset.label ?? "", source: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const items = this.#items();
    const active = items.find((item) => item.value === this.value);
    const title = this.getAttribute("title") ?? "Navigate";

    root.querySelector<HTMLElement>(".title")!.textContent = active?.label ?? title;
    root.querySelector<HTMLElement>(".crumb")!.textContent = active ? "Detail" : `${items.length} destinations`;
    root.querySelector<HTMLButtonElement>(".back")!.hidden = !active;
    root.querySelector<HTMLElement>(".root")!.hidden = Boolean(active);
    root.querySelector<HTMLElement>(".detail")!.hidden = !active;
    root.querySelector<HTMLElement>(".root")!.innerHTML = items.length
      ? items
          .map(
            (item) => `<button type="button" class="route"${item.value === active?.value ? ' aria-current="true"' : ""} data-value="${esc(item.value)}" data-label="${esc(item.label)}">
              <span><span class="name">${esc(item.label)}</span>${item.detail ? `<span class="meta">${esc(item.detail)}</span>` : ""}</span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>`,
          )
          .join("")
      : `<p class="empty">No destinations registered.</p>`;

    if (active) {
      root.querySelector<HTMLElement>(".detail-title")!.textContent = active.label;
      root.querySelector<HTMLElement>(".detail-copy")!.textContent =
        active.description ?? active.detail ?? "This destination is ready for slotted detail content.";
    }
  }
}

export const NAVIGATION_STACK_TAG = "gk-navigation-stack";
