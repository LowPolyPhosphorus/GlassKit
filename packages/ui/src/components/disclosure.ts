import { mountShadow } from "../base.js";
import { componentBaseCss, emit, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .disclosure {
    background: var(--gk-color-card);
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    overflow: hidden;
  }

  .summary {
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--gk-space-2);
    width: 100%;
    padding: 10px 12px;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .summary:hover { background: var(--gk-color-card-hover); }

  .chevron {
    width: 6px;
    height: 6px;
    border-right: 1.5px solid var(--gk-color-text-muted);
    border-bottom: 1.5px solid var(--gk-color-text-muted);
    transform: rotate(-45deg);
    transition: transform var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
  }

  :host([open]) .chevron { transform: rotate(45deg); }

  .label { min-width: 0; font-weight: var(--gk-font-weight-medium); }
  .fallback:empty { display: none; }
  .meta { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }

  .content {
    padding: 0 12px 12px 30px;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-sm);
  }

  .content[hidden] { display: none; }
`;

const html = `
  <section class="disclosure" part="disclosure">
    <button type="button" class="summary" part="summary" aria-expanded="false">
      <span class="chevron" aria-hidden="true"></span>
      <span class="label">
        <span class="fallback"></span>
        <slot name="summary"></slot>
      </span>
      <span class="meta"><slot name="meta"></slot></span>
    </button>
    <div class="content" part="content" hidden><slot></slot></div>
  </section>`;

export class Disclosure extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["open", "label"];
  }

  #summary: HTMLButtonElement | null = null;
  #content: HTMLElement | null = null;

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean) {
    this.toggleAttribute("open", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#summary = this.shadowRoot!.querySelector<HTMLButtonElement>(".summary");
      this.#content = this.shadowRoot!.querySelector<HTMLElement>(".content");
      this.#summary!.addEventListener("click", this.#onClick);
      for (const name of ["summary", "meta"]) {
        this.shadowRoot!.querySelector(`slot[name="${name}"]`)!.addEventListener("slotchange", () => this.#sync());
      }
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (): void => {
    this.open = !this.open;
    emit(this, "gk-toggle", { open: this.open, source: this });
  };

  #sync(): void {
    if (!this.#summary || !this.#content || !this.shadowRoot) return;
    const open = this.open;
    this.#summary.setAttribute("aria-expanded", String(open));
    this.#content.hidden = !open;
    const hasSummary = slotHasContent(this.shadowRoot, "summary");
    this.#summary.querySelector<HTMLElement>(".fallback")!.textContent = hasSummary ? "" : this.getAttribute("label") ?? "";
  }
}

export const DISCLOSURE_TAG = "gk-disclosure";
