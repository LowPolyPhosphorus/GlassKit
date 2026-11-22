import { mountShadow } from "../base.js";

const styles = `
:host { display: inline-flex; align-items: center; }

button {
  appearance: none;
  position: relative;
  width: 38px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--gk-color-hairline);
  border-radius: var(--gk-radius-pill);
  background: var(--gk-color-card);
  cursor: pointer;
  transition: background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

button.is-checked {
  background: var(--gk-color-accent);
  border-color: var(--gk-color-accent);
}

button:focus-visible {
  outline: 2px solid var(--gk-color-accent);
  outline-offset: 2px;
}

button:disabled { opacity: 0.45; cursor: default; }

.thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px var(--gk-color-shadow);
  transition: transform var(--gk-motion-duration-base) var(--gk-motion-ease-emphasized);
}

button.is-checked .thumb { transform: translateX(16px); }
`;

export class GlassToggle extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["checked", "disabled", "label"];
  }

  #button: HTMLButtonElement | null = null;
  #onClick = (): void => {
    if (this.hasAttribute("disabled")) return;
    const checked = !this.checked;
    this.checked = checked;
    this.dispatchEvent(
      new CustomEvent("gk-change", {
        bubbles: true,
        composed: true,
        detail: { checked },
      }),
    );
  };

  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean) {
    this.toggleAttribute("checked", value);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    this.toggleAttribute("disabled", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, '<button type="button" role="switch"><span class="thumb"></span></button>', styles);
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
    this.#button.classList.toggle("is-checked", this.checked);
    this.#button.disabled = this.disabled;
    this.#button.setAttribute("aria-checked", String(this.checked));
    this.#button.setAttribute("aria-label", this.getAttribute("label") ?? "Toggle");
  }
}

export const GLASS_TOGGLE_TAG = "gk-toggle";
