import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .field {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }

  .control {
    display: flex;
    align-items: stretch;
    overflow: hidden;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
  }

  .control:focus-within {
    border-color: var(--gk-color-accent);
    box-shadow: 0 0 0 2px var(--gk-color-accent-fill);
  }

  :host([invalid]) .control { border-color: var(--gk-color-danger); }

  input {
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    padding: 7px 9px;
    border: 0;
    background: transparent;
    color: var(--gk-color-text);
    font: inherit;
    font-size: var(--gk-font-size-sm);
  }

  input:focus-visible { outline: none; }
  input::placeholder { color: var(--gk-color-text-dim); }

  button {
    flex: none;
    padding: 0 10px;
    border: 0;
    border-left: 1px solid var(--gk-color-hairline);
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-accent);
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }

  button:hover { background: var(--gk-color-accent-fill); }
  button:disabled, input:disabled { opacity: 0.42; cursor: default; }

  .caption {
    color: var(--gk-color-text-dim);
    font-size: var(--gk-font-size-xs);
  }
  :host([invalid]) .caption { color: var(--gk-color-danger); }
  .caption:empty { display: none; }
`;

const html = `
  <label class="field" part="field">
    <span class="label" part="label"></span>
    <span class="control" part="control">
      <input class="input" part="input" type="password" spellcheck="false" />
      <button type="button" class="reveal" part="reveal"></button>
    </span>
    <span class="caption" part="caption"></span>
  </label>`;

export class SecureField extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "value", "placeholder", "caption", "reveal", "disabled", "invalid", "autocomplete"];
  }

  #input: HTMLInputElement | null = null;
  #reveal: HTMLButtonElement | null = null;

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    this.setAttribute("value", next);
  }

  get revealed(): boolean {
    return this.hasAttribute("reveal");
  }

  set revealed(next: boolean) {
    this.toggleAttribute("reveal", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#input = this.shadowRoot!.querySelector<HTMLInputElement>(".input");
      this.#reveal = this.shadowRoot!.querySelector<HTMLButtonElement>(".reveal");
      this.#input!.addEventListener("input", this.#onInput);
      this.#input!.addEventListener("change", this.#onChange);
      this.#reveal!.addEventListener("click", this.#onReveal);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onInput = (): void => {
    const value = this.#input?.value ?? "";
    this.value = value;
    emit(this, "gk-input", { value, source: this });
  };

  #onChange = (): void => {
    emit(this, "gk-change", { value: this.#input?.value ?? "", source: this });
  };

  #onReveal = (): void => {
    this.revealed = !this.revealed;
    emit(this, "gk-reveal-change", { revealed: this.revealed, source: this });
  };

  #sync(): void {
    if (!this.shadowRoot || !this.#input || !this.#reveal) return;
    const root = this.shadowRoot;
    const value = this.value;
    const disabled = this.hasAttribute("disabled");

    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Password";
    root.querySelector<HTMLElement>(".caption")!.textContent = this.getAttribute("caption") ?? "";
    this.#input.type = this.revealed ? "text" : "password";
    if (this.#input.value !== value) this.#input.value = value;
    this.#input.placeholder = this.getAttribute("placeholder") ?? "";
    this.#input.disabled = disabled;
    this.#input.setAttribute("aria-invalid", String(this.hasAttribute("invalid")));
    const autocomplete = this.getAttribute("autocomplete");
    if (autocomplete) this.#input.setAttribute("autocomplete", autocomplete);
    else this.#input.setAttribute("autocomplete", "off");

    this.#reveal.textContent = this.revealed ? "Hide" : "Show";
    this.#reveal.setAttribute("aria-label", `${this.revealed ? "Hide" : "Show"} ${this.getAttribute("label") ?? "password"}`);
    this.#reveal.disabled = disabled;
  }
}

export const SECURE_FIELD_TAG = "gk-secure-field";
