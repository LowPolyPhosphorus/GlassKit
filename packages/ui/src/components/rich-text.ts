import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .text {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    padding: 8px 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }
  .copy {
    flex: none;
    min-height: 22px;
    padding: 2px 7px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: 10px;
  }
  .copy:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }

  .content { min-width: 0; color: var(--gk-color-text); }
  :host([scale="caption"]) .content { font-size: 10px; }
  :host([scale="body"]) .content { font-size: var(--gk-font-size-sm); }
  :host([scale="title"]) .content { font-size: var(--gk-font-size-lg); }
  :host([scale="large-title"]) .content { font-size: var(--gk-font-size-xl); }
  :host([weight="medium"]) .content { font-weight: var(--gk-font-weight-medium); }
  :host([weight="semibold"]) .content { font-weight: var(--gk-font-weight-semibold); }
  :host([weight="bold"]) .content { font-weight: 700; }
  :host([italic]) .content { font-style: italic; }
  :host([color="muted"]) .content { color: var(--gk-color-text-muted); }
  :host([color="dim"]) .content { color: var(--gk-color-text-dim); }
`;

const html = `
  <div class="text" part="text">
    <span class="content" part="content"></span>
    <button type="button" class="copy" part="copy">Copy</button>
  </div>`;

export class RichText extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["text", "scale", "weight", "italic", "color"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".copy")!.addEventListener("click", this.#onCopy);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onCopy = (): void => {
    const text = this.getAttribute("text") ?? "";
    void navigator.clipboard?.writeText?.(text).catch(() => undefined);
    const button = this.shadowRoot?.querySelector<HTMLButtonElement>(".copy");
    if (button) {
      button.textContent = "Copied";
      window.setTimeout(() => { button.textContent = "Copy"; }, 900);
    }
    emit(this, "gk-text-copy", { text, host: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelector<HTMLElement>(".content")!.textContent = this.getAttribute("text") ?? "";
  }
}

export const RICH_TEXT_TAG = "gk-rich-text";
