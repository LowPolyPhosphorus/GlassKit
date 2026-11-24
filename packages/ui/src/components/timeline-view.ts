import { mountShadow } from "../base.js";
import { componentBaseCss, emit, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; min-width: 0; }

  .timeline {
    display: grid;
    gap: 5px;
    min-width: 210px;
    padding: 10px 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .label:empty { display: none; }

  .clock {
    font-variant-numeric: tabular-nums;
    font-size: var(--gk-font-size-xl);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: var(--gk-font-tracking-tight);
  }
  .meta { display: flex; justify-content: space-between; gap: 10px; color: var(--gk-color-text-dim); font-size: 10px; }
`;

const html = `
  <div class="timeline" part="timeline" role="timer" aria-live="off">
    <div class="label" part="label"></div>
    <div class="clock" part="clock">--:--</div>
    <div class="meta"><span class="elapsed" part="elapsed">0s elapsed</span><span class="cadence" part="cadence"></span></div>
  </div>`;

export class TimelineView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "interval", "start", "show-seconds"];
  }

  #timer: number | null = null;
  #startedAt = Date.now();

  get value(): Date {
    return new Date();
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
    }
    this.#restart();
  }

  disconnectedCallback(): void {
    this.#stop();
  }

  attributeChangedCallback(): void {
    if (!this.shadowRoot) return;
    this.#syncLabels();
    if (this.isConnected) this.#restart();
  }

  #stop(): void {
    if (this.#timer !== null) {
      window.clearInterval(this.#timer);
      this.#timer = null;
    }
  }

  #restart(): void {
    this.#stop();
    const start = this.getAttribute("start");
    const parsed = start ? Date.parse(start) : Number.NaN;
    this.#startedAt = Number.isFinite(parsed) ? parsed : Date.now();
    const interval = Math.max(100, toNumber(this.getAttribute("interval"), 1000));
    this.#tick();
    this.#timer = window.setInterval(() => this.#tick(), interval);
    this.#syncLabels(interval);
  }

  #syncLabels(interval = Math.max(100, toNumber(this.getAttribute("interval"), 1000))): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Current time";
    root.querySelector<HTMLElement>(".cadence")!.textContent =
      interval >= 1000 ? `every ${interval / 1000}s` : `every ${interval}ms`;
  }

  #tick(): void {
    if (!this.shadowRoot) return;
    const now = new Date();
    const showSeconds = this.hasAttribute("show-seconds");
    const clock = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      ...(showSeconds ? { second: "2-digit" } : {}),
    }).format(now);
    const elapsed = Math.max(0, Math.floor((now.getTime() - this.#startedAt) / 1000));
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".clock")!.textContent = clock;
    root.querySelector<HTMLElement>(".elapsed")!.textContent = `${elapsed}s elapsed`;
    root.querySelector<HTMLElement>(".timeline")!.setAttribute("aria-label", `${clock}, ${elapsed} seconds elapsed`);
    emit(this, "gk-tick", { iso: now.toISOString(), elapsed, clock, source: this });
  }
}

export const TIMELINE_VIEW_TAG = "gk-timeline-view";
