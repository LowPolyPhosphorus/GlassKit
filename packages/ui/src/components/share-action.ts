import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; position: relative; }

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 30px;
    padding: 5px 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    cursor: pointer;
    font-size: var(--gk-font-size-sm);
  }
  .trigger:hover { background: var(--gk-color-card-hover); }
  .glyph { color: var(--gk-color-accent); font-size: 14px; line-height: 1; }

  .sheet {
    position: absolute;
    z-index: 24;
    top: calc(100% + 6px);
    right: 0;
    display: grid;
    gap: 7px;
    width: min(268px, 82vw);
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
  }
  .sheet[hidden] { display: none !important; }

  .title { font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-semibold); }
  .url {
    overflow: hidden;
    padding: 6px 8px;
    border: 1px solid var(--gk-color-soft-hairline);
    border-radius: var(--gk-radius-xs);
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-text-dim);
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .actions { display: grid; gap: 3px; }
  .action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 28px;
    padding: 5px 8px;
    border: 1px solid transparent;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
    text-align: left;
  }
  .action:hover { border-color: var(--gk-color-hairline); background: var(--gk-color-card-hover); color: var(--gk-color-text); }
  .action .hint { color: var(--gk-color-text-dim); font-size: 10px; }
  .status { min-height: 12px; color: var(--gk-color-text-dim); font-size: 10px; }
`;

const html = `
  <button type="button" class="trigger" part="trigger" aria-haspopup="dialog" aria-expanded="false">
    <span class="glyph" aria-hidden="true">↗</span><span class="trigger-label">Share</span>
  </button>
  <div class="sheet" part="sheet" role="dialog" aria-label="Share options" hidden>
    <div class="title" part="title"></div>
    <div class="url" part="url"></div>
    <div class="actions" part="actions" role="group" aria-label="Share destinations">
      <button type="button" class="action" data-share="copy"><span>Copy link</span><span class="hint">Clipboard</span></button>
      <button type="button" class="action" data-share="email"><span>Send by email</span><span class="hint">Draft</span></button>
      <button type="button" class="action" data-share="note"><span>Save to note</span><span class="hint">Local</span></button>
    </div>
    <div class="status" part="status" aria-live="polite"></div>
  </div>`;

export class ShareAction extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "title", "url"];
  }

  #open = false;

  get value(): string {
    return this.getAttribute("url") ?? "";
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".trigger")!.addEventListener("click", this.#onTriggerClick);
      this.shadowRoot!.querySelector<HTMLElement>(".actions")!.addEventListener("click", this.#onActionClick);
      this.shadowRoot!.querySelector<HTMLElement>(".sheet")!.addEventListener("keydown", this.#onSheetKeydown);
      document.addEventListener("pointerdown", this.#onDocumentPointerDown, true);
    }
    this.#sync();
  }

  disconnectedCallback(): void {
    document.removeEventListener("pointerdown", this.#onDocumentPointerDown, true);
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #setOpen(open: boolean): void {
    if (!this.shadowRoot) return;
    this.#open = open;
    this.shadowRoot.querySelector<HTMLElement>(".sheet")!.hidden = !open;
    this.shadowRoot.querySelector<HTMLButtonElement>(".trigger")!.setAttribute("aria-expanded", String(open));
    if (open) this.shadowRoot.querySelector<HTMLButtonElement>('[data-share="copy"]')!.focus();
    emit(this, open ? "gk-open" : "gk-close", { source: this });
  }

  #setStatus(message: string): void {
    if (this.shadowRoot) this.shadowRoot.querySelector<HTMLElement>(".status")!.textContent = message;
  }

  #onTriggerClick = (): void => this.#setOpen(!this.#open);

  #onSheetKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !this.#open) return;
    event.preventDefault();
    this.#setOpen(false);
    this.shadowRoot?.querySelector<HTMLButtonElement>(".trigger")?.focus();
  };

  #onDocumentPointerDown = (event: PointerEvent): void => {
    if (this.#open && !event.composedPath().includes(this)) this.#setOpen(false);
  };

  #onActionClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-share]");
    if (!button) return;
    const channel = button.dataset.share!;
    const url = this.getAttribute("url") ?? "";
    const title = this.getAttribute("title") ?? "Untitled";
    if (channel === "copy") {
      const write = navigator.clipboard?.writeText?.(url);
      if (write && typeof write.then === "function") {
        write.then(
          () => {
            this.#setStatus("Link copied");
            emit(this, "gk-share-copy", { url, success: true, source: this });
          },
          () => {
            this.#setStatus("Copy unavailable");
            emit(this, "gk-share-copy", { url, success: false, source: this });
          },
        );
      } else {
        this.#setStatus("Copy unavailable");
        emit(this, "gk-share-copy", { url, success: false, source: this });
      }
    } else {
      this.#setStatus(channel === "email" ? "Email draft prepared" : "Saved locally");
    }
    emit(this, "gk-share", { channel, title, url, source: this });
    this.#setOpen(false);
    this.shadowRoot?.querySelector<HTMLButtonElement>(".trigger")?.focus();
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".trigger-label")!.textContent = this.getAttribute("label") ?? "Share";
    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("title") ?? "Share this item";
    root.querySelector<HTMLElement>(".url")!.textContent = this.getAttribute("url") ?? "";
    this.#setStatus("");
  }
}

export const SHARE_ACTION_TAG = "gk-share-action";
