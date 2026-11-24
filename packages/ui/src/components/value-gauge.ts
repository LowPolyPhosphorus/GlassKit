import { mountShadow } from "../base.js";
import { componentBaseCss, clamp, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .gauge {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .label { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); font-weight: var(--gk-font-weight-medium); }
  .current { font-size: var(--gk-font-size-lg); font-weight: var(--gk-font-weight-semibold); font-variant-numeric: tabular-nums; }

  .arc { display: grid; place-items: center; width: 72px; height: 72px; }
  svg { width: 72px; height: 72px; transform: rotate(135deg); }
  circle { fill: none; stroke-width: 5; stroke-linecap: round; }
  .base { stroke: var(--gk-color-glass-regular); stroke-dasharray: 75.4 100.5; }
  .value {
    stroke: var(--gk-color-accent);
    stroke-dasharray: var(--gk-gauge-arc, 0) 100.5;
    transition: stroke-dasharray var(--gk-motion-duration-base) var(--gk-motion-ease-standard);
  }
  .arc-value { margin-top: -42px; font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-semibold); }

  .linear { display: grid; gap: 5px; }
  .track { height: 7px; overflow: hidden; border-radius: var(--gk-radius-pill); background: var(--gk-color-glass-regular); }
  .fill {
    width: var(--gk-gauge-percent, 0%);
    height: 100%;
    border-radius: inherit;
    background: var(--gk-color-accent);
    transition: width var(--gk-motion-duration-base) var(--gk-motion-ease-standard);
  }
  .bounds { display: flex; justify-content: space-between; color: var(--gk-color-text-dim); font-size: 10px; }

  [hidden] { display: none !important; }

  @media (prefers-reduced-motion: reduce) {
    .value, .fill { transition: none; }
  }
`;

const html = `
  <div class="gauge" part="gauge" role="meter" aria-valuemin="0" aria-valuemax="100">
    <div class="head"><span class="label" part="label"></span><span class="current" part="current-value-label"></span></div>
    <div class="arc" part="arc">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle class="base" cx="20" cy="20" r="16"></circle>
        <circle class="value" cx="20" cy="20" r="16"></circle>
      </svg>
      <span class="arc-value"></span>
    </div>
    <div class="linear" part="linear" hidden>
      <div class="track"><div class="fill"></div></div>
      <div class="bounds"><span class="minimum"></span><span class="maximum"></span></div>
    </div>
  </div>`;

export class ValueGauge extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["value", "min", "max", "label", "current-value-label", "minimum-value-label", "maximum-value-label", "variant"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) mountShadow(this, html, styles);
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const min = toNumber(this.getAttribute("min"), 0);
    const max = toNumber(this.getAttribute("max"), 100);
    const range = Math.max(max - min, Number.EPSILON);
    const raw = toNumber(this.getAttribute("value"), min);
    const percent = clamp(((raw - min) / range) * 100);
    const current = this.getAttribute("current-value-label") ?? `${Math.round(raw)}`;
    const variant = this.getAttribute("variant") === "linear" ? "linear" : "circular";
    const gauge = root.querySelector<HTMLElement>(".gauge")!;

    gauge.setAttribute("aria-valuemin", String(min));
    gauge.setAttribute("aria-valuemax", String(max));
    gauge.setAttribute("aria-valuenow", String(raw));
    gauge.setAttribute("aria-valuetext", current);
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Value";
    root.querySelector<HTMLElement>(".current")!.textContent = current;
    root.querySelector<HTMLElement>(".arc-value")!.textContent = current;
    root.querySelector<HTMLElement>(".minimum")!.textContent = this.getAttribute("minimum-value-label") ?? String(min);
    root.querySelector<HTMLElement>(".maximum")!.textContent = this.getAttribute("maximum-value-label") ?? String(max);
    root.querySelector<HTMLElement>(".arc")!.hidden = variant !== "circular";
    root.querySelector<HTMLElement>(".linear")!.hidden = variant !== "linear";
    gauge.style.setProperty("--gk-gauge-percent", `${percent}%`);
    gauge.style.setProperty("--gk-gauge-arc", `${(75.4 * percent) / 100}`);
  }
}

export const VALUE_GAUGE_TAG = "gk-value-gauge";
