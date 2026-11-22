import { mountShadow } from "../base.js";

const styles = `
:host { display: block; }

.wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  color: var(--gk-color-text-muted);
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-xs);
  font-weight: var(--gk-font-weight-medium);
}

input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--gk-color-hairline);
  border-radius: var(--gk-radius-sm);
  background: var(--gk-color-card);
  color: var(--gk-color-text);
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-md);
  padding: 9px 11px;
  outline: none;
  transition:
    border-color var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    box-shadow var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

input::placeholder { color: var(--gk-color-text-dim); }

input:hover:not(:disabled) { background: var(--gk-color-card-hover); }

input:focus {
  border-color: var(--gk-color-accent-stroke);
  box-shadow: 0 0 0 3px var(--gk-color-accent-fill);
}

input:disabled { opacity: 0.45; cursor: default; }
`;

export class TextField extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "placeholder", "value", "disabled", "type"];
  }

  #input: HTMLInputElement | null = null;

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const html = `
        <div class="wrap">
          <span class="label"></span>
          <input type="text" />
        </div>`;
      mountShadow(this, html, styles);
      this.#input = this.shadowRoot!.querySelector("input");
      this.#input!.addEventListener("input", () => {
        this.setAttribute("value", this.#input!.value);
        this.#emit("gk-input");
      });
      this.#input!.addEventListener("change", () => this.#emit("gk-change"));
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #emit(name: string): void {
    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  }

  #sync(): void {
    if (!this.#input) return;
    this.#input.type = this.getAttribute("type") ?? "text";
    this.#input.placeholder = this.getAttribute("placeholder") ?? "";
    this.#input.disabled = this.hasAttribute("disabled");
    if (this.#input.value !== this.value) this.#input.value = this.value;
    const label = this.shadowRoot!.querySelector(".label")!;
    label.textContent = this.getAttribute("label") ?? "";
    if (label.textContent) this.#input.setAttribute("aria-label", label.textContent);
  }
}

export const TEXT_FIELD_TAG = "gk-text-field";
