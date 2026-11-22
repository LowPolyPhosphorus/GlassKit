import { mountShadow } from "../base.js";

const styles = `
:host {
  display: block;
  --gk-slider-progress: 50%;
}

.wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.track {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: var(--gk-color-hairline);
}

.fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--gk-slider-progress);
  border-radius: inherit;
  background: var(--gk-color-accent);
  pointer-events: none;
}

input {
  position: absolute;
  inset: -9px 0;
  width: 100%;
  height: 24px;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input::-webkit-slider-runnable-track {
  height: 6px;
  background: transparent;
  border: 0;
}

input::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -6px;
  border: 1px solid var(--gk-color-hairline);
  border-radius: 50%;
  background: var(--gk-color-card);
  box-shadow: 0 1px 5px var(--gk-color-shadow);
  transition: transform var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

input:hover::-webkit-slider-thumb { transform: scale(1.08); }
input:active::-webkit-slider-thumb { transform: scale(1.14); background: var(--gk-color-accent); }

input::-moz-range-track {
  height: 6px;
  background: transparent;
  border: 0;
}

input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 1px solid var(--gk-color-hairline);
  border-radius: 50%;
  background: var(--gk-color-card);
  box-shadow: 0 1px 5px var(--gk-color-shadow);
  transition: transform var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

input:hover::-moz-range-thumb { transform: scale(1.08); }
input:active::-moz-range-thumb { transform: scale(1.14); background: var(--gk-color-accent); }

input:disabled { opacity: 0.45; cursor: default; }
input:disabled::-webkit-slider-thumb { transform: none; }
input:disabled::-moz-range-thumb { transform: none; }
input:focus-visible { outline: none; }
input:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 3px var(--gk-color-accent-fill), 0 0 0 1px var(--gk-color-accent); }
input:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 3px var(--gk-color-accent-fill), 0 0 0 1px var(--gk-color-accent); }
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
          <div class="track"><div class="fill"></div><input type="range" /></div>
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
    const min = this.min;
    const max = Math.max(this.max, min);
    const value = Math.min(Math.max(this.value, min), max);
    const step = Number(this.getAttribute("step") ?? 1);

    this.#input.min = String(min);
    this.#input.max = String(max);
    this.#input.step = String(step);
    this.#input.disabled = this.hasAttribute("disabled");
    if (Number(this.#input.value) !== value) this.#input.value = String(value);

    const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
    this.style.setProperty("--gk-slider-progress", `${progress}%`);

    const label = this.getAttribute("label") ?? "";
    const unit = this.getAttribute("unit") ?? "";
    this.shadowRoot!.querySelector(".label")!.textContent = label;
    this.shadowRoot!.querySelector(".value")!.textContent = `${value}${unit}`;
    this.#input.setAttribute("aria-label", label || "Slider");
    this.#input.setAttribute("aria-valuetext", `${value}${unit}`);
  }
}

export const SLIDER_TAG = "gk-slider";
