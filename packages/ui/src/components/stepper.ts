import { mountShadow } from "../base.js";
import { componentBaseCss, emit, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-width: 0;
    padding: 6px 8px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
  }

  .copy { min-width: 0; }
  .label {
    display: block;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }

  .value {
    display: block;
    margin-top: 2px;
    font-size: var(--gk-font-size-lg);
    font-weight: var(--gk-font-weight-semibold);
    font-variant-numeric: tabular-nums;
  }

  .actions {
    display: flex;
    flex: none;
    overflow: hidden;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
  }

  button {
    display: grid;
    place-items: center;
    width: 32px;
    height: 30px;
    border: 0;
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-text);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
  }

  button + button { border-left: 1px solid var(--gk-color-hairline); }
  button:hover:not(:disabled) { background: var(--gk-color-accent-fill); color: var(--gk-color-accent); }
  button:disabled { opacity: 0.36; cursor: default; }
`;

const html = `
  <div class="stepper" part="stepper">
    <span class="copy"><span class="label" part="label"></span><span class="value" part="value-label"></span></span>
    <span class="actions">
      <button type="button" class="decrement" part="decrement" aria-label="Decrease">−</button>
      <button type="button" class="increment" part="increment" aria-label="Increase">+</button>
    </span>
  </div>`;

export class Stepper extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "value", "min", "max", "step", "unit", "disabled", "wrap"];
  }

  get value(): number {
    return toNumber(this.getAttribute("value"), this.min);
  }

  set value(next: number) {
    this.setAttribute("value", String(next));
  }

  get min(): number {
    return toNumber(this.getAttribute("min"), 0);
  }

  get max(): number {
    return toNumber(this.getAttribute("max"), 10);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".decrement")!.addEventListener("click", this.#onDecrement);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".increment")!.addEventListener("click", this.#onIncrement);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #commit(next: number, direction: "increment" | "decrement"): void {
    const step = Math.max(toNumber(this.getAttribute("step"), 1), Number.EPSILON);
    let value = Number((next + (direction === "increment" ? step : -step)).toFixed(6));
    const { min, max } = this;
    if (this.hasAttribute("wrap")) {
      if (value > max) value = min;
      if (value < min) value = max;
    } else {
      value = Math.min(max, Math.max(min, value));
    }
    this.value = value;
    emit(this, "gk-change", { value, direction, min, max, source: this });
  }

  #onDecrement = (): void => this.#commit(this.value, "decrement");
  #onIncrement = (): void => this.#commit(this.value, "increment");

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const label = this.getAttribute("label") ?? "Value";
    const unit = this.getAttribute("unit") ?? "";
    const disabled = this.hasAttribute("disabled");
    const value = Math.min(this.max, Math.max(this.min, this.value));

    root.querySelector<HTMLElement>(".label")!.textContent = label;
    root.querySelector<HTMLElement>(".value")!.textContent = `${value}${unit}`;
    root.querySelector<HTMLButtonElement>(".decrement")!.setAttribute("aria-label", `Decrease ${label}`);
    root.querySelector<HTMLButtonElement>(".increment")!.setAttribute("aria-label", `Increase ${label}`);
    for (const button of root.querySelectorAll<HTMLButtonElement>("button")) {
      button.disabled = disabled;
    }
    root.querySelector<HTMLButtonElement>(".decrement")!.disabled ||= value <= this.min && !this.hasAttribute("wrap");
    root.querySelector<HTMLButtonElement>(".increment")!.disabled ||= value >= this.max && !this.hasAttribute("wrap");
  }
}

export const STEPPER_TAG = "gk-stepper-control";
