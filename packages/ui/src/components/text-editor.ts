import { mountShadow } from "../base.js";
import { componentBaseCss, emit, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .editor {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }

  textarea {
    box-sizing: border-box;
    width: 100%;
    min-height: 92px;
    padding: 9px 11px;
    resize: vertical;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    font: inherit;
    font-size: var(--gk-font-size-sm);
    line-height: 1.55;
  }

  textarea::placeholder { color: var(--gk-color-text-dim); }
  textarea:focus-visible { border-color: var(--gk-color-accent); outline: 2px solid var(--gk-color-accent-fill); outline-offset: 1px; }

  .footer {
    display: flex;
    justify-content: flex-end;
    color: var(--gk-color-text-dim);
    font-size: 10px;
    font-variant-numeric: tabular-nums;
  }
`;

const html = `
  <label class="editor" part="editor">
    <span class="label" part="label"></span>
    <textarea part="input" spellcheck="true"></textarea>
    <span class="footer"><span class="count"></span><span class="limit"></span></span>
  </label>`;

export class TextEditor extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "value", "placeholder", "rows", "max-length", "disabled"];
  }

  #input: HTMLTextAreaElement | null = null;

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    this.setAttribute("value", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#input = this.shadowRoot!.querySelector<HTMLTextAreaElement>("textarea");
      this.#input!.addEventListener("input", this.#onInput);
      this.#input!.addEventListener("change", this.#onChange);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onInput = (): void => {
    const value = this.#input?.value ?? "";
    this.setAttribute("value", value);
    this.#updateCount();
    emit(this, "gk-input", { value, source: this });
  };

  #onChange = (): void => {
    emit(this, "gk-change", { value: this.#input?.value ?? "", source: this });
  };

  #updateCount(): void {
    if (!this.shadowRoot || !this.#input) return;
    const max = toNumber(this.getAttribute("max-length"), 0);
    this.shadowRoot.querySelector<HTMLElement>(".count")!.textContent = `${this.#input.value.length}`;
    this.shadowRoot.querySelector<HTMLElement>(".limit")!.textContent = max > 0 ? ` / ${max}` : "";
  }

  #sync(): void {
    if (!this.shadowRoot || !this.#input) return;
    const value = this.value;
    if (this.#input.value !== value) this.#input.value = value;
    const rows = Math.max(toNumber(this.getAttribute("rows"), 4), 2);
    this.#input.rows = rows;
    this.#input.placeholder = this.getAttribute("placeholder") ?? "";
    this.#input.disabled = this.hasAttribute("disabled");
    const max = toNumber(this.getAttribute("max-length"), 0);
    if (max > 0) this.#input.maxLength = max;
    else this.#input.removeAttribute("maxlength");
    this.shadowRoot.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Notes";
    this.#updateCount();
  }
}

export const TEXT_EDITOR_TAG = "gk-text-editor";
