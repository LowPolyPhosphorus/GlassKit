import { mountShadow } from "../base.js";

const styles = `
:host { display: block; }

.control {
  position: relative;
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: var(--gk-radius-sm);
  background: var(--gk-color-glass-thin);
  border: 1px solid var(--gk-color-hairline);
  isolation: isolate;
}

.indicator {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 0;
  width: 0;
  z-index: 0;
  border-radius: 6px;
  background: var(--gk-color-card-hover);
  box-shadow: 0 1px 3px var(--gk-color-shadow);
  opacity: 0;
  pointer-events: none;
  transform: translateX(0);
  transition:
    transform var(--gk-motion-duration-base) var(--gk-motion-ease-emphasized),
    width var(--gk-motion-duration-base) var(--gk-motion-ease-emphasized),
    opacity var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

.indicator.is-visible { opacity: 1; }

::slotted([value]) {
  position: relative;
  z-index: 1;
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
  transition: color var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

::slotted([value]:hover) { color: var(--gk-color-text); }

::slotted([value].is-active) {
  background: transparent;
  color: var(--gk-color-text);
  box-shadow: none;
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

  #control: HTMLElement | null = null;
  #indicator: HTMLElement | null = null;
  #resizeObserver: ResizeObserver | null = null;

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

  #onResize = (): void => this.#positionIndicator();

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(
        this,
        '<div class="control" role="tablist"><span class="indicator" aria-hidden="true"></span><slot></slot></div>',
        styles,
      );
      this.#control = this.shadowRoot!.querySelector<HTMLElement>(".control");
      this.#indicator = this.shadowRoot!.querySelector<HTMLElement>(".indicator");
      this.addEventListener("click", this.#onClick);
      this.addEventListener("keydown", this.#onKeyDown);
      window.addEventListener("resize", this.#onResize);
      this.shadowRoot!.querySelector("slot")!.addEventListener("slotchange", () => this.#sync());

      if (typeof ResizeObserver !== "undefined") {
        this.#resizeObserver = new ResizeObserver(() => this.#positionIndicator());
        this.#resizeObserver.observe(this);
      }
    }

    this.#sync(true);
  }

  disconnectedCallback(): void {
    window.removeEventListener("resize", this.#onResize);
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
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

  #sync(selectFirst = false): void {
    const options = this.#options();
    if (selectFirst && !this.value && options[0]) {
      const first = options[0].getAttribute("value");
      if (first !== null) this.setAttribute("value", first);
    }

    for (const option of options) {
      const active = option.getAttribute("value") === this.value;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-selected", String(active));
      if (!option.hasAttribute("role")) option.setAttribute("role", "tab");
    }

    requestAnimationFrame(() => this.#positionIndicator());
  }

  #positionIndicator(): void {
    if (!this.#control || !this.#indicator) return;
    const active = this.#options().find((option) => option.getAttribute("value") === this.value);
    if (!active) {
      this.#indicator.classList.remove("is-visible");
      this.#indicator.style.width = "0px";
      return;
    }

    const controlRect = this.#control.getBoundingClientRect();
    const optionRect = active.getBoundingClientRect();
    this.#indicator.style.width = `${Math.max(0, optionRect.width)}px`;
    this.#indicator.style.transform = `translateX(${optionRect.left - controlRect.left}px)`;
    this.#indicator.classList.add("is-visible");
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
