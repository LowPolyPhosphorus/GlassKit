import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    width: 100%;
    min-height: 32px;
    padding: 5px 9px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    cursor: pointer;
    font: inherit;
    font-size: var(--gk-font-size-xs);
    text-align: left;
  }
  .row:hover { background: var(--gk-color-card-hover); }
  .spacer { flex: 1; }
  .check {
    display: grid;
    place-items: center;
    width: 16px;
    height: 16px;
    flex: none;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-xs);
    background: var(--gk-color-glass-thin);
    color: transparent;
    font-size: 10px;
  }
  .row[aria-checked="true"] .check { border-color: var(--gk-color-accent); background: var(--gk-color-accent-fill); color: var(--gk-color-text); }
  :host([position="trailing"]) .check { order: 3; }
  :host([position="trailing"]) .spacer { order: 2; }
`;

const html = `
  <button type="button" class="row" part="row" role="checkbox">
    <span class="check" part="check" aria-hidden="true">✓</span>
    <span class="title" part="title"></span>
    <span class="spacer" aria-hidden="true"></span>
  </button>`;

export class CheckRow extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "checked", "position"];
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".row")!.addEventListener("click", this.#onClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (): void => {
    const checked = !this.checked;
    if (checked) this.setAttribute("checked", "");
    else this.removeAttribute("checked");
    emit(this, "gk-check", { checked, label: this.getAttribute("label") ?? "", source: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("label") ?? "Checklist row";
    root.querySelector<HTMLButtonElement>(".row")!.setAttribute("aria-checked", String(this.checked));
  }
}

export const CHECK_ROW_TAG = "gk-check-row";
