import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface ConfirmationAction {
  label: string;
  style?: "default" | "destructive" | "cancel";
  value?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; }

  .trigger {
    min-height: 30px;
    padding: 6px 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    cursor: pointer;
    font: inherit;
    font-size: var(--gk-font-size-sm);
  }
  .trigger:hover { background: var(--gk-color-card-hover); }

  .overlay {
    position: fixed;
    z-index: 210;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.48);
  }
  .overlay[hidden] { display: none !important; }

  .dialog {
    width: min(360px, 100%);
    padding: 18px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-lg);
    background: var(--gk-color-card);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.36);
  }

  h2 { margin: 0; font-size: var(--gk-font-size-lg); letter-spacing: var(--gk-font-tracking-tight); }
  p { margin: 8px 0 0; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-sm); line-height: 1.55; }
  p:empty { display: none; }

  .actions { display: grid; gap: 7px; margin-top: 18px; }
  .action {
    min-height: 34px;
    padding: 7px 14px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-text);
    cursor: pointer;
    font: inherit;
    font-size: var(--gk-font-size-sm);
    font-weight: var(--gk-font-weight-medium);
  }
  .action:hover { background: var(--gk-color-card-hover); }
  .action[data-style="destructive"] {
    border-color: var(--gk-color-danger);
    background: rgba(255, 69, 58, 0.16);
    color: var(--gk-color-danger);
  }
  .action[data-style="cancel"] { border-color: transparent; background: transparent; }
  .action:focus-visible { outline: 2px solid var(--gk-color-accent); outline-offset: 2px; }
`;

const html = `
  <button type="button" class="trigger" part="trigger"></button>
  <div class="overlay" part="overlay" hidden>
    <div class="dialog" part="dialog" role="dialog" aria-modal="true">
      <h2 class="title" part="title"></h2>
      <p class="message" part="message"></p>
      <div class="actions" part="actions"></div>
    </div>
  </div>`;

let nextDialogId = 0;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class ConfirmationDialog extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["title", "message", "trigger-label", "actions", "open"];
  }

  #trigger: HTMLButtonElement | null = null;
  #overlay: HTMLElement | null = null;
  #wasOpen = false;
  #dialogId = `gk-confirm-${++nextDialogId}`;

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(next: boolean) {
    this.toggleAttribute("open", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#trigger = this.shadowRoot!.querySelector<HTMLButtonElement>(".trigger");
      this.#overlay = this.shadowRoot!.querySelector<HTMLElement>(".overlay");
      this.#trigger!.addEventListener("click", () => this.show());
      this.#overlay!.addEventListener("click", this.#onBackdrop);
      this.shadowRoot!.querySelector<HTMLElement>(".dialog")!.addEventListener("keydown", this.#onDialogKeydown);
    }
    document.addEventListener("keydown", this.#onDocumentKeydown);
    this.#sync();
  }

  disconnectedCallback(): void {
    document.removeEventListener("keydown", this.#onDocumentKeydown);
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  show(): void {
    this.open = true;
    emit(this, "gk-open", { source: this });
  }

  close(reason: "dismiss" | "action" = "dismiss"): void {
    if (!this.open) return;
    this.open = false;
    this.#trigger?.focus();
    emit(this, "gk-close", { reason, source: this });
  }

  #onBackdrop = (event: MouseEvent): void => {
    if (event.target === this.#overlay) {
      emit(this, "gk-dismiss", { source: this });
      this.close("dismiss");
    }
  };

  #onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.open) {
      event.preventDefault();
      emit(this, "gk-dismiss", { source: this });
      this.close("dismiss");
    }
  };

  #onDialogKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Tab" || !this.shadowRoot) return;
    const buttons = Array.from(this.shadowRoot.querySelectorAll<HTMLButtonElement>(".action"));
    if (!buttons.length) return;
    const first = buttons[0]!;
    const last = buttons[buttons.length - 1]!;
    const current = buttons.indexOf(this.shadowRoot.activeElement as HTMLButtonElement);
    if (event.shiftKey && current <= 0) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === -1 || current === buttons.length - 1)) {
      event.preventDefault();
      first.focus();
    }
  };

  #onAction = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".action");
    if (!button) return;
    const style = button.dataset.style ?? "default";
    const value = button.dataset.value ?? button.textContent?.trim() ?? "";
    emit(this, style === "cancel" ? "gk-cancel" : "gk-confirm", {
      value,
      label: button.textContent?.trim() ?? value,
      style,
      source: this,
    });
    this.close("action");
  };

  #sync(): void {
    if (!this.shadowRoot || !this.#trigger || !this.#overlay) return;
    const root = this.shadowRoot;
    const title = this.getAttribute("title") ?? "Are you sure?";

    this.#trigger.textContent = this.getAttribute("trigger-label") ?? "Show choices";
    root.querySelector<HTMLElement>(".title")!.textContent = title;
    root.querySelector<HTMLElement>(".message")!.textContent = this.getAttribute("message") ?? "";
    const dialog = root.querySelector<HTMLElement>(".dialog")!;
    dialog.setAttribute("aria-labelledby", `${this.#dialogId}-title`);
    dialog.setAttribute("aria-describedby", `${this.#dialogId}-message`);
    root.querySelector<HTMLElement>(".title")!.id = `${this.#dialogId}-title`;
    root.querySelector<HTMLElement>(".message")!.id = `${this.#dialogId}-message`;
    dialog.setAttribute("aria-label", title);

    const actions = parseItems<ConfirmationAction>(this.getAttribute("actions"));
    const actionHost = root.querySelector<HTMLElement>(".actions")!;
    actionHost.innerHTML = actions.length
      ? actions
          .map((action, index) => {
            const label = String(action.label ?? `Action ${index + 1}`);
            const style = action.style === "destructive" || action.style === "cancel" ? action.style : "default";
            return `<button type="button" class="action" data-style="${style}"
              data-value="${esc(String(action.value ?? label))}">${esc(label)}</button>`;
          })
          .join("")
      : `<button type="button" class="action" data-style="cancel" data-value="Cancel">Cancel</button>`;
    actionHost.querySelectorAll<HTMLButtonElement>(".action").forEach((button) => {
      button.addEventListener("click", this.#onAction);
    });

    this.#overlay.hidden = !this.open;
    if (this.open && !this.#wasOpen) {
      (actionHost.querySelector<HTMLButtonElement>(".action:not([data-style='cancel'])") ??
        actionHost.querySelector<HTMLButtonElement>(".action"))?.focus();
    }
    this.#wasOpen = this.open;
  }
}

export const CONFIRMATION_DIALOG_TAG = "gk-confirmation-dialog";
