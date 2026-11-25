import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseList } from "../shared.js";

interface PickerOption {
  label: string;
  value: string;
  detail?: string;
  disabled?: boolean;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .picker {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }

  .options {
    display: grid;
    gap: 3px;
  }

  .option {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 6px 9px;
    border: 1px solid transparent;
    border-radius: var(--gk-radius-sm);
    cursor: pointer;
  }

  .option:hover { background: var(--gk-color-card-hover); }
  .option:has(input:checked) {
    border-color: var(--gk-color-accent-stroke);
    background: var(--gk-color-accent-fill);
  }
  .option:has(input:disabled) { opacity: 0.42; cursor: default; }
  .option:has(input:focus-visible) { outline: 2px solid var(--gk-color-accent); outline-offset: 1px; }

  input {
    width: 14px;
    height: 14px;
    margin: 0;
    accent-color: var(--gk-color-accent);
  }

  .copy { min-width: 0; }
  .name { display: block; font-size: var(--gk-font-size-sm); }
  .detail { display: block; margin-top: 2px; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
  .check { color: var(--gk-color-accent); font-size: 16px; opacity: 0; }
  .option:has(input:checked) .check { opacity: 1; }
`;

const html = `
  <div class="picker" part="picker">
    <span class="label" part="label"></span>
    <div class="options" part="options" role="radiogroup"></div>
  </div>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let nextId = 0;

export class ValuePicker extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "value", "options", "disabled"];
  }

  #name = `gk-value-picker-${++nextId}`;
  #renderedOptions = "";

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    this.setAttribute("value", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".options")!.addEventListener("change", this.#onChange);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #options(): PickerOption[] {
    const raw = this.getAttribute("options") ?? "";
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (typeof item === "string") return { label: item, value: item };
          const option = item as Partial<PickerOption>;
          return {
            label: String(option.label ?? option.value ?? ""),
            value: String(option.value ?? option.label ?? ""),
            detail: option.detail ? String(option.detail) : undefined,
            disabled: Boolean(option.disabled),
          };
        });
      }
    } catch {
      // Fall through to comma-separated options.
    }
    return parseList(raw).map((item) => ({ label: item, value: item }));
  }

  #onChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    if (!input.checked) return;
    this.value = input.value;
    emit(this, "gk-change", {
      value: input.value,
      label: input.dataset.label ?? input.value,
      source: this,
    });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const disabled = this.hasAttribute("disabled");
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Choose one";
    const options = this.#options();
    const container = root.querySelector<HTMLElement>(".options")!;
    const signature = JSON.stringify(options);
    const inputs = [...container.querySelectorAll<HTMLInputElement>("input[type=radio]")];
    if (signature === this.#renderedOptions && inputs.length === options.length) {
      inputs.forEach((input, index) => {
        input.checked = options[index]!.value === this.value;
        input.disabled = disabled || Boolean(options[index]!.disabled);
      });
      return;
    }
    this.#renderedOptions = signature;
    container.innerHTML = options
      .map((option, index) => {
        const checked = option.value === this.value ? "checked" : "";
        const detail = option.detail ? `<span class="detail">${esc(option.detail)}</span>` : "";
        return `<label class="option">
          <input type="radio" name="${this.#name}" value="${esc(option.value)}" data-label="${esc(option.label)}" ${checked} ${disabled || option.disabled ? "disabled" : ""} aria-label="${esc(option.label)}" />
          <span class="copy"><span class="name">${esc(option.label)}</span>${detail}</span>
          <span class="check" aria-hidden="true">✓</span>
          <span hidden>${index}</span>
        </label>`;
      })
      .join("");
  }
}

export const VALUE_PICKER_TAG = "gk-value-picker";
