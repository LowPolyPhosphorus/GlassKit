import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseList } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .field {
    display: flex;
    align-items: center;
    gap: var(--gk-space-2);
    min-height: 34px;
    padding: 0 9px;
    background: var(--gk-color-card);
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    transition: border-color var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
  }

  .field:hover { background: var(--gk-color-card-hover); }

  .field:focus-within {
    border-color: var(--gk-color-accent-stroke);
    box-shadow: 0 0 0 3px var(--gk-color-accent-fill);
  }

  .magnifier {
    position: relative;
    flex: 0 0 12px;
    height: 12px;
  }

  .lens {
    position: absolute;
    inset: 0 3px 3px 0;
    border: 1.5px solid var(--gk-color-text-muted);
    border-radius: 50%;
  }

  .handle {
    position: absolute;
    right: 0;
    bottom: 1px;
    width: 5px;
    height: 1.5px;
    background: var(--gk-color-text-muted);
    transform: rotate(45deg);
  }

  input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
    appearance: none;
  }

  input::placeholder { color: var(--gk-color-text-dim); }
  input::-webkit-search-cancel-button { display: none; }
  input:disabled { cursor: default; opacity: 0.5; }

  .clear {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--gk-color-card-hover);
    color: var(--gk-color-text-muted);
    cursor: pointer;
  }

  .clear[hidden] { display: none; }

  .scopes {
    display: flex;
    gap: 2px;
    padding-left: var(--gk-space-2);
    border-left: 1px solid var(--gk-color-hairline);
  }

  .scopes:empty { display: none; }

  .scope {
    padding: 3px 7px;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    cursor: pointer;
  }

  .scope[aria-pressed="true"] {
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-accent);
  }
`;

const html = `
  <div class="field" part="field">
    <span class="magnifier" aria-hidden="true"><span class="lens"></span><span class="handle"></span></span>
    <input type="search" part="input" />
    <button type="button" class="clear" part="clear" aria-label="Clear search" hidden>×</button>
    <div class="scopes" role="group" aria-label="Search scope"></div>
  </div>`;

export class SearchField extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "placeholder", "value", "disabled", "scopes", "scope"];
  }

  #input: HTMLInputElement | null = null;
  #clear: HTMLButtonElement | null = null;
  #scopes: HTMLElement | null = null;

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#input = this.shadowRoot!.querySelector<HTMLInputElement>("input");
      this.#clear = this.shadowRoot!.querySelector<HTMLButtonElement>(".clear");
      this.#scopes = this.shadowRoot!.querySelector<HTMLElement>(".scopes");
      this.#input!.addEventListener("input", this.#onInput);
      this.#input!.addEventListener("change", () => emit(this, "gk-change", { value: this.value }));
      this.#clear!.addEventListener("click", this.#onClear);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onInput = (): void => {
    this.value = this.#input!.value;
    emit(this, "gk-input", { value: this.value });
  };

  #onClear = (): void => {
    this.value = "";
    this.#input?.focus();
    emit(this, "gk-clear", { value: "" });
    emit(this, "gk-input", { value: "" });
  };

  #sync(): void {
    if (!this.#input || !this.#clear || !this.#scopes) return;
    const label = this.getAttribute("label") ?? this.getAttribute("placeholder") ?? "Search";
    this.#input.placeholder = this.getAttribute("placeholder") ?? "";
    this.#input.disabled = this.hasAttribute("disabled");
    this.#input.setAttribute("aria-label", label);
    if (this.#input.value !== this.value) this.#input.value = this.value;
    this.#clear.hidden = this.#input.disabled || this.value.length === 0;
    this.#renderScopes();
  }

  #renderScopes(): void {
    if (!this.#scopes) return;
    const scopes = parseList(this.getAttribute("scopes"));
    const active = this.getAttribute("scope") ?? scopes[0] ?? "";
    this.#scopes.replaceChildren();
    for (const scope of scopes) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scope";
      button.textContent = scope;
      button.dataset.scope = scope;
      button.setAttribute("aria-pressed", String(scope === active));
      button.addEventListener("click", () => {
        this.setAttribute("scope", scope);
        emit(this, "gk-scope-change", { scope });
      });
      this.#scopes.append(button);
    }
  }
}

export const SEARCH_FIELD_TAG = "gk-search-field";
