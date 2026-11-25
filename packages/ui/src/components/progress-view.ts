import { mountShadow } from "../base.js";
import { componentBaseCss, clamp, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .progress {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .labels {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }

  .current {
    color: var(--gk-color-text);
    font-size: var(--gk-font-size-xs);
    font-variant-numeric: tabular-nums;
  }

  .track {
    height: 6px;
    overflow: hidden;
    border-radius: var(--gk-radius-pill);
    background: var(--gk-color-glass-regular);
  }

  .fill {
    width: var(--gk-progress, 0%);
    height: 100%;
    border-radius: inherit;
    background: var(--gk-color-accent);
    transition: width var(--gk-motion-duration-base) var(--gk-motion-ease-standard);
  }

  .bounds {
    display: flex;
    justify-content: space-between;
    color: var(--gk-color-text-dim);
    font-size: 10px;
    font-variant-numeric: tabular-nums;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid var(--gk-color-glass-regular);
    border-top-color: var(--gk-color-accent);
    border-radius: 50%;
    animation: gk-progress-spin 720ms linear infinite;
  }

  .indeterminate {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  @keyframes gk-progress-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .fill { transition: none; }
    .spinner { animation-duration: 1600ms; }
  }
`;

const html = `
  <div class="progress" part="progress">
    <div class="labels">
      <span class="label" part="label"></span>
      <span class="current" part="current-value-label"></span>
    </div>
    <div class="track" part="track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
      <div class="fill" part="fill"></div>
    </div>
    <div class="bounds"><span class="minimum"></span><span class="maximum"></span></div>
    <div class="indeterminate" hidden><span class="spinner" aria-hidden="true"></span><span class="label">Working…</span></div>
  </div>`;

export class ProgressView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["value", "total", "label", "current-value-label", "minimum-value-label", "maximum-value-label", "indeterminate"];
  }

  #track: HTMLElement | null = null;
  #determinate: HTMLElement | null = null;
  #indeterminate: HTMLElement | null = null;

  get value(): number {
    return toNumber(this.getAttribute("value"), 0);
  }

  set value(next: number) {
    this.setAttribute("value", String(next));
  }

  connectedCallback(): void {
    if (!this.shadowRoot) mountShadow(this, html, styles);
    this.#track = this.shadowRoot!.querySelector<HTMLElement>(".track");
    this.#determinate = this.shadowRoot!.querySelector<HTMLElement>(".labels");
    this.#indeterminate = this.shadowRoot!.querySelector<HTMLElement>(".indeterminate");
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.shadowRoot || !this.#track || !this.#determinate || !this.#indeterminate) return;
    const root = this.shadowRoot;
    const total = Math.max(toNumber(this.getAttribute("total"), 1), Number.EPSILON);
    const percent = clamp((this.value / total) * 100);
    const isIndeterminate = this.hasAttribute("indeterminate");

    const label = this.getAttribute("label") ?? "Progress";
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "";
    this.#track.setAttribute("aria-label", label);
    root.querySelector<HTMLElement>(".current")!.textContent =
      this.getAttribute("current-value-label") ?? `${Math.round(percent)}%`;
    root.querySelector<HTMLElement>(".minimum")!.textContent = this.getAttribute("minimum-value-label") ?? "";
    root.querySelector<HTMLElement>(".maximum")!.textContent = this.getAttribute("maximum-value-label") ?? "";
    root.querySelector<HTMLElement>(".fill")!.style.setProperty("--gk-progress", `${percent}%`);

    this.#track.style.setProperty("--gk-progress", `${percent}%`);
    this.#track.setAttribute("aria-valuenow", String(Math.round(percent)));
    this.#track.setAttribute("aria-valuetext", this.getAttribute("current-value-label") ?? `${Math.round(percent)}%`);
    this.#track.hidden = isIndeterminate;
    root.querySelector<HTMLElement>(".bounds")!.hidden = isIndeterminate;
    this.#determinate.hidden = isIndeterminate;
    this.#indeterminate.hidden = !isIndeterminate;
  }
}

export const PROGRESS_VIEW_TAG = "gk-progress-view";
