import { mountShadow } from "../base.js";

const styles = `
:host { display: block; }

.wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--gk-space-2);
}

.label, .value {
  color: var(--gk-color-text-muted);
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-xs);
}

.value {
  color: var(--gk-color-text);
  font-variant-numeric: tabular-nums;
}

input {
  width: 100%;
  margin: 0;
  accent-color: var(--gk-color-accent);
  cursor: pointer;
}

input:disabled { opacity: 0.45; cursor: default; }
input:focus-visible { outline: 2px solid var(--gk-color-accent); outline-offset: 4px; }
`;

export class Slider extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "min", "max", "step", "value", "disabled", "unit"];
  }

  #input: HTMLInputElement | null = null;

  get value(): number {
    const parsed = Number(this.getAttribute("value"));
    return Number.isFinite(parsed) ? parsed : this.min;
  }

  set value(value: number) {
    this.setAttribute("value", String(value));
  }

  get min(): number {
    return Number(this.getAttribute("min") ?? 0);
  }

  get max(): number {
    return Number(this.getAttribute("max") ?? 100);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const html = `
        <div class="wrap">
          <div class="head"><span class="label"></span><span class="value"></span></div>
          <input type="range" />
        </div>`;
      mountShadow(this, html, styles);
      this.#input = this.shadowRoot!.querySelector("input");
      this.#input!.addEventListener("input", () => {
        this.value = Number(this.#input!.value);
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
    this.#input.min = String(this.min);
    this.#input.max = String(this.max);
    const step = Number(this.getAttribute("step") ?? 1);
    this.#input.step = String(step);
    this.#input.disabled = this.hasAttribute("disabled");
    if (Number(this.#input.value) !== this.value) this.#input.value = String(this.value);
    this.shadowRoot!.querySelector(".label")!.textContent = this.getAttribute("label") ?? "";
    this.shadowRoot!.querySelector(".value")!.textContent =
      `${this.value}${this.getAttribute("unit") ?? ""}`;
    this.#input.setAttribute("aria-label", this.getAttribute("label") ?? "Slider");
  }
}

export const SLIDER_TAG = "gk-slider";
