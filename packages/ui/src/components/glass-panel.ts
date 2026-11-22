import { mountShadow } from "../base.js";

const styles = `
:host {
  display: block;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  color: var(--gk-color-text);
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-sm);
  background: var(--gk-color-glass-regular);
  border: 1px solid var(--gk-color-hairline);
  border-radius: var(--gk-radius-md);
  box-shadow: 0 12px 40px var(--gk-color-shadow);
}

:host([elevation="flat"]) {
  box-shadow: none;
  border-color: transparent;
}

:host([elevation="high"]) {
  box-shadow: 0 24px 80px var(--gk-color-shadow);
}

:host([tone="thin"]) { background: var(--gk-color-glass-thin); }
:host([tone="thick"]) { background: var(--gk-color-glass-thick); }

/* Specular edge only. Real blur comes from glasskit-material at the HWND level. */
:host::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  background: linear-gradient(180deg, var(--gk-color-specular), transparent 38%);
  opacity: 0.5;
}

.surface {
  position: relative;
  z-index: 1;
  height: 100%;
}
`;

export class GlassPanel extends HTMLElement {
  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, '<div class="surface"><slot></slot></div>', styles);
    }
  }
}

export const GLASS_PANEL_TAG = "gk-glass-panel";
