import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface AdaptiveVariant {
  label?: string;
  detail?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .panel {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .heading {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .heading:empty { display: none; }

  .stage { position: relative; min-width: 0; }
  .measure {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: max-content;
    visibility: hidden;
  }
  .visible { display: grid; min-width: 0; }

  .candidate {
    display: flex;
    align-items: baseline;
    gap: 8px;
    width: max-content;
    max-width: 100%;
    padding: 7px 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    font-size: var(--gk-font-size-xs);
    white-space: nowrap;
  }
  .candidate .detail { color: var(--gk-color-text-dim); font-size: 10px; }
  .visible .candidate { width: 100%; }

  .route { color: var(--gk-color-text-dim); font-size: 10px; }
`;

const html = `
  <div class="panel" part="panel">
    <div class="heading" part="heading"></div>
    <div class="stage" part="stage">
      <div class="measure" aria-hidden="true"></div>
      <div class="visible" part="visible"></div>
    </div>
    <div class="route" part="route"></div>
  </div>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const candidateHtml = (variant: AdaptiveVariant, index: number): string => `
  <div class="candidate" data-variant="${index}">
    <span class="label">${esc(String(variant.label ?? `Variant ${index + 1}`))}</span>
    ${variant.detail ? `<span class="detail">${esc(String(variant.detail))}</span>` : ""}
  </div>`;

export class AdaptiveView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "variants"];
  }

  #index = -1;
  #observer: ResizeObserver | null = null;
  #timer: number | null = null;
  #onWindowResize = (): void => this.#choose(true);

  get value(): number {
    return this.#index;
  }

  /** Recompute the active variant after a host resize or authored layout change. */
  remeasure(): void {
    void this.offsetWidth;
    this.#choose(true);
  }

  #scheduleChoose(): void {
    if (this.#timer !== null) window.clearTimeout(this.#timer);
    this.#timer = window.setTimeout(() => {
      this.#timer = null;
      this.#choose(true);
    }, 0);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      const stage = this.shadowRoot!.querySelector<HTMLElement>(".stage")!;
      if (typeof ResizeObserver !== "undefined") {
        this.#observer = new ResizeObserver(() => this.#choose());
        this.#observer.observe(stage);
      } else {
        window.addEventListener("resize", this.#onWindowResize);
      }
    }
    this.#sync();
    this.#scheduleChoose();
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#observer = null;
    if (this.#timer !== null) {
      window.clearTimeout(this.#timer);
      this.#timer = null;
    }
    window.removeEventListener("resize", this.#onWindowResize);
  }

  attributeChangedCallback(): void {
    this.#sync();
    this.#scheduleChoose();
  }

  #variants(): AdaptiveVariant[] {
    return parseItems<AdaptiveVariant>(this.getAttribute("variants"));
  }

  #choose = (force = false): void => {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const variants = this.#variants();
    if (!variants.length) return;
    const available = root.querySelector<HTMLElement>(".stage")!.clientWidth;
    const candidates = Array.from(root.querySelectorAll<HTMLElement>(".measure .candidate"));
    let next = candidates.findIndex((candidate) => candidate.getBoundingClientRect().width <= available);
    if (next < 0) next = candidates.length - 1;
    if (next < 0) return;
    if (next === this.#index && !force) return;

    this.#index = next;
    root.querySelector<HTMLElement>(".visible")!.innerHTML = candidateHtml(variants[next]!, next);
    root.querySelector<HTMLElement>(".route")!.textContent = `Variant ${next + 1} of ${variants.length} · ${available}px available`;
    emit(this, "gk-adapt", { index: next, label: variants[next]!.label ?? `Variant ${next + 1}`, available, source: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".heading")!.textContent = this.getAttribute("label") ?? "Responsive layout";
    const variants = this.#variants();
    root.querySelector<HTMLElement>(".measure")!.innerHTML = variants.map(candidateHtml).join("");
    root.querySelector<HTMLElement>(".visible")!.innerHTML = variants[0] ? candidateHtml(variants[0]!, 0) : "";
    root.querySelector<HTMLElement>(".route")!.textContent = variants.length ? "Measuring…" : "No variants provided";
  }
}

export const ADAPTIVE_VIEW_TAG = "gk-adaptive-view";
