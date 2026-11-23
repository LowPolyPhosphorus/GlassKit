import { mountShadow } from "../base.js";
import { clamp, emit, toNumber } from "../shared.js";

const styles = `
:host {
  display: block;
  --gk-slider-progress: 50%;
}

.wrap { display: grid; gap: 8px; }

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--gk-space-2);
}

.label,
.value {
  color: var(--gk-color-text-muted);
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-xs);
}

.value {
  color: var(--gk-color-text);
  font-variant-numeric: tabular-nums;
}

.linear { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 9px; }

.end-icon {
  min-width: 14px;
  color: var(--gk-color-text-dim);
  font-size: 11px;
  text-align: center;
}

.track-wrap { position: relative; min-width: 0; padding-block: 9px; }

.track {
  position: relative;
  height: 5px;
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

.ticks {
  position: absolute;
  inset: auto 0 -5px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.ticks i {
  width: 1px;
  height: 4px;
  background: var(--gk-color-hairline);
}

input[type="range"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-runnable-track {
  height: 5px;
  border: 0;
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 12px;
  margin-top: -3.5px;
  border: 1px solid var(--gk-color-accent-stroke);
  border-radius: 999px;
  background: var(--gk-color-card);
  box-shadow: 0 1px 4px var(--gk-color-shadow);
  transition: transform var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

input[type="range"]::-moz-range-track {
  height: 5px;
  border: 0;
  background: transparent;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 12px;
  border: 1px solid var(--gk-color-accent-stroke);
  border-radius: 999px;
  background: var(--gk-color-card);
  box-shadow: 0 1px 4px var(--gk-color-shadow);
}

input[type="range"]:hover::-webkit-slider-thumb { transform: scaleY(1.12); }
input[type="range"]:active::-webkit-slider-thumb { background: var(--gk-color-accent); }
input[type="range"]:hover::-moz-range-thumb { transform: scaleY(1.12); }
input[type="range"]:active::-moz-range-thumb { background: var(--gk-color-accent); }
input[type="range"]:disabled { opacity: 0.45; cursor: default; }
input[type="range"]:focus-visible { outline: none; }
input[type="range"]:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px var(--gk-color-accent-fill), 0 0 0 1px var(--gk-color-accent);
}
input[type="range"]:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3px var(--gk-color-accent-fill), 0 0 0 1px var(--gk-color-accent);
}

.circular { position: relative; display: grid; place-items: center; width: 78px; height: 78px; margin-inline: auto; }
.circular svg { position: absolute; inset: 0; transform: rotate(-90deg); }
.circular circle { fill: none; stroke-width: 6; }
.circular .base { stroke: var(--gk-color-hairline); }
.circular .value { stroke: var(--gk-color-accent); stroke-linecap: round; stroke-dasharray: var(--gk-slider-circular) 100; }
.circular input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.circular-thumb {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 9px;
  height: 9px;
  margin: -4.5px;
  border-radius: 50%;
  background: var(--gk-color-accent);
  transform: rotate(var(--gk-slider-angle)) translateY(-33px);
  pointer-events: none;
}
`;

export class Slider extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "min", "max", "step", "value", "disabled", "unit", "variant", "ticks", "start-icon", "end-icon"];
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
    return toNumber(this.getAttribute("min"), 0);
  }

  get max(): number {
    return toNumber(this.getAttribute("max"), 100);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const html = `
        <div class="wrap">
          <div class="head"><span class="label"></span><span class="value"></span></div>
          <div class="linear">
            <span class="start-icon"></span>
            <div class="track-wrap">
              <div class="track"><div class="fill"></div><div class="ticks"></div></div>
              <input type="range" />
            </div>
            <span class="end-icon"></span>
          </div>
          <div class="circular" hidden>
            <svg viewBox="0 0 78 78" aria-hidden="true">
              <circle class="base" cx="39" cy="39" r="33" pathLength="100"></circle>
              <circle class="value" cx="39" cy="39" r="33" pathLength="100"></circle>
            </svg>
            <span class="circular-thumb"></span>
            <input type="range" />
          </div>
        </div>`;
      mountShadow(this, html, styles);
      const inputs = this.shadowRoot!.querySelectorAll<HTMLInputElement>("input[type='range']");
      this.#input = inputs[0] ?? null;
      for (const input of inputs) {
        input.addEventListener("input", () => {
          this.value = Number(input.value);
          emit(this, "gk-input", { value: this.value });
        });
        input.addEventListener("change", () => emit(this, "gk-change", { value: this.value }));
      }
      const ticks = this.shadowRoot!.querySelector(".ticks")!;
      ticks.innerHTML = Array.from({ length: 11 }, () => "<i></i>").join("");
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.#input) return;
    const min = this.min;
    const max = Math.max(this.max, min);
    const value = clamp(this.value, min, max);
    const step = toNumber(this.getAttribute("step"), 1);
    const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
    const circular = this.getAttribute("variant") === "circular";

    for (const input of this.shadowRoot!.querySelectorAll<HTMLInputElement>("input[type='range']")) {
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.disabled = this.hasAttribute("disabled");
      if (Number(input.value) !== value) input.value = String(value);
    }

    this.style.setProperty("--gk-slider-progress", `${progress}%`);
    this.style.setProperty("--gk-slider-circular", String(progress));
    this.style.setProperty("--gk-slider-angle", `${(progress / 100) * 360}deg`);
    this.shadowRoot!.querySelector(".linear")!.toggleAttribute("hidden", circular);
    this.shadowRoot!.querySelector(".circular")!.toggleAttribute("hidden", !circular);
    this.shadowRoot!.querySelector(".ticks")!.toggleAttribute("hidden", !this.hasAttribute("ticks") || circular);
    this.shadowRoot!.querySelector(".start-icon")!.textContent = this.getAttribute("start-icon") ?? "";
    this.shadowRoot!.querySelector(".end-icon")!.textContent = this.getAttribute("end-icon") ?? "";

    const label = this.getAttribute("label") ?? "";
    const unit = this.getAttribute("unit") ?? "";
    this.shadowRoot!.querySelector(".label")!.textContent = label;
    this.shadowRoot!.querySelector(".value")!.textContent = `${value}${unit}`;
    for (const input of this.shadowRoot!.querySelectorAll("input")) {
      input.setAttribute("aria-label", label || "Slider");
      input.setAttribute("aria-valuetext", `${value}${unit}`);
    }
  }
}

export const SLIDER_TAG = "gk-slider";
