import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface MenuItem {
  label?: string;
  detail?: string;
  value?: string;
  disabled?: boolean;
  separator?: boolean;
}

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; position: relative; }

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
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
  .chevron { color: var(--gk-color-text-muted); font-size: 10px; }

  .menu {
    position: absolute;
    z-index: 20;
    top: calc(100% + 6px);
    left: 0;
    display: grid;
    gap: 2px;
    min-width: 180px;
    padding: 5px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
  }

  .menu[hidden] { display: none !important; }

  .item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 18px;
    width: 100%;
    padding: 7px 9px;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: var(--gk-font-size-sm);
    text-align: left;
  }

  .item:hover:not(:disabled),
  .item:focus-visible { background: var(--gk-color-accent-fill); }
  .item:disabled { opacity: 0.42; cursor: default; }
  .detail { color: var(--gk-color-text-dim); font-size: 10px; }
  .separator { height: 1px; margin: 4px 2px; background: var(--gk-color-soft-hairline); }
`;

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const html = `
  <button type="button" class="trigger" part="trigger" aria-haspopup="menu" aria-expanded="false">
    <span class="trigger-label"></span><span class="chevron" aria-hidden="true">▾</span>
  </button>
  <div class="menu" part="menu" role="menu" hidden></div>`;

export class ActionMenu extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items", "disabled"];
  }

  #trigger: HTMLButtonElement | null = null;
  #menu: HTMLElement | null = null;
  #isOpen = false;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#trigger = this.shadowRoot!.querySelector<HTMLButtonElement>(".trigger");
      this.#menu = this.shadowRoot!.querySelector<HTMLElement>(".menu");
      this.#trigger!.addEventListener("click", this.#onTriggerClick);
      this.#trigger!.addEventListener("keydown", this.#onTriggerKeydown);
      this.#menu!.addEventListener("click", this.#onMenuClick);
      this.#menu!.addEventListener("keydown", this.#onMenuKeydown);
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

  #items(): MenuItem[] {
    return parseItems(this.getAttribute("items")).map((item) =>
      typeof item === "string" ? { label: item, value: item } : (item as MenuItem),
    );
  }

  #setOpen(open: boolean): void {
    this.#isOpen = open;
    if (!this.#menu || !this.#trigger || !this.shadowRoot) return;
    this.#menu.hidden = !open;
    this.#trigger.setAttribute("aria-expanded", String(open));
    if (open) this.#menu.querySelector<HTMLButtonElement>(".item:not(:disabled)")?.focus();
    emit(this, open ? "gk-open" : "gk-close", { source: this });
  }

  #onTriggerClick = (): void => {
    if (this.hasAttribute("disabled")) return;
    this.#setOpen(!this.#isOpen);
  };

  #onTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!this.#isOpen) this.#setOpen(true);
    }
  };

  #onMenuClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".item");
    if (!button || button.disabled) return;
    const index = Number(button.dataset.index ?? -1);
    const item = this.#items()[index];
    if (!item) return;
    const value = item.value ?? item.label ?? "";
    this.#setOpen(false);
    this.#trigger?.focus();
    emit(this, "gk-select", { value, label: item.label ?? value, item, source: this });
  };

  #onMenuKeydown = (event: KeyboardEvent): void => {
    const items = Array.from(this.#menu?.querySelectorAll<HTMLButtonElement>(".item:not(:disabled)") ?? []);
    const current = items.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      event.preventDefault();
      this.#setOpen(false);
      this.#trigger?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(current + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(current - 1 + items.length) % items.length]?.focus();
    }
  };

  #onDocumentPointerDown = (event: PointerEvent): void => {
    if (this.#isOpen && !this.contains(event.target as Node)) this.#setOpen(false);
  };

  #sync(): void {
    if (!this.shadowRoot || !this.#trigger || !this.#menu) return;
    this.#trigger.querySelector<HTMLElement>(".trigger-label")!.textContent = this.getAttribute("label") ?? "Actions";
    this.#trigger.disabled = this.hasAttribute("disabled");
    const items = this.#items();
    this.#menu.innerHTML = items
      .map((item, index) => {
        if (item.separator) return `<div class="separator" role="separator"></div>`;
        const label = esc(item.label ?? item.value ?? "Untitled");
        const detail = item.detail ? `<span class="detail">${esc(item.detail)}</span>` : "";
        return `<button type="button" class="item" role="menuitem" data-index="${index}" ${item.disabled ? "disabled" : ""}>${label}${detail}</button>`;
      })
      .join("");
    if (!this.#isOpen) this.#menu.hidden = true;
  }
}

export const ACTION_MENU_TAG = "gk-action-menu";
