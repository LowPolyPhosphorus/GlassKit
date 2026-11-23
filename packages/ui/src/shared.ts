/** Internal helpers shared by Glass Kit components. */

export function emit<T>(host: HTMLElement, name: string, detail: T): void {
  host.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }));
}

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item));
  } catch {
    // Fall through to comma-separated parsing.
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseItems<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function toNumber(value: string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function slotHasContent(root: ShadowRoot, name: string): boolean {
  const slot = name
    ? root.querySelector<HTMLSlotElement>(`slot[name="${name}"]`)
    : root.querySelector<HTMLSlotElement>("slot:not([name])");
  if (!slot) return false;
  return slot.assignedNodes().some((node) => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").trim().length > 0;
    return true;
  });
}

export const componentBaseCss = `
  :host {
    color: var(--gk-color-text);
    font-family: var(--gk-font-family);
    font-size: var(--gk-font-size-md);
  }

  button {
    font: inherit;
    font-family: var(--gk-font-family);
  }

  :focus-visible {
    outline: 2px solid var(--gk-color-accent);
    outline-offset: 2px;
  }
`;
