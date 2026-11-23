import { mountShadow } from "../base.js";
import { clamp, emit, toNumber } from "../shared.js";

const styles = `
:host {
  display: block;
  --gk-slider-progress: 50%;
  --gk-slider-fraction: 0.5;
  --gk-slider-circular: 50;
  --gk-slider-angle: 180deg;
}

[hidden] { display: none !important; }

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

.track-wrap { position: relative; min-width: 0; padding-block: 12px; }

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
  transition: width var(--gk-motion-duration-fast) var(--gk-motion-ease-emphasized);
}

.ticks {
  position: absolute;
  inset: auto 0 -6px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.ticks i {
  width: 1px;
  height: 4px;
  background: var(--gk-color-soft-hairline, var(--gk-color-hairline));
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
  height: 100%;
  border: 0;
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 1px;
  height: 1px;
  margin-top: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  opacity: 0;
}

input[type="range"]::-moz-range-track {
  height: 100%;
  border: 0;
  background: transparent;
}

input[type="range"]::-moz-range-thumb {
  width: 1px;
  height: 1px;
  border: 0;
  border-radius: 0;
  background: transparent;
  opacity: 0;
}

input[type="range"]:disabled { cursor: default; }
input[type="range"]:focus-visible { outline: none; }

.thumb {
  position: absolute;
  top: 50%;
  left: calc(10px + (100% - 20px) * var(--gk-slider-fraction));
  width: 20px;
  height: 12px;
  border: 1px solid var(--gk-color-accent-stroke);
  border-radius: 999px;
  background: var(--gk-color-card);
  box-shadow: 0 1px 4px var(--gk-color-shadow);
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition:
    left var(--gk-motion-duration-fast) var(--gk-motion-ease-emphasized),
    transform var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

input[type="range"]:hover + .thumb { transform: translate(-50%, -50%) scaleY(1.12); }
input[type="range"]:active + .thumb { background: var(--gk-color-accent); }
input[type="range"]:focus-visible + .thumb {
  box-shadow: 0 0 0 3px var(--gk-color-accent-fill), 0 0 0 1px var(--gk-color-accent);
}
input[type="range"]:disabled + .thumb { opacity: 0.45; }

.circular { position: relative; display: grid; place-items: center; width: 84px; height: 84px; margin-inline: auto; }
.circular svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.circular circle { fill: none; stroke-width: 6; }
.circular .base { stroke: var(--gk-color-hairline); }
.circular .value {
  stroke: var(--gk-color-accent);
  stroke-linecap: round;
  stroke-dasharray: var(--gk-slider-circular) 100;
  transition: stroke-dasharray var(--gk-motion-duration-fast) var(--gk-motion-ease-emphasized);
}
.circular input { opacity: 0; }

.circular-thumb {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  margin: -5px;
  border: 1px solid var(--gk-color-accent-stroke);
  border-radius: 50%;
  background: var(--gk-color-card);
  pointer-events: none;
  transform: rotate(var(--gk-slider-angle)) translateY(-37px);
  transition:
    transform var(--gk-motion-duration-fast) var(--gk-motion-ease-emphasized),
    background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

.circular input:active + .circular-thumb { background: var(--gk-color-accent); }
.circular input:focus-visible + .circular-thumb {
  box-shadow: 0 0 0 3px var(--gk-color-accent-fill), 0 0 0 1px var(--gk-color-accent);
}
.circular input:disabled + .circular-thumb { opacity: 0.45; }

@media (prefers-reduced-motion: reduce) {
  .fill,
  .thumb,
  .circular .value,
  .circular-thumb {
    transition-duration: 1ms !important;
  }
}
`;

const linearMarkup = `
  <div class="linear">
    <span class="start-icon"></span>
    <div class="track-wrap">
      <div class="track"><div class="fill"></div><div class="ticks"></div></div>
      <input type="range" />
      <span class="thumb"></span>
    </div>
    <span class="end-icon"></span>
  </div>`;

const circularMarkup = `
  <div class="circular">
    <svg viewBox="0 0 84 84" aria-hidden="true">
      <circle class="base" cx="42" cy="42" r="37" pathLength="100"></circle>
      <circle class="value" cx="42" cy="42" r="37" pathLength="100"></circle>
    </svg>
    <input type="range" />
    <span class="circular-thumb"></span>
  </div>`;

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
    if (!this.shadowRoot) this.#render();
    this.#sync();
  }

  attributeChangedCallback(name: string): void {
    if (name === "variant" && this.shadowRoot) {
      const circular = this.getAttribute("variant") === "circular";
      if (Boolean(this.shadowRoot.querySelector(".circular")) !== circular) {
        this.#render();
      }
    }
    this.#sync();
  }

  #render(): void {
    const circular = this.getAttribute("variant") === "circular";
    const root = this.shadowRoot ?? mountShadow(this, "", styles);
    root.innerHTML = `<style>${styles}</style>
      <div class="wrap">
        <div class="head"><span class="label"></span><span class="value"></span></div>
        ${circular ? circularMarkup : linearMarkup}
      </div>`;

    const input = root.querySelector<HTMLInputElement>("input[type='range']");
    this.#input = input ?? null;
    input?.addEventListener("input", () => {
      this.value = Number(input.value);
      emit(this, "gk-input", { value: this.value });
    });
    input?.addEventListener("change", () => emit(this, "gk-change", { value: this.value }));

    const ticks = root.querySelector(".ticks");
    if (ticks) ticks.innerHTML = Array.from({ length: 11 }, () => "<i></i>").join("");
  }

  #sync(): void {
    if (!this.#input || !this.shadowRoot) return;
    const min = this.min;
    const max = Math.max(this.max, min);
    const value = clamp(this.value, min, max);
    const step = toNumber(this.getAttribute("step"), 1);
    const fraction = max === min ? 0 : (value - min) / (max - min);
    const progress = fraction * 100;

    const input = this.#input;
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.disabled = this.hasAttribute("disabled");
    if (Number(input.value) !== value) input.value = String(value);

    this.style.setProperty("--gk-slider-progress", `${progress}%`);
    this.style.setProperty("--gk-slider-fraction", String(fraction));
    this.style.setProperty("--gk-slider-circular", String(progress));
    this.style.setProperty("--gk-slider-angle", `${fraction * 360}deg`);

    this.shadowRoot.querySelector(".ticks")?.toggleAttribute("hidden", !this.hasAttribute("ticks"));
    const startIcon = this.shadowRoot.querySelector(".start-icon");
    if (startIcon) startIcon.textContent = this.getAttribute("start-icon") ?? "";
    const endIcon = this.shadowRoot.querySelector(".end-icon");
    if (endIcon) endIcon.textContent = this.getAttribute("end-icon") ?? "";

    const label = this.getAttribute("label") ?? "";
    const unit = this.getAttribute("unit") ?? "";
    const labelNode = this.shadowRoot.querySelector(".label");
    const valueNode = this.shadowRoot.querySelector(".value");
    if (labelNode) labelNode.textContent = label;
    if (valueNode) valueNode.textContent = `${value}${unit}`;
    input.setAttribute("aria-label", label || "Slider");
    input.setAttribute("aria-valuetext", `${value}${unit}`);
  }
}

export const SLIDER_TAG = "gk-slider";
