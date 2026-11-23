import { mountShadow } from "../base.js";
import { componentBaseCss, emit, slotHasContent, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .notification {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    gap: var(--gk-space-3);
    padding: 11px 12px;
    border: 1px solid var(--gk-color-hairline);
    border-left: 3px solid var(--gk-color-accent);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    box-shadow: 0 8px 24px var(--gk-color-shadow);
  }

  :host([tone="success"]) .notification { border-left-color: var(--gk-color-success); }
  :host([tone="warning"]) .notification { border-left-color: var(--gk-color-warning); }
  :host([tone="danger"]) .notification { border-left-color: var(--gk-color-danger); }

  .icon { display: grid; place-items: center; width: 24px; height: 24px; color: var(--gk-color-accent); }
  :host([tone="success"]) .icon { color: var(--gk-color-success); }
  :host([tone="warning"]) .icon { color: var(--gk-color-warning); }
  :host([tone="danger"]) .icon { color: var(--gk-color-danger); }

  .fallback:empty { display: none; }
  .title { font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-semibold); }
  .message { display: block; margin-top: 2px; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
  .action { display: block; margin-top: 6px; }

  .dismiss {
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
  }

  .dismiss:hover { background: var(--gk-color-card-hover); }
  .dismiss[hidden] { display: none; }
`;

const html = `
  <aside class="notification" part="notification" role="status">
    <span class="icon"><span class="fallback">i</span><slot name="icon"></slot></span>
    <span class="body">
      <strong class="title" part="title"></strong>
      <span class="message" part="message"></span>
      <span class="action"><slot name="action"></slot></span>
    </span>
    <button type="button" class="dismiss" aria-label="Dismiss notification">×</button>
  </aside>`;

export class NotificationCard extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["title", "message", "tone", "duration", "non-dismissible"];
  }

  #timer: number | null = null;
  #dismissButton: HTMLButtonElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#dismissButton = this.shadowRoot!.querySelector<HTMLButtonElement>(".dismiss");
      this.#dismissButton!.addEventListener("click", this.#dismiss);
      this.shadowRoot!.querySelector('slot[name="icon"]')!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  disconnectedCallback(): void {
    this.#clearTimer();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #clearTimer(): void {
    if (this.#timer !== null) window.clearTimeout(this.#timer);
    this.#timer = null;
  }

  #dismiss = (): void => {
    emit(this, "gk-dismiss", { source: this });
    if (this.hasAttribute("remove-on-dismiss")) this.remove();
  };

  #sync(): void {
    if (!this.shadowRoot || !this.#dismissButton) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("title") ?? "";
    root.querySelector<HTMLElement>(".message")!.textContent = this.getAttribute("message") ?? "";
    root.querySelector<HTMLElement>(".icon .fallback")!.hidden = slotHasContent(root, "icon");
    this.#dismissButton.hidden = this.hasAttribute("non-dismissible");
    const tone = this.getAttribute("tone") ?? "info";
    root.querySelector<HTMLElement>(".notification")!.setAttribute(
      "role",
      tone === "danger" || tone === "warning" ? "alert" : "status",
    );

    this.#clearTimer();
    const duration = toNumber(this.getAttribute("duration"), 0);
    if (duration > 0) this.#timer = window.setTimeout(this.#dismiss, duration);
  }
}

export const NOTIFICATION_TAG = "gk-notification";
