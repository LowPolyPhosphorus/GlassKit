import { mountShadow } from "../base.js";
import { componentBaseCss, emit, toNumber } from "../shared.js";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  color: string;
  points: Point[];
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

  .head { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .label:empty { display: none; }
  .hint { color: var(--gk-color-text-dim); font-size: 10px; }

  .surface {
    overflow: hidden;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
  }
  canvas { display: block; width: 100%; touch-action: none; cursor: crosshair; }

  .tools { display: flex; justify-content: flex-end; gap: 6px; }
  .tool {
    min-height: 26px;
    padding: 3px 9px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: 10px;
  }
  .tool:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }
`;

const html = `
  <section class="panel" part="panel">
    <header class="head"><span class="label" part="label"></span><span class="hint" part="hint"></span></header>
    <div class="surface" part="surface"><canvas part="canvas"></canvas></div>
    <div class="tools" part="tools">
      <button type="button" class="tool" data-canvas-action="undo">Undo</button>
      <button type="button" class="tool" data-canvas-action="clear">Clear</button>
    </div>
  </section>`;

export class CanvasView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "hint", "color", "height"];
  }

  #strokes: Stroke[] = [];
  #active: Stroke | null = null;
  #observer: ResizeObserver | null = null;
  #onResize = (): void => this.#resizeCanvas();

  get value(): Stroke[] {
    return this.#strokes.map((stroke) => ({ color: stroke.color, points: stroke.points.map((point) => ({ ...point })) }));
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      const root = this.shadowRoot!;
      const canvas = root.querySelector<HTMLCanvasElement>("canvas")!;
      canvas.addEventListener("pointerdown", this.#onPointerDown);
      canvas.addEventListener("pointermove", this.#onPointerMove);
      canvas.addEventListener("pointerup", this.#onPointerUp);
      canvas.addEventListener("pointercancel", this.#onPointerUp);
      root.querySelector<HTMLElement>(".tools")!.addEventListener("click", this.#onToolClick);
      if (typeof ResizeObserver !== "undefined") {
        this.#observer = new ResizeObserver(this.#onResize);
        this.#observer.observe(root.querySelector<HTMLElement>(".surface")!);
      } else {
        window.addEventListener("resize", this.#onResize);
      }
    }
    this.#sync();
    requestAnimationFrame(() => this.#resizeCanvas());
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#observer = null;
    window.removeEventListener("resize", this.#onResize);
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #color(): string {
    const authored = this.getAttribute("color");
    if (authored) return authored;
    return getComputedStyle(this).getPropertyValue("--gk-color-accent").trim() || "#0066cc";
  }

  #point(event: PointerEvent): Point {
    const rect = this.shadowRoot!.querySelector<HTMLCanvasElement>("canvas")!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  #onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    const canvas = this.shadowRoot!.querySelector<HTMLCanvasElement>("canvas")!;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or cancelled pointers do not support capture; drawing still works.
    }
    this.#active = { color: this.#color(), points: [this.#point(event)] };
    this.#strokes.push(this.#active);
    this.#redraw();
  };

  #onPointerMove = (event: PointerEvent): void => {
    if (!this.#active) return;
    event.preventDefault();
    this.#active.points.push(this.#point(event));
    this.#redraw();
  };

  #onPointerUp = (event: PointerEvent): void => {
    if (!this.#active) return;
    const canvas = this.shadowRoot!.querySelector<HTMLCanvasElement>("canvas")!;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    const points = this.#active.points.length;
    this.#active = null;
    emit(this, "gk-draw", { strokes: this.#strokes.length, points, source: this });
  };

  #onToolClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-canvas-action]");
    if (!button) return;
    if (button.dataset.canvasAction === "clear") {
      this.#strokes = [];
      this.#redraw();
      emit(this, "gk-clear", { source: this });
    } else {
      const removed = this.#strokes.pop();
      this.#redraw();
      emit(this, "gk-undo", { strokes: this.#strokes.length, removed: Boolean(removed), source: this });
    }
  };

  #resizeCanvas(): void {
    if (!this.shadowRoot) return;
    const canvas = this.shadowRoot.querySelector<HTMLCanvasElement>("canvas")!;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    this.#redraw();
  }

  #redraw(): void {
    if (!this.shadowRoot) return;
    const canvas = this.shadowRoot.querySelector<HTMLCanvasElement>("canvas")!;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ratio = window.devicePixelRatio || 1;
    context.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const stroke of this.#strokes) {
      context.strokeStyle = stroke.color;
      context.fillStyle = stroke.color;
      if (stroke.points.length === 1) {
        const point = stroke.points[0]!;
        context.beginPath();
        context.arc(point.x, point.y, 1.4, 0, Math.PI * 2);
        context.fill();
        continue;
      }
      context.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.stroke();
    }
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "";
    root.querySelector<HTMLElement>(".hint")!.textContent = this.getAttribute("hint") ?? "Draw with a pointer";
    const height = Math.min(320, Math.max(80, toNumber(this.getAttribute("height"), 140)));
    root.querySelector<HTMLCanvasElement>("canvas")!.style.height = `${height}px`;
  }
}

export const CANVAS_VIEW_TAG = "gk-canvas-view";
