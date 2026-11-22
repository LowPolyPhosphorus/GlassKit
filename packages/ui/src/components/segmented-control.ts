import { mountShadow } from "../base.js";

const styles = `
:host { display: block; }

.control {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: var(--gk-radius-sm);
  background: var(--gk-color-glass-thin);
  border: 1px solid var(--gk-color-hairline);
}

::slotted([value]) {
  appearance: none;
  flex: 1;
  min-width: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--gk-color-text-muted);
  font: inherit;
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-xs);
  font-weight: var(--gk-font-weight-medium);
  padding: 6px 10px;
  cursor: pointer;
  transition:
    background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    color var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

::slotted([value]:hover) { color: var(--gk-color-text); }

::slotted([value].is-active) {
  background: var(--gk-color-card-hover);
  color: var(--gk-color-text);
  box-shadow: 0 1px 3px var(--gk-color-shadow);
}

::slotted([value]:focus-visible) {
  outline: 2px solid var(--gk-color-accent);
  outline-offset: -2px;
}
`;

export class SegmentedControl extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["value"];
  }

  #onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const option = target.closest<HTMLElement>("[value]");
    if (!option || !this.contains(option)) return;
    const value = option.getAttribute("value");
    if (value !== null && value !== this.value) {
      this.value = value;
      this.#emit();
    }
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const options = this.#options();
    if (options.length === 0) return;
    const current = options.findIndex((option) => option.getAttribute("value") === this.value);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = options[(Math.max(current, 0) + step + options.length) % options.length]!;
    event.preventDefault();
    this.value = next.getAttribute("value") ?? "";
    next.focus();
    this.#emit();
  };

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, '<div class="control" role="tablist"><slot></slot></div>', styles);
      this.addEventListener("click", this.#onClick);
      this.addEventListener("keydown", this.#onKeyDown);
      this.shadowRoot!.querySelector("slot")!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #options(): HTMLElement[] {
    return Array.from(this.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute("value"),
    );
  }

  #sync(): void {
    for (const option of this.#options()) {
      const active = option.getAttribute("value") === this.value;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-selected", String(active));
      if (!option.hasAttribute("role")) option.setAttribute("role", "tab");
    }
  }

  #emit(): void {
    this.dispatchEvent(
      new CustomEvent("gk-change", {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  }
}

export const SEGMENTED_CONTROL_TAG = "gk-segmented";
