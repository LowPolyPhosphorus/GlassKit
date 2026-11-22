import { mountShadow } from "../base.js";

const styles = `
:host {
  display: inline-flex;
  align-items: center;
  color: var(--gk-color-text-muted);
  font-family: var(--gk-font-family);
  font-size: var(--gk-font-size-xs);
  font-weight: var(--gk-font-weight-medium);
  padding: 3px 8px;
  border-radius: var(--gk-radius-pill);
  border: 1px solid var(--gk-color-hairline);
  background: var(--gk-color-card);
}

:host([tone="accent"]) {
  color: var(--gk-color-text);
  background: var(--gk-color-accent-fill);
  border-color: var(--gk-color-accent-stroke);
}

:host([tone="success"]) { color: var(--gk-color-success); }
:host([tone="warning"]) { color: var(--gk-color-warning); }
:host([tone="danger"]) { color: var(--gk-color-danger); }
:host([dot])::before {
  content: "";
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: currentColor;
}
`;

export class Badge extends HTMLElement {
  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, "<slot></slot>", styles);
    }
  }
}

export const BADGE_TAG = "gk-badge";
