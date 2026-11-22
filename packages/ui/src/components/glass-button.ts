import { mountShadow } from "../base.js";

const styles = `
:host { display: inline-flex; }

button {
  appearance: none;
  border: 1px solid var(--gk-color-hairline);
  border-radius: var(--gk-radius-sm);
  background: var(--gk-color-card);
  color: var(--gk-color-text);
  font: inherit;
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-sm);
  font-weight: var(--gk-font-weight-medium);
  letter-spacing: var(--gk-font-tracking-normal);
  padding: 8px 14px;
  cursor: pointer;
  transition:
    background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    transform var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    border-color var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

button:hover:not(:disabled) {
  background: var(--gk-color-card-hover);
  transform: translateY(-1px);
}

button:active:not(:disabled) { transform: translateY(0); }

button:focus-visible {
  outline: 2px solid var(--gk-color-accent);
  outline-offset: 2px;
}

button:disabled { opacity: 0.45; cursor: default; }

button[data-variant="primary"] {
  background: var(--gk-color-accent-fill);
  border-color: var(--gk-color-accent-stroke);
  color: var(--gk-color-text);
}

button[data-variant="primary"]:hover:not(:disabled) {
  background: var(--gk-color-accent);
  color: #fff;
}

button[data-variant="quiet"] {
  background: transparent;
  border-color: transparent;
}

button[data-size="small"] { padding: 5px 10px; font-size: var(--gk-font-size-xs); }
button[data-size="large"] { padding: 10px 18px; font-size: var(--gk-font-size-md); }
`;

export class GlassButton extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["variant", "size", "disabled"];
  }

  #button: HTMLButtonElement | null = null;
  #onClick = (): void => {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent("gk-activate", {
        bubbles: true,
        composed: true,
        detail: { source: this },
      }),
    );
  };

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    this.toggleAttribute("disabled", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, "<button type='button'><slot></slot></button>", styles);
      this.#button = this.shadowRoot!.querySelector("button");
      this.#button!.addEventListener("click", this.#onClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.#button) return;
    this.#button.disabled = this.disabled;
    this.#button.dataset.variant = this.getAttribute("variant") ?? "secondary";
    this.#button.dataset.size = this.getAttribute("size") ?? "medium";
  }
}

export const GLASS_BUTTON_TAG = "gk-button";
