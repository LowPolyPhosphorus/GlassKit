import { mountShadow } from "../base.js";
import { emit } from "../shared.js";

const styles = `
:host { display: block; }

.wrap { display: grid; gap: 6px; }

.label,
.caption {
  color: var(--gk-color-text-muted);
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-xs);
}

.label { font-weight: var(--gk-font-weight-medium); }
.caption { color: var(--gk-color-text-dim); }
.caption.is-invalid { color: var(--gk-color-danger); }

.shell {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 9px;
  border: 1px solid var(--gk-color-hairline);
  border-radius: 7px;
  background: var(--gk-color-card);
  transition:
    border-color var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    box-shadow var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

.shell:hover:not(.is-disabled) { background: var(--gk-color-card-hover); }

.shell:focus-within {
  border-color: var(--gk-color-accent-stroke);
  box-shadow: 0 0 0 3px var(--gk-color-accent-fill);
}

.shell.is-invalid { border-color: var(--gk-color-danger); }

.shell.is-disabled { opacity: 0.45; }

input {
  flex: 1;
  min-width: 0;
  padding: 7px 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--gk-color-text);
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-md);
  line-height: 20px;
}

input::placeholder { color: var(--gk-color-text-dim); }

.leading,
.trailing {
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(--gk-color-text-muted);
  font-size: var(--gk-font-size-sm);
}

.clear {
  display: grid;
  place-items: center;
  flex: none;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--gk-color-text-dim);
  color: var(--gk-color-card);
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
}

.clear::before { content: "×"; }
`;

export class TextField extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "placeholder", "value", "disabled", "type", "clearable", "caption", "invalid", "name"];
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
          <div class="shell">
            <span class="leading"><slot name="leading"></slot></span>
            <input type="text" />
            <button type="button" class="clear" aria-label="Clear text"></button>
            <span class="trailing"><slot name="trailing"></slot></span>
          </div>
          <span class="caption" id="caption"></span>
        </div>`;
      mountShadow(this, html, styles);
      this.#input = this.shadowRoot!.querySelector("input");
      this.#input!.addEventListener("input", () => {
        this.setAttribute("value", this.#input!.value);
        emit(this, "gk-input", { value: this.value });
      });
      this.#input!.addEventListener("change", () => emit(this, "gk-change", { value: this.value }));
      this.shadowRoot!.querySelector(".clear")!.addEventListener("click", () => {
        this.value = "";
        this.#input!.focus();
        emit(this, "gk-input", { value: "" });
        emit(this, "gk-change", { value: "" });
      });
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.#input) return;
    this.#input.type = this.getAttribute("type") ?? "text";
    this.#input.placeholder = this.getAttribute("placeholder") ?? "";
    this.#input.disabled = this.hasAttribute("disabled");
    this.#input.name = this.getAttribute("name") ?? "";
    if (this.#input.value !== this.value) this.#input.value = this.value;

    const label = this.getAttribute("label") ?? "";
    const caption = this.getAttribute("caption") ?? "";
    const invalid = this.hasAttribute("invalid");
    const clearable = this.hasAttribute("clearable") && this.value.length > 0 && !this.#input.disabled;

    this.shadowRoot!.querySelector(".label")!.textContent = label;
    const captionEl = this.shadowRoot!.querySelector(".caption")!;
    captionEl.textContent = caption;
    captionEl.classList.toggle("is-invalid", invalid);
    captionEl.toggleAttribute("hidden", !caption);
    this.shadowRoot!.querySelector(".shell")!.classList.toggle("is-invalid", invalid);
    this.shadowRoot!.querySelector(".shell")!.classList.toggle("is-disabled", this.#input.disabled);
    this.shadowRoot!.querySelector(".clear")!.toggleAttribute("hidden", !clearable);
    this.shadowRoot!.querySelector(".leading")!.toggleAttribute("hidden", !this.querySelector(":scope > [slot='leading']"));
    this.shadowRoot!.querySelector(".trailing")!.toggleAttribute("hidden", !this.querySelector(":scope > [slot='trailing']"));
    if (label) this.#input.setAttribute("aria-label", label);
    if (caption) this.#input.setAttribute("aria-describedby", "caption");
    this.#input.setAttribute("aria-invalid", String(invalid));
  }
}

export const TEXT_FIELD_TAG = "gk-text-field";
