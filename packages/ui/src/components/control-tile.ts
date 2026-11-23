import { mountShadow } from "../base.js";
import { componentBaseCss, emit, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: inline-flex; }

  .tile {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    align-items: center;
    gap: var(--gk-space-3);
    min-width: 132px;
    min-height: 62px;
    padding: 10px 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
    color: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
      border-color var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
  }

  .tile:hover:not(:disabled) { background: var(--gk-color-card-hover); }
  .tile:disabled { opacity: 0.45; cursor: default; }

  .tile[data-state="on"] {
    background: var(--gk-color-accent-fill);
    border-color: var(--gk-color-accent-stroke);
    color: var(--gk-color-accent);
  }

  .icon { display: grid; place-items: center; width: 28px; height: 28px; }
  .dot {
    width: 10px;
    height: 10px;
    border: 1.5px solid currentColor;
    border-radius: 50%;
  }

  .dot:empty { display: none; }
  .tile[data-state="on"] .dot { background: currentColor; }

  .label { font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-medium); }
  .fallback:empty { display: none; }
`;

const html = `
  <button type="button" class="tile" part="tile" data-state="off">
    <span class="icon"><span class="dot"></span><slot name="icon"></slot></span>
    <span class="label"><span class="fallback"></span><slot name="label"></slot></span>
  </button>`;

export class ControlTile extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "state", "mode", "disabled"];
  }

  #button: HTMLButtonElement | null = null;

  get state(): string {
    return this.getAttribute("state") ?? "off";
  }

  set state(value: string) {
    this.setAttribute("state", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#button = this.shadowRoot!.querySelector<HTMLButtonElement>(".tile");
      this.#button!.addEventListener("click", this.#onClick);
      this.shadowRoot!.querySelector('slot[name="label"]')!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (): void => {
    if (this.hasAttribute("disabled")) return;
    const mode = this.getAttribute("mode") ?? "toggle";
    if (mode === "toggle") this.state = this.state === "on" ? "off" : "on";
    emit(this, "gk-activate", { state: this.state, source: this });
    if (mode === "toggle") emit(this, "gk-state-change", { state: this.state, source: this });
  };

  #sync(): void {
    if (!this.#button || !this.shadowRoot) return;
    const label = this.getAttribute("label") ?? "";
    const mode = this.getAttribute("mode") ?? "toggle";
    this.#button.dataset.state = this.state;
    this.#button.disabled = this.hasAttribute("disabled");
    this.#button.setAttribute("aria-label", label || this.textContent?.trim() || "Control");
    if (mode === "toggle") this.#button.setAttribute("aria-pressed", String(this.state === "on"));
    else this.#button.removeAttribute("aria-pressed");
    const hasLabel = slotHasContent(this.shadowRoot, "label");
    this.#button.querySelector<HTMLElement>(".fallback")!.textContent = hasLabel ? "" : label;
    this.#button.querySelector<HTMLElement>(".dot")!.hidden = hasLabel && slotHasContent(this.shadowRoot, "icon");
  }
}

export const CONTROL_TILE_TAG = "gk-control-tile";
