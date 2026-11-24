import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; min-width: 0; }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 32px;
    padding: 5px 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    cursor: pointer;
    font: inherit;
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }
  .button:hover { background: var(--gk-color-card-hover); }
  .button:disabled { cursor: not-allowed; opacity: 0.5; }

  :host([variant="filled"]) .button { border-color: var(--gk-color-accent); background: var(--gk-color-accent-fill); }
  :host([variant="plain"]) .button { border-color: transparent; background: transparent; color: var(--gk-color-accent); }
  :host([variant="destructive"]) .button { border-color: var(--gk-color-danger); color: var(--gk-color-danger); }
  .glyph { font-size: 12px; }
  .glyph:empty { display: none; }
`;

const html = `
  <button type="button" class="button" part="button">
    <span class="glyph" part="glyph" aria-hidden="true"></span>
    <span class="title" part="title"></span>
  </button>`;

export class PushButton extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "glyph", "variant", "disabled"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".button")!.addEventListener("click", this.#onClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (): void => {
    if (this.hasAttribute("disabled")) return;
    emit(this, "gk-activate", {
      label: this.getAttribute("label") ?? "Button",
      variant: this.getAttribute("variant") ?? "bordered",
      source: this,
    });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("label") ?? "Button";
    root.querySelector<HTMLElement>(".glyph")!.textContent = this.getAttribute("glyph") ?? "";
    root.querySelector<HTMLButtonElement>(".button")!.disabled = this.hasAttribute("disabled");
  }
}

export const PUSH_BUTTON_TAG = "gk-push-button";
