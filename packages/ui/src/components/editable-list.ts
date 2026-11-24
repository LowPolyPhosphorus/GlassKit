import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface ListEntry {
  label: string;
  value: string;
  detail?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .list {
    overflow: hidden;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    padding: 7px 10px;
    border-bottom: 1px solid var(--gk-color-hairline);
  }

  .title {
    min-width: 0;
    overflow: hidden;
    font-size: var(--gk-font-size-sm);
    font-weight: var(--gk-font-weight-semibold);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .count {
    padding: 2px 7px;
    border-radius: var(--gk-radius-pill);
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-text-muted);
    font-size: 10px;
  }

  .rows { display: grid; padding: 6px; }

  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 7px 8px;
    border-radius: var(--gk-radius-sm);
  }
  .row + .row { margin-top: 2px; }
  .row:hover { background: var(--gk-color-card-hover); }

  .text { min-width: 0; }
  .label { display: block; overflow-wrap: anywhere; font-size: var(--gk-font-size-sm); }
  .detail { display: block; margin-top: 2px; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
  .detail:empty { display: none; }

  .actions { display: flex; gap: 2px; }
  .actions[hidden] { display: none; }
  .actions button {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
  }
  .actions button:hover { border-color: var(--gk-color-hairline); background: var(--gk-color-glass-thin); color: var(--gk-color-text); }
  .actions button[data-action="delete"]:hover { color: var(--gk-color-danger); }

  .empty {
    padding: 16px;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-sm);
    text-align: center;
  }
`;

const html = `
  <div class="list" part="list">
    <div class="bar">
      <span class="title" part="title"></span>
      <span class="count" part="count"></span>
      <gk-button size="small" data-action="edit">Edit</gk-button>
    </div>
    <div class="rows" part="rows" role="list"></div>
  </div>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class EditableList extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items", "editing"];
  }

  #items: ListEntry[] = [];

  get value(): ListEntry[] {
    return this.#items.map((item) => ({ ...item }));
  }

  set value(next: ListEntry[]) {
    this.setAttribute("items", JSON.stringify(next));
  }

  get editing(): boolean {
    return this.hasAttribute("editing");
  }

  set editing(next: boolean) {
    this.toggleAttribute("editing", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.addEventListener("gk-activate", this.#onActivate);
      this.shadowRoot!.querySelector<HTMLElement>(".rows")!.addEventListener("click", this.#onRowAction);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #normalise(): ListEntry[] {
    return parseItems<ListEntry>(this.getAttribute("items")).map((item, index) =>
      typeof item === "string"
        ? { label: item, value: item }
        : {
            label: String(item.label ?? item.value ?? `Item ${index + 1}`),
            value: String(item.value ?? item.label ?? index),
            detail: item.detail ? String(item.detail) : undefined,
          },
    );
  }

  #onActivate = (event: Event): void => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (!target) return;
    if (target.dataset.action !== "edit") return;
    this.editing = !this.editing;
    emit(this, "gk-edit-change", { editing: this.editing, source: this });
  };

  #onRowAction = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
    if (!button) return;
    const row = button.closest<HTMLElement>(".row")!;
    const index = Number(row.dataset.index);
    const action = button.dataset.action;
    const next = this.#items.map((item) => ({ ...item }));

    if (action === "delete") {
      const [removed] = next.splice(index, 1);
      this.value = next;
      emit(this, "gk-delete", { value: removed?.value ?? "", index, items: next, source: this });
      return;
    }

    const to = action === "up" ? index - 1 : index + 1;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to]!, next[index]!];
    this.value = next;
    emit(this, "gk-move", { value: next[to]?.value ?? "", from: index, to, items: next, source: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    this.#items = this.#normalise();

    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("label") ?? "Items";
    root.querySelector<HTMLElement>(".count")!.textContent = `${this.#items.length}`;
    root.querySelector<HTMLElement>(".rows")!.innerHTML = this.#items.length
      ? this.#items
          .map(
            (item, index) => `<div class="row" role="listitem" data-index="${index}">
              <div class="text">
                <span class="label">${esc(item.label)}</span>
                <span class="detail">${esc(item.detail ?? "")}</span>
              </div>
              <div class="actions"${this.editing ? "" : " hidden"}>
                <button type="button" data-action="up" aria-label="Move ${esc(item.label)} up"${index === 0 ? " disabled" : ""}>↑</button>
                <button type="button" data-action="down" aria-label="Move ${esc(item.label)} down"${index === this.#items.length - 1 ? " disabled" : ""}>↓</button>
                <button type="button" data-action="delete" aria-label="Delete ${esc(item.label)}">×</button>
              </div>
            </div>`,
          )
          .join("")
      : `<p class="empty">No items yet</p>`;

    const edit = root.querySelector<HTMLElement>('[data-action="edit"]')!;
    edit.textContent = this.editing ? "Done" : "Edit";
  }
}

export const EDITABLE_LIST_TAG = "gk-editable-list";
