import { mountShadow } from "../base.js";

const styles = `
:host {
  display: block;
  color: var(--gk-color-text);
  font-family: var(--gk-font-family);
}

.row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--gk-space-3);
  min-height: 44px;
  padding: 8px 10px;
  border-radius: var(--gk-radius-sm);
  background: var(--gk-color-card);
  border: 1px solid transparent;
  transition:
    background var(--gk-motion-duration-fast) var(--gk-motion-ease-standard),
    border-color var(--gk-motion-duration-fast) var(--gk-motion-ease-standard);
}

:host([interactive]) .row { cursor: pointer; }
:host([interactive]:hover) .row {
  background: var(--gk-color-card-hover);
  border-color: var(--gk-color-hairline);
}

.leading, .trailing { display: flex; align-items: center; }
.content { min-width: 0; font-size: var(--gk-font-size-md); }
.subtitle {
  margin-top: 2px;
  color: var(--gk-color-text-muted);
  font-size: var(--gk-font-size-xs);
}

:host(:not([subtitle])) .subtitle { display: none; }
`;

export class ListRow extends HTMLElement {
  connectedCallback(): void {
    if (!this.shadowRoot) {
      const html = `
        <div class="row" part="row">
          <span class="leading"><slot name="leading"></slot></span>
          <span class="content">
            <slot></slot>
            <span class="subtitle"><slot name="subtitle"></slot></span>
          </span>
          <span class="trailing"><slot name="trailing"></slot></span>
        </div>`;
      mountShadow(this, html, styles);
    }
  }
}

export const LIST_ROW_TAG = "gk-list-row";
