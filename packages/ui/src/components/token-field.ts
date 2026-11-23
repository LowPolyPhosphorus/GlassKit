import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseList } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .wrap { display: flex; flex-direction: column; gap: 6px; }

  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }

  .label:empty { display: none; }

  .field {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    min-height: 36px;
    padding: 5px 7px;
    background: var(--gk-color-card);
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    transition: border-color var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
  }

  .field:focus-within {
    border-color: var(--gk-color-accent-stroke);
    box-shadow: 0 0 0 3px var(--gk-color-accent-fill);
  }

  .tokens { display: contents; }

  .token {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 5px 3px 8px;
    border-radius: var(--gk-radius-pill);
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-accent);
    font-size: var(--gk-font-size-xs);
  }

  .remove {
    display: grid;
    place-items: center;
    width: 15px;
    height: 15px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .remove:hover { background: var(--gk-color-accent-stroke); }

  input {
    flex: 1;
    min-width: 90px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }

  input::placeholder { color: var(--gk-color-text-dim); }
`;

const html = `
  <div class="wrap">
    <span class="label" part="label"></span>
    <div class="field" part="field">
      <span class="tokens" role="list" part="tokens"></span>
      <input type="text" part="input" />
    </div>
  </div>`;

export class TokenField extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["tokens", "label", "placeholder", "disabled"];
  }

  #tokens: string[] = [];
  #draft = "";
  #list: HTMLElement | null = null;
  #input: HTMLInputElement | null = null;

  get tokens(): string[] {
    return [...this.#tokens];
  }

  set tokens(value: string[]) {
    this.setAttribute("tokens", JSON.stringify(value));
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#list = this.shadowRoot!.querySelector<HTMLElement>(".tokens");
      this.#input = this.shadowRoot!.querySelector<HTMLInputElement>("input");
      this.#input!.addEventListener("input", this.#onInput);
      this.#input!.addEventListener("keydown", this.#onKeydown);
      this.#input!.addEventListener("blur", () => this.#commitDraft());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onInput = (): void => {
    this.#draft = this.#input!.value;
    emit(this, "gk-input", { value: this.#draft });
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      this.#commitDraft();
    } else if (event.key === "Backspace" && !this.#draft && this.#tokens.length) {
      this.#remove(this.#tokens[this.#tokens.length - 1]);
    }
  };

  #commitDraft(): void {
    const token = this.#draft.trim().replace(/,$/, "").trim();
    if (!token) return;
    this.#draft = "";
    const tokens = [...this.#tokens];
    if (tokens.includes(token)) {
      this.#sync();
      return;
    }
    tokens.push(token);
    this.tokens = tokens;
    emit(this, "gk-token-add", { token, tokens: this.tokens });
    emit(this, "gk-token-change", { tokens: this.tokens });
  }

  #remove(token: string): void {
    this.tokens = this.#tokens.filter((item) => item !== token);
    emit(this, "gk-token-remove", { token, tokens: this.tokens });
    emit(this, "gk-token-change", { tokens: this.tokens });
  }

  #sync(): void {
    if (!this.#list || !this.#input || !this.shadowRoot) return;
    this.#tokens = parseList(this.getAttribute("tokens"));
    this.shadowRoot.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "";
    this.#input.placeholder = this.getAttribute("placeholder") ?? "";
    this.#input.disabled = this.hasAttribute("disabled");
    this.#input.value = this.#draft;
    this.#list.replaceChildren();

    for (const token of this.#tokens) {
      const chip = document.createElement("span");
      chip.className = "token";
      chip.setAttribute("role", "listitem");
      chip.append(document.createTextNode(token));

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove";
      remove.setAttribute("aria-label", `Remove ${token}`);
      remove.textContent = "×";
      remove.addEventListener("click", () => this.#remove(token));
      chip.append(remove);
      this.#list.append(chip);
    }
  }
}

export const TOKEN_FIELD_TAG = "gk-token-field";
