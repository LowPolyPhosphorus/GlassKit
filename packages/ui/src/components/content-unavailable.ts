import { mountShadow } from "../base.js";
import { componentBaseCss, emit, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .empty {
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 8px;
    min-height: 168px;
    padding: 24px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
    text-align: center;
  }

  .glyph {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xl);
  }

  .fallback:empty { display: none; }
  .title { font-size: var(--gk-font-size-lg); font-weight: var(--gk-font-weight-semibold); }
  .message {
    max-width: 42ch;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-sm);
    line-height: 1.5;
  }

  .action {
    margin-top: 4px;
    padding: 7px 14px;
    border: 1px solid var(--gk-color-accent-stroke);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-accent);
    cursor: pointer;
    font-size: var(--gk-font-size-sm);
    font-weight: var(--gk-font-weight-medium);
  }

  .action:hover { background: var(--gk-color-accent-stroke); }
  .action[hidden] { display: none; }
`;

const html = `
  <div class="empty" part="empty" role="status">
    <span class="glyph"><span class="fallback">⌕</span><slot name="icon"></slot></span>
    <strong class="title" part="title"></strong>
    <span class="message" part="message"></span>
    <button type="button" class="action" part="action" hidden></button>
    <slot></slot>
  </div>`;

export class ContentUnavailable extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["title", "message", "action-label", "search"];
  }

  #action: HTMLButtonElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#action = this.shadowRoot!.querySelector<HTMLButtonElement>(".action");
      this.#action?.addEventListener("click", () => {
        emit(this, "gk-activate", { action: this.getAttribute("action-label") ?? "Retry", source: this });
      });
      this.shadowRoot!.querySelector('slot[name="icon"]')!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.shadowRoot || !this.#action) return;
    const isSearch = this.hasAttribute("search");
    this.shadowRoot.querySelector<HTMLElement>(".title")!.textContent =
      this.getAttribute("title") ?? (isSearch ? "No results" : "Nothing here yet");
    this.shadowRoot.querySelector<HTMLElement>(".message")!.textContent =
      this.getAttribute("message") ??
      (isSearch ? "Try a different search term or clear the filter." : "New content will appear here when it is available.");
    this.shadowRoot.querySelector<HTMLElement>(".fallback")!.hidden = slotHasContent(this.shadowRoot, "icon");
    const label = this.getAttribute("action-label");
    this.#action.hidden = !label;
    this.#action.textContent = label ?? "";
  }
}

export const CONTENT_UNAVAILABLE_TAG = "gk-content-unavailable";
