import { mountShadow } from "../base.js";
import { componentBaseCss, emit, toNumber } from "../shared.js";

const PUCK = 44;
const KEY_STEP = 8;

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
    overflow: hidden;
    border: 1px solid var(--gk-color-soft-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    touch-action: none;
  }
  .puck {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    place-items: center;
    width: ${PUCK}px;
    height: ${PUCK}px;
    border: 1px solid var(--gk-color-accent);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-text);
    cursor: grab;
    font-size: 10px;
    user-select: none;
  }
  .puck:active { cursor: grabbing; }

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
    <header class="head"><span class="label" part="label"></span><span class="readout" part="readout"></span></header>
    <div class="surface" part="surface" tabindex="0" role="application" aria-label="Drag surface">
      <div class="puck" part="puck" aria-label="Drag handle">↔</div>
    </div>
    <div class="actions"><button type="button" class="reset" part="reset">Reset</button></div>
  </section>`;

export class DragSurface extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "x", "y", "height"];
  }

  #x = 0;
  #y = 0;
  #grabX = 0;
  #grabY = 0;
  #dragging = false;

  get value(): { x: number; y: number } {
    return { x: this.#x, y: this.#y };
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      const puck = this.shadowRoot!.querySelector<HTMLElement>(".puck")!;
      puck.addEventListener("pointerdown", this.#onDown);
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

  #bounds(): { width: number; height: number } {
    const surface = this.shadowRoot?.querySelector<HTMLElement>(".surface");
    return {
      width: Math.max(PUCK, (surface?.clientWidth ?? 260) - PUCK),
      height: Math.max(PUCK, (surface?.clientHeight ?? 140) - PUCK),
    };
  }

  #paint(emitEvent: boolean): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const puck = root.querySelector<HTMLElement>(".puck")!;
    puck.style.transform = `translate(${Math.round(this.#x)}px, ${Math.round(this.#y)}px)`;
    const bounds = this.#bounds();
    root.querySelector<HTMLElement>(".readout")!.textContent = `${Math.round(this.#x)}, ${Math.round(this.#y)} · ${Math.round((this.#x / bounds.width) * 100)}% / ${Math.round((this.#y / bounds.height) * 100)}%`;
    puck.setAttribute("aria-label", `Drag handle at ${Math.round(this.#x)}, ${Math.round(this.#y)}`);
    if (emitEvent) emit(this, "gk-drag-move", { x: this.#x, y: this.#y, ratioX: this.#x / bounds.width, ratioY: this.#y / bounds.height, source: this });
  }

  #onSurfaceKeydown = (event: KeyboardEvent): void => {
    let dx = 0;
    let dy = 0;
    if (event.key === "ArrowLeft") dx = -KEY_STEP;
    else if (event.key === "ArrowRight") dx = KEY_STEP;
    else if (event.key === "ArrowUp") dy = -KEY_STEP;
    else if (event.key === "ArrowDown") dy = KEY_STEP;
    else return;
    event.preventDefault();
    const bounds = this.#bounds();
    this.#x = Math.min(bounds.width, Math.max(0, this.#x + dx));
    this.#y = Math.min(bounds.height, Math.max(0, this.#y + dy));
    this.#paint(true);
  };

  #onDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    const rect = this.shadowRoot!.querySelector<HTMLElement>(".puck")!.getBoundingClientRect();
    this.#grabX = event.clientX - rect.left;
    this.#grabY = event.clientY - rect.top;
    this.#dragging = true;
    emit(this, "gk-drag-start", { x: this.#x, y: this.#y, source: this });
  };

  #onMove = (event: PointerEvent): void => {
    if (!this.#dragging || !this.shadowRoot) return;
    event.preventDefault();
    const rect = this.shadowRoot.querySelector<HTMLElement>(".surface")!.getBoundingClientRect();
    const bounds = this.#bounds();
    this.#x = Math.min(bounds.width, Math.max(0, event.clientX - rect.left - this.#grabX));
    this.#y = Math.min(bounds.height, Math.max(0, event.clientY - rect.top - this.#grabY));
    this.#paint(true);
  };

  #onUp = (): void => {
    if (!this.#dragging) return;
    this.#dragging = false;
    emit(this, "gk-drag-end", { x: this.#x, y: this.#y, source: this });
  };

  #onReset = (): void => {
    this.#x = 0;
    this.#y = 0;
    this.#paint(true);
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Drag to adjust";
    const height = Math.min(280, Math.max(90, toNumber(this.getAttribute("height"), 140)));
    root.querySelector<HTMLElement>(".surface")!.style.height = `${height}px`;
    this.#x = Math.max(0, toNumber(this.getAttribute("x"), 0));
    this.#y = Math.max(0, toNumber(this.getAttribute("y"), 0));
    this.#paint(false);
  }
}

export const DRAG_SURFACE_TAG = "gk-drag-surface";
