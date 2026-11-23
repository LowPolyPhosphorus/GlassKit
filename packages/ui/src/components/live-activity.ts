import { mountShadow } from "../base.js";
import { clamp, componentBaseCss, emit, slotHasContent, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .activity {
    padding: 10px 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .header {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr) 12px;
    align-items: center;
    gap: var(--gk-space-2);
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .icon { display: grid; place-items: center; width: 20px; color: var(--gk-color-accent); }
  .fallback:empty { display: none; }
  .headings { min-width: 0; }
  .title { display: block; font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-semibold); }
  .status { display: block; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }

  .toggle {
    width: 6px;
    height: 6px;
    border-right: 1.5px solid var(--gk-color-text-muted);
    border-bottom: 1.5px solid var(--gk-color-text-muted);
    transform: rotate(45deg);
    transition: transform var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
  }

  :host([expanded]) .toggle { transform: rotate(225deg); }

  .progress {
    height: 4px;
    margin-top: 10px;
    border-radius: var(--gk-radius-pill);
    background: var(--gk-color-card-hover);
    overflow: hidden;
  }

  .fill {
    display: block;
    height: 100%;
    background: var(--gk-color-accent);
    border-radius: inherit;
    transition: width var(--gk-motion-duration-base) var(--gk-motion-ease-standard);
  }

  .details {
    margin-top: 10px;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
  }

  .details[hidden] { display: none; }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--gk-space-2);
    margin-top: 10px;
  }

  .action {
    padding: 4px 9px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-xs);
    background: var(--gk-color-card-hover);
    color: inherit;
    font-size: var(--gk-font-size-xs);
    cursor: pointer;
  }

  .action[hidden] { display: none; }
`;

const html = `
  <section class="activity" part="activity">
    <button type="button" class="header" part="header" aria-expanded="false">
      <span class="icon"><span class="fallback">●</span><slot name="icon"></slot></span>
      <span class="headings">
        <strong class="title" part="title"></strong>
        <span class="status" part="status"></span>
      </span>
      <span class="toggle" aria-hidden="true"></span>
    </button>
    <div class="progress" part="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100">
      <span class="fill"></span>
    </div>
    <div class="details" part="details" hidden><slot name="detail"></slot></div>
    <div class="actions">
      <slot name="action"></slot>
      <button type="button" class="action" hidden></button>
    </div>
  </section>`;

export class LiveActivity extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["title", "status", "progress", "expanded", "action-label"];
  }

  #header: HTMLButtonElement | null = null;
  #details: HTMLElement | null = null;
  #progress: HTMLElement | null = null;
  #action: HTMLButtonElement | null = null;

  get expanded(): boolean {
    return this.hasAttribute("expanded");
  }

  set expanded(value: boolean) {
    this.toggleAttribute("expanded", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#header = this.shadowRoot!.querySelector<HTMLButtonElement>(".header");
      this.#details = this.shadowRoot!.querySelector<HTMLElement>(".details");
      this.#progress = this.shadowRoot!.querySelector<HTMLElement>(".progress");
      this.#action = this.shadowRoot!.querySelector<HTMLButtonElement>(".action");
      this.#header!.addEventListener("click", this.#onExpand);
      this.#action!.addEventListener("click", () => emit(this, "gk-activate", { source: this }));
      this.shadowRoot!.querySelector('slot[name="icon"]')!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onExpand = (): void => {
    this.expanded = !this.expanded;
    emit(this, "gk-expand-change", { expanded: this.expanded, source: this });
  };

  #sync(): void {
    if (!this.#header || !this.#details || !this.#progress || !this.#action || !this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("title") ?? "";
    root.querySelector<HTMLElement>(".status")!.textContent = this.getAttribute("status") ?? "";
    root.querySelector<HTMLElement>(".icon .fallback")!.hidden = slotHasContent(root, "icon");
    const progress = clamp(toNumber(this.getAttribute("progress"), 0));
    root.querySelector<HTMLElement>(".fill")!.style.width = `${progress}%`;
    this.#progress.setAttribute("aria-valuenow", String(Math.round(progress)));
    this.#progress.setAttribute("aria-valuetext", `${Math.round(progress)}%`);
    this.#header.setAttribute("aria-expanded", String(this.expanded));
    this.#details.hidden = !this.expanded;
    const actionLabel = this.getAttribute("action-label") ?? "";
    this.#action.hidden = !actionLabel;
    this.#action.textContent = actionLabel;
  }
}

export const LIVE_ACTIVITY_TAG = "gk-live-activity";
