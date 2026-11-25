import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseList } from "../shared.js";

const DEFAULT_COLOR = "#0a84ff";

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .picker {
    display: grid;
    gap: 8px;
    min-width: 0;
  }

  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }

  .control {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  input[type="color"] {
    width: 38px;
    height: 32px;
    padding: 2px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    cursor: pointer;
  }

  input[type="text"] {
    box-sizing: border-box;
    width: 88px;
    padding: 7px 9px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    font: inherit;
    font-size: var(--gk-font-size-sm);
    font-variant-numeric: tabular-nums;
  }

  input:focus-visible {
    border-color: var(--gk-color-accent);
    outline: 2px solid var(--gk-color-accent-fill);
    outline-offset: 1px;
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .swatch {
    width: 22px;
    height: 22px;
    padding: 0;
    border: 1px solid var(--gk-color-hairline);
    border-radius: 50%;
    background: var(--swatch);
    cursor: pointer;
  }

  .swatch[aria-pressed="true"] {
    border-color: var(--gk-color-accent);
    box-shadow: 0 0 0 2px var(--gk-color-accent-fill);
  }

  .swatches:empty,
  .control[hidden] { display: none; }
`;

const html = `
  <div class="picker" part="picker">
    <span class="label" part="label"></span>
    <div class="control" part="control">
      <input type="color" class="native" aria-label="Pick color" />
      <input type="text" class="hex" spellcheck="false" maxlength="7" aria-label="Hex color" />
    </div>
    <div class="swatches" part="swatches" role="group" aria-label="Suggested colors"></div>
  </div>`;

function normalizeColor(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  const short = /^#?([0-9a-f]{3})$/i.exec(raw);
  if (short) {
    const [, hex] = short;
    return `#${hex![0]}${hex![0]}${hex![1]}${hex![1]}${hex![2]}${hex![2]}`.toLowerCase();
  }
  const full = /^#?([0-9a-f]{6})$/i.exec(raw);
  if (full) return `#${full[1]}`.toLowerCase();
  return DEFAULT_COLOR;
}

export class ColorPicker extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "value", "swatches", "disabled", "compact"];
  }

  #native: HTMLInputElement | null = null;
  #hex: HTMLInputElement | null = null;
  #renderedSwatches = "";

  get value(): string {
    return normalizeColor(this.getAttribute("value"));
  }

  set value(next: string) {
    this.setAttribute("value", normalizeColor(next));
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#native = this.shadowRoot!.querySelector<HTMLInputElement>(".native");
      this.#hex = this.shadowRoot!.querySelector<HTMLInputElement>(".hex");
      this.#native!.addEventListener("input", this.#onNativeInput);
      this.#hex!.addEventListener("input", this.#onHexInput);
      this.#hex!.addEventListener("change", this.#onHexChange);
      this.shadowRoot!.querySelector<HTMLElement>(".swatches")!.addEventListener("click", this.#onSwatchClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #commit(next: string, eventName: "gk-input" | "gk-change"): void {
    const normalized = normalizeColor(next);
    if (this.getAttribute("value") !== normalized) this.setAttribute("value", normalized);
    emit(this, eventName, { value: normalized, source: this });
  }

  #onNativeInput = (event: Event): void => {
    this.#commit((event.target as HTMLInputElement).value, "gk-input");
  };

  #onHexInput = (event: Event): void => {
    const value = (event.target as HTMLInputElement).value;
    if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())) this.#commit(value, "gk-input");
  };

  #onHexChange = (event: Event): void => {
    this.#commit((event.target as HTMLInputElement).value, "gk-change");
  };

  #onSwatchClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".swatch");
    if (!button || button.disabled) return;
    this.#commit(button.dataset.swatch ?? DEFAULT_COLOR, "gk-change");
  };

  #sync(): void {
    if (!this.shadowRoot || !this.#native || !this.#hex) return;
    const root = this.shadowRoot;
    const value = this.value;
    const disabled = this.hasAttribute("disabled");

    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Color";
    root.querySelector<HTMLElement>(".control")!.hidden = this.hasAttribute("compact");
    this.#native.value = value;
    this.#native.disabled = disabled;
    this.#hex.value = value;
    this.#hex.disabled = disabled;

    const swatches = parseList(this.getAttribute("swatches"));
    const container = root.querySelector<HTMLElement>(".swatches")!;
    const signature = JSON.stringify(swatches);
    const buttons = [...container.querySelectorAll<HTMLButtonElement>(".swatch")];
    if (signature === this.#renderedSwatches && buttons.length === swatches.length) {
      buttons.forEach((button, index) => {
        const swatch = normalizeColor(swatches[index]);
        button.setAttribute("aria-pressed", String(swatch === value));
        button.disabled = disabled;
      });
      return;
    }
    this.#renderedSwatches = signature;
    container.innerHTML = swatches
      .map((raw) => {
        const swatch = normalizeColor(raw);
        const selected = swatch === value ? "true" : "false";
        return `<button type="button" class="swatch" style="--swatch:${swatch}" data-swatch="${swatch}" aria-label="Use ${swatch}" aria-pressed="${selected}" ${disabled ? "disabled" : ""}></button>`;
      })
      .join("");
  }
}

export const COLOR_PICKER_TAG = "gk-color-picker";
