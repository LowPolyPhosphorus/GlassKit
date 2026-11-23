import { mountShadow } from "../base.js";
import { componentBaseCss, emit, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .item {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--gk-space-2);
    width: 100%;
    min-height: 34px;
    padding: 5px 9px;
    border: 1px solid transparent;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    text-align: left;
    cursor: pointer;
  }

  .item:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }

  .item[aria-current="page"] {
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-accent);
  }

  .item:disabled { opacity: 0.45; cursor: default; }
  .icon { display: grid; place-items: center; width: 18px; }
  .fallback:empty { display: none; }
  .label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .badge { color: var(--gk-color-text-dim); font-size: var(--gk-font-size-xs); }
`;

const html = `
  <button type="button" class="item" part="item">
    <span class="icon"><slot name="icon"></slot></span>
    <span class="label"><span class="fallback"></span><slot name="label"></slot></span>
    <span class="badge"><span class="fallback"></span><slot name="badge"></slot></span>
  </button>`;

export class SidebarItem extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "value", "badge", "selected", "disabled"];
  }

  #button: HTMLButtonElement | null = null;

  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean) {
    this.toggleAttribute("selected", value);
  }

  get value(): string {
    return this.getAttribute("value") ?? this.getAttribute("label") ?? "";
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#button = this.shadowRoot!.querySelector<HTMLButtonElement>(".item");
      this.#button!.addEventListener("click", this.#onClick);
      this.shadowRoot!.querySelector('slot[name="label"]')!.addEventListener("slotchange", () => this.#sync());
      this.shadowRoot!.querySelector('slot[name="badge"]')!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (): void => {
    if (this.hasAttribute("disabled")) return;
    emit(this, "gk-select", { value: this.value, label: this.getAttribute("label") ?? "", source: this });
  };

  #sync(): void {
    if (!this.#button || !this.shadowRoot) return;
    const label = this.getAttribute("label") ?? "";
    this.#button.disabled = this.hasAttribute("disabled");
    if (this.selected) this.#button.setAttribute("aria-current", "page");
    else this.#button.removeAttribute("aria-current");
    this.#button.setAttribute("aria-label", label || this.value);
    this.#button.querySelector<HTMLElement>(".fallback")!.textContent = slotHasContent(this.shadowRoot, "label")
      ? ""
      : label;
    const badge = this.shadowRoot.querySelector<HTMLElement>(".badge")!;
    const hasBadge = slotHasContent(this.shadowRoot, "badge");
    badge.hidden = !this.getAttribute("badge") && !hasBadge;
    badge.querySelector<HTMLElement>(".fallback")!.textContent = hasBadge ? "" : this.getAttribute("badge") ?? "";
  }
}

export const SIDEBAR_ITEM_TAG = "gk-sidebar-item";
