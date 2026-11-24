import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; min-width: 0; }

  .label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    padding: 6px 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
  }
  .label:hover { background: var(--gk-color-card-hover); }
  .glyph {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    flex: none;
    border-radius: var(--gk-radius-xs);
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-text);
    font-size: 11px;
  }
  .title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  :host([variant="title-only"]) .glyph { display: none; }
  :host([variant="icon-only"]) .title { display: none; }
  :host([variant="icon-only"]) .label { padding: 6px; }
`;

const html = `
  <button type="button" class="label" part="label">
    <span class="glyph" part="glyph" aria-hidden="true"></span>
    <span class="title" part="title"></span>
  </button>`;

export class IconLabel extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "glyph", "variant"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".label")!.addEventListener("click", this.#onClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (): void => {
    emit(this, "gk-activate", {
      label: this.getAttribute("label") ?? "",
      glyph: this.getAttribute("glyph") ?? "",
      host: this,
    });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const label = this.getAttribute("label") ?? "Label";
    root.querySelector<HTMLElement>(".title")!.textContent = label;
    root.querySelector<HTMLElement>(".glyph")!.textContent = this.getAttribute("glyph") ?? "★";
    root.querySelector<HTMLButtonElement>(".label")!.setAttribute(
      "aria-label",
      this.getAttribute("variant") === "icon-only" ? label : "",
    );
  }
}

export const ICON_LABEL_TAG = "gk-icon-label";
