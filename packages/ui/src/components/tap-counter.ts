import { mountShadow } from "../base.js";
import { componentBaseCss, emit, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; min-width: 0; }

  .counter {
    display: grid;
    gap: 7px;
    min-width: 188px;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }
  .head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .label:empty { display: none; }
  .goal { color: var(--gk-color-text-dim); font-size: 10px; }

  .track { height: 5px; overflow: hidden; border-radius: 3px; background: var(--gk-color-soft-hairline); }
  .fill { height: 100%; width: 0; background: var(--gk-color-accent); }

  .tap {
    min-height: 44px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-text);
    cursor: pointer;
    font-size: var(--gk-font-size-sm);
  }
  .tap:hover { background: var(--gk-color-card-hover); }
  .tap:active { background: var(--gk-color-accent-fill); }
  .readout { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); font-variant-numeric: tabular-nums; text-align: center; }
`;

const html = `
  <section class="counter" part="counter">
    <header class="head"><span class="label" part="label"></span><span class="goal" part="goal"></span></header>
    <div class="track" part="track" aria-hidden="true"><div class="fill" part="fill"></div></div>
    <button type="button" class="tap" part="tap">Tap target</button>
    <div class="readout" part="readout" aria-live="polite"></div>
  </section>`;

export class TapCounter extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "count", "value"];
  }

  #taps = 0;

  get value(): number {
    return this.#taps;
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".tap")!.addEventListener("click", this.#onTap);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #goal(): number {
    return Math.max(1, Math.trunc(toNumber(this.getAttribute("count"), 3)));
  }

  #onTap = (): void => {
    const goal = this.#goal();
    this.#taps = this.#taps >= goal ? 1 : this.#taps + 1;
    this.#paint();
    emit(this, "gk-tap", { count: this.#taps, goal, source: this });
    if (this.#taps >= goal) emit(this, "gk-tap-complete", { count: this.#taps, goal, source: this });
  };

  #paint(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const goal = this.#goal();
    root.querySelector<HTMLElement>(".fill")!.style.width = `${Math.round((this.#taps / goal) * 100)}%`;
    root.querySelector<HTMLElement>(".readout")!.textContent = `${this.#taps} of ${goal} taps`;
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const goal = this.#goal();
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Tap gesture";
    root.querySelector<HTMLElement>(".goal")!.textContent = `count ${goal}`;
    root.querySelector<HTMLButtonElement>(".tap")!.textContent = this.getAttribute("label") ?? "Tap target";
    this.#taps = Math.max(0, Math.min(goal, Math.trunc(toNumber(this.getAttribute("value"), 0))));
    this.#paint();
  }
}

export const TAP_COUNTER_TAG = "gk-tap-counter";
