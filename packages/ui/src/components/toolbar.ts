import { mountShadow } from "../base.js";

const styles = `
:host {
  display: block;
  font-family: var(--gk-font-family);
}

.bar {
  display: flex;
  align-items: center;
  gap: var(--gk-space-2);
  min-height: 44px;
  padding: 6px 8px;
  border-radius: var(--gk-radius-sm);
  border: 1px solid var(--gk-color-hairline);
  background: var(--gk-color-glass-thin);
}

.spacer { flex: 1; }
`;

export class Toolbar extends HTMLElement {
  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, '<div class="bar" role="toolbar"><slot></slot></div>', styles);
    }
  }
}

export const TOOLBAR_TAG = "gk-toolbar";
