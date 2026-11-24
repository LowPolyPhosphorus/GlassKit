import { mountShadow } from "../base.js";
import { componentBaseCss, emit, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; min-width: 0; }

  .hold {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 168px;
    min-height: 34px;
    padding: 6px 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    cursor: pointer;
    font-size: var(--gk-font-size-sm);
    touch-action: none;
    user-select: none;
  }
  .hold:hover { background: var(--gk-color-card-hover); }
  .hold[data-holding="true"] { border-color: var(--gk-color-accent); }

  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 0;
    background: var(--gk-color-accent-fill);
    pointer-events: none;
  }
  .content { position: relative; display: inline-flex; align-items: center; gap: 8px; }
  .hint { color: var(--gk-color-text-dim); font-size: 10px; }
`;

const html = `
  <button type="button" class="hold" part="hold" data-holding="false">
    <span class="fill" part="fill" aria-hidden="true"></span>
    <span class="content"><span class="label" part="label"></span><span class="hint" part="hint"></span></span>
  </button>`;

export class LongPress extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "hint", "duration", "value"];
  }

  #timer: number | null = null;
  #startedAt = 0;
  #holding = false;

  get value(): string {
    return this.getAttribute("value") ?? "long-press";
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      const hold = this.shadowRoot!.querySelector<HTMLButtonElement>(".hold")!;
      hold.addEventListener("pointerdown", this.#onStart);
      hold.addEventListener("pointerup", this.#onEnd);
      hold.addEventListener("pointercancel", this.#onCancel);
      hold.addEventListener("pointerleave", this.#onCancel);
      hold.addEventListener("keydown", this.#onKeyDown);
      hold.addEventListener("keyup", this.#onEnd);
      hold.addEventListener("blur", this.#onCancel);
    }
    this.#sync();
  }

  disconnectedCallback(): void {
    this.#stop(false);
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #duration(): number {
    return Math.max(200, toNumber(this.getAttribute("duration"), 1200));
  }

  #setProgress(ratio: number): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelector<HTMLElement>(".fill")!.style.width = `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`;
  }

  #onStart = (event?: Event): void => {
    if (this.#holding) return;
    if (event instanceof PointerEvent && event.button !== 0) return;
    if (event instanceof KeyboardEvent && event.repeat) return;
    if (event instanceof KeyboardEvent && event.key !== " " && event.key !== "Enter") return;
    event?.preventDefault();
    this.#holding = true;
    this.#startedAt = performance.now();
    if (this.shadowRoot) this.shadowRoot.querySelector<HTMLElement>(".hold")!.dataset.holding = "true";
    emit(this, "gk-press-start", { value: this.value, duration: this.#duration(), source: this });
    this.#timer = window.setInterval(() => this.#tick(), 40);
    this.#tick();
  };

  #onEnd = (): void => {
    if (!this.#holding) return;
    const ratio = (performance.now() - this.#startedAt) / this.#duration();
    if (ratio >= 1) {
      this.#stop(true);
      emit(this, "gk-press-complete", { value: this.value, source: this });
    } else {
      this.#stop(false);
      emit(this, "gk-press-cancel", { value: this.value, progress: Math.min(1, ratio), source: this });
    }
  };

  #onCancel = (): void => {
    if (!this.#holding) return;
    const ratio = (performance.now() - this.#startedAt) / this.#duration();
    this.#stop(false);
    emit(this, "gk-press-cancel", { value: this.value, progress: Math.min(1, ratio), source: this });
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === " " || event.key === "Enter") this.#onStart(event);
  };

  #stop(completed: boolean): void {
    if (this.#timer !== null) {
      window.clearInterval(this.#timer);
      this.#timer = null;
    }
    this.#holding = false;
    if (this.shadowRoot) {
      const hold = this.shadowRoot.querySelector<HTMLElement>(".hold")!;
      hold.dataset.holding = "false";
      this.#setProgress(completed ? 1 : 0);
    }
  }

  #tick(): void {
    const ratio = (performance.now() - this.#startedAt) / this.#duration();
    if (ratio >= 1) {
      this.#onEnd();
      return;
    }
    this.#setProgress(ratio);
    emit(this, "gk-press-progress", { value: this.value, progress: ratio, source: this });
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Hold to confirm";
    root.querySelector<HTMLElement>(".hint")!.textContent = this.getAttribute("hint") ?? `${this.#duration() / 1000}s`;
  }
}

export const LONG_PRESS_TAG = "gk-long-press";
