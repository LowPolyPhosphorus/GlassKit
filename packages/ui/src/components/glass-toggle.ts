import { mountShadow } from "../base.js";
import { emit } from "../shared.js";

const styles = `
:host { display: inline-flex; align-items: center; }

button {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gk-color-text);
  font: inherit;
  cursor: pointer;
}

button:disabled { opacity: 0.45; cursor: default; }
button:focus-visible { outline: 2px solid var(--gk-color-accent); outline-offset: 2px; border-radius: 6px; }

.control { position: relative; flex: none; display: inline-block; }

.label { color: var(--gk-color-text); font-size: var(--gk-font-size-sm); }

/* Switch */
:host([variant="switch"]) .control,
:host(:not([variant])) .control {
  width: 38px;
  height: 22px;
  border: 1px solid var(--gk-color-hairline);
  border-radius: 999px;
  background: var(--gk-color-card);
  transition: background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

:host([variant="switch"]) button.is-on .control,
:host(:not([variant])) button.is-on .control {
  border-color: var(--gk-color-accent);
  background: var(--gk-color-accent);
}

:host([variant="switch"]) .thumb,
:host(:not([variant])) .thumb {
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

:host([variant="switch"]) button.is-on .thumb,
:host(:not([variant])) button.is-on .thumb { transform: translateX(16px); }

:host([size="mini"]) .control { width: 30px; height: 17px; }
:host([size="mini"]) .thumb { width: 12px; height: 12px; }
:host([size="mini"]) button.is-on .thumb { transform: translateX(13px); }

/* Checkbox */
:host([variant="checkbox"]) .control {
  width: 16px;
  height: 16px;
  border: 1px solid var(--gk-color-hairline);
  border-radius: 4px;
  background: var(--gk-color-card);
}

:host([variant="checkbox"]) button.is-on .control,
:host([variant="checkbox"]) button.is-mixed .control {
  border-color: var(--gk-color-accent);
  background: var(--gk-color-accent);
}

:host([variant="checkbox"]) .thumb {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

:host([variant="checkbox"]) .thumb::before { content: ""; }
:host([variant="checkbox"]) button.is-on .thumb::before { content: "✓"; }
:host([variant="checkbox"]) button.is-mixed .thumb::before { content: "–"; }

/* Radio */
:host([variant="radio"]) .control {
  width: 16px;
  height: 16px;
  border: 1px solid var(--gk-color-hairline);
  border-radius: 50%;
  background: var(--gk-color-card);
}

:host([variant="radio"]) button.is-on .control { border-color: var(--gk-color-accent); }

:host([variant="radio"]) .thumb {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: transparent;
  box-shadow: none;
}

:host([variant="radio"]) button.is-on .thumb { background: var(--gk-color-accent); }
`;

export class GlassToggle extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["checked", "disabled", "label", "variant", "state", "size"];
  }

  #button: HTMLButtonElement | null = null;

  get checked(): boolean {
    return this.hasAttribute("checked") || this.getAttribute("state") === "on";
  }

  set checked(value: boolean) {
    this.toggleAttribute("checked", value);
    this.setAttribute("state", value ? "on" : "off");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    this.toggleAttribute("disabled", value);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(
        this,
        '<button type="button"><span class="control"><span class="thumb"></span></span><span class="label"></span></button>',
        styles,
      );
      this.#button = this.shadowRoot!.querySelector("button");
      this.#button!.addEventListener("click", () => {
        if (this.disabled) return;
        const next = !this.checked;
        this.checked = next;
        emit(this, "gk-change", { checked: next, value: next });
      });
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.#button) return;
    const variant = this.getAttribute("variant") ?? "switch";
    const state = this.getAttribute("state") ?? (this.checked ? "on" : "off");
    const on = state === "on";
    const mixed = state === "mixed";
    this.#button.classList.toggle("is-on", on);
    this.#button.classList.toggle("is-mixed", mixed);
    this.#button.disabled = this.disabled;
    this.#button.setAttribute("role", variant === "switch" ? "switch" : variant === "checkbox" ? "checkbox" : "radio");
    this.#button.setAttribute("aria-checked", mixed ? "mixed" : String(on));
    this.#button.setAttribute("aria-label", this.getAttribute("label") ?? "Toggle");
    this.shadowRoot!.querySelector(".label")!.textContent = this.getAttribute("label") ?? "";
  }
}

export const GLASS_TOGGLE_TAG = "gk-toggle";
