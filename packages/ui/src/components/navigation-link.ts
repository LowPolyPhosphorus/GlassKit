import { mountShadow } from "../base.js";
import { componentBaseCss, emit, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .link {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: var(--gk-space-3);
    width: 100%;
    min-height: 46px;
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: var(--gk-radius-sm);
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }

  .link:hover:not(:disabled) { background: var(--gk-color-card-hover); }
  .link[aria-current="page"] { background: var(--gk-color-accent-fill); border-color: var(--gk-color-accent-stroke); }
  .link:disabled { opacity: 0.45; cursor: default; }
  .copy { min-width: 0; }
  .label { display: block; font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-medium); }
  .detail { display: block; margin-top: 2px; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
  .detail:empty { display: none; }
  .trailing { color: var(--gk-color-text-dim); font-size: 14px; }
  .fallback:empty { display: none; }
`;

const html = `
  <button type="button" class="link" part="link">
    <span class="copy"><span class="label" part="label"></span><span class="detail" part="detail"></span></span>
    <span class="trailing"><span class="fallback"></span><slot name="trailing"></slot></span>
    <span class="chevron" aria-hidden="true">›</span>
  </button>`;

export class NavigationLink extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "detail", "value", "selected", "disabled"];
  }

  #button: HTMLButtonElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#button = this.shadowRoot!.querySelector<HTMLButtonElement>(".link");
      this.#button!.addEventListener("click", this.#onClick);
      this.shadowRoot!.querySelector('slot[name="trailing"]')!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (): void => {
    if (this.hasAttribute("disabled")) return;
    emit(this, "gk-navigate", {
      value: this.getAttribute("value") ?? this.getAttribute("label") ?? "",
      label: this.getAttribute("label") ?? "",
      source: this,
    });
  };

  #sync(): void {
    if (!this.shadowRoot || !this.#button) return;
    this.shadowRoot.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Open";
    this.shadowRoot.querySelector<HTMLElement>(".detail")!.textContent = this.getAttribute("detail") ?? "";
    this.#button.disabled = this.hasAttribute("disabled");
    if (this.hasAttribute("selected")) this.#button.setAttribute("aria-current", "page");
    else this.#button.removeAttribute("aria-current");
    this.shadowRoot.querySelector<HTMLElement>(".fallback")!.hidden = slotHasContent(this.shadowRoot, "trailing");
  }
}

export const NAVIGATION_LINK_TAG = "gk-navigation-link";
