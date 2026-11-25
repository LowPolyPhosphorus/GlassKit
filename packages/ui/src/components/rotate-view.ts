import { mountShadow } from "../base.js";
import { componentBaseCss, emit, toNumber } from "../shared.js";

const KEY_STEP = 15;

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .panel {
    display: grid;
    gap: 7px;
    min-width: 0;
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
  .readout { color: var(--gk-color-text-dim); font-size: 10px; font-variant-numeric: tabular-nums; }

  .surface {
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 1px solid var(--gk-color-soft-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    touch-action: none;
  }
  .rotor {
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    border: 1px solid var(--gk-color-accent);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-text);
    cursor: grab;
    font-size: 18px;
    user-select: none;
  }
  .rotor:active { cursor: grabbing; }

  .actions { display: flex; justify-content: flex-end; }
  .reset {
    min-height: 24px;
    padding: 3px 8px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: 10px;
  }
  .reset:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }
`;

const html = `
  <section class="panel" part="panel">
    <header class="head"><span class="label" part="label"></span><span class="readout" part="readout" aria-live="polite"></span></header>
    <div class="surface" part="surface" tabindex="0" role="application" aria-label="Rotation surface">
      <div class="rotor" part="rotor" aria-label="Rotation handle">↻</div>
    </div>
    <div class="actions"><button type="button" class="reset" part="reset">Reset</button></div>
  </section>`;

export class RotateView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "angle", "height"];
  }

  #angle = 0;
  #startPointer = 0;
  #startAngle = 0;
  #rotating = false;

  get value(): number {
    return this.#angle;
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".rotor")!.addEventListener("pointerdown", this.#onDown);
      this.shadowRoot!.querySelector<HTMLElement>(".surface")!.addEventListener("keydown", this.#onSurfaceKeydown);
      window.addEventListener("pointermove", this.#onMove);
      window.addEventListener("pointerup", this.#onUp);
      window.addEventListener("pointercancel", this.#onUp);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".reset")!.addEventListener("click", this.#onReset);
    }
    this.#sync();
  }

  disconnectedCallback(): void {
    window.removeEventListener("pointermove", this.#onMove);
    window.removeEventListener("pointerup", this.#onUp);
    window.removeEventListener("pointercancel", this.#onUp);
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #center(): { x: number; y: number } {
    const rect = this.shadowRoot?.querySelector<HTMLElement>(".surface")?.getBoundingClientRect();
    return { x: (rect?.left ?? 0) + (rect?.width ?? 0) / 2, y: (rect?.top ?? 0) + (rect?.height ?? 0) / 2 };
  }

  #paint(emitEvent: boolean): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const rotor = root.querySelector<HTMLElement>(".rotor")!;
    rotor.style.transform = `rotate(${this.#angle}deg)`;
    const radians = (this.#angle * Math.PI) / 180;
    root.querySelector<HTMLElement>(".readout")!.textContent = `${Math.round(this.#angle)}° · ${radians.toFixed(2)} rad`;
    rotor.setAttribute("aria-label", `Rotation handle at ${Math.round(this.#angle)} degrees`);
    if (emitEvent) emit(this, "gk-rotate-change", { angle: this.#angle, radians, source: this });
  }

  #pointerAngle(event: PointerEvent): number {
    const center = this.#center();
    return (Math.atan2(event.clientY - center.y, event.clientX - center.x) * 180) / Math.PI;
  }

  #onSurfaceKeydown = (event: KeyboardEvent): void => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") this.#angle += KEY_STEP;
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") this.#angle -= KEY_STEP;
    else return;
    event.preventDefault();
    this.#paint(true);
  };

  #onDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    this.#startPointer = this.#pointerAngle(event);
    this.#startAngle = this.#angle;
    this.#rotating = true;
    emit(this, "gk-rotate-start", { angle: this.#angle, source: this });
  };

  #onMove = (event: PointerEvent): void => {
    if (!this.#rotating) return;
    event.preventDefault();
    let delta = this.#pointerAngle(event) - this.#startPointer;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    this.#angle = this.#startAngle + delta;
    this.#paint(true);
  };

  #onUp = (): void => {
    if (!this.#rotating) return;
    this.#rotating = false;
    emit(this, "gk-rotate-end", { angle: this.#angle, source: this });
  };

  #onReset = (): void => {
    this.#angle = 0;
    this.#paint(true);
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Rotate to adjust";
    const height = Math.min(280, Math.max(120, toNumber(this.getAttribute("height"), 180)));
    root.querySelector<HTMLElement>(".surface")!.style.height = `${height}px`;
    this.#angle = toNumber(this.getAttribute("angle"), 0);
    this.#paint(false);
  }
}

export const ROTATE_VIEW_TAG = "gk-rotate-view";
