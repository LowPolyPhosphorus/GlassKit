import { animateRecipe } from "@glasskit/motion";

const ROOM_COPY: Record<string, { title: string; subtitle: string }> = {
  living: { title: "Living Room", subtitle: "6 devices · 3 active" },
  kitchen: { title: "Kitchen", subtitle: "4 devices · 2 active" },
  climate: { title: "Climate", subtitle: "Whole home · Comfort mode" },
  security: { title: "Security", subtitle: "3 zones · Armed home" },
  patterns: { title: "HIG patterns", subtitle: "Layout, navigation, status, and media" },
  recipes: { title: "Recipes", subtitle: "Every input pattern in one workflow" },
  atlas: { title: "All components", subtitle: "Every element in the Glass Kit registry" },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function eventValue(event: Event): unknown {
  if (!(event instanceof CustomEvent) || !event.detail || typeof event.detail !== "object") return undefined;
  const detail = event.detail as Record<string, unknown>;
  return detail.value ?? detail.checked ?? detail.scope ?? detail.state ?? detail.token ?? detail.label ?? detail.id ?? detail.key ?? detail.href ?? detail.action ?? detail.title ?? detail.from ?? detail.to ?? detail.all;
}

export function initDesktopLab(): void {
  const canvas = document.querySelector<HTMLElement>("[data-desktop-lab]");
  if (!canvas) return;

  const win = canvas.querySelector<HTMLElement>("[data-lab-window]");
  const dragHandle = canvas.querySelector<HTMLElement>("[data-drag-handle]");
  const resizeHandle = canvas.querySelector<HTMLElement>("[data-resize-handle]");
  const restore = canvas.querySelector<HTMLButtonElement>("[data-restore]");
  if (!win || !dragHandle || !resizeHandle) return;

  const status = canvas.querySelector<HTMLElement>("[data-lab-status]");
  const setStatus = (text: string): void => {
    if (status) status.textContent = text;
  };

  let drag: { x: number; y: number; left: number; top: number } | null = null;
  let size: { x: number; y: number; width: number; height: number } | null = null;

  const normalisePosition = (): void => {
    const rect = win.getBoundingClientRect();
    const parent = canvas.getBoundingClientRect();
    win.style.transform = "none";
    win.style.left = `${rect.left - parent.left}px`;
    win.style.top = `${rect.top - parent.top}px`;
  };

  dragHandle.addEventListener("pointerdown", (event) => {
    if ((event.target as HTMLElement).closest("button")) return;
    normalisePosition();
    drag = {
      x: event.clientX,
      y: event.clientY,
      left: parseFloat(win.style.left) || 0,
      top: parseFloat(win.style.top) || 0,
    };
    win.classList.add("is-dragging");
    try {
      dragHandle.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is an enhancement; pointermove still works without it.
    }
  });

  dragHandle.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const parent = canvas.getBoundingClientRect();
    const left = clamp(drag.left + event.clientX - drag.x, 8, parent.width - win.offsetWidth - 8);
    const top = clamp(drag.top + event.clientY - drag.y, 8, parent.height - 46);
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
  });

  const endDrag = (): void => {
    drag = null;
    win.classList.remove("is-dragging");
  };
  dragHandle.addEventListener("pointerup", endDrag);
  dragHandle.addEventListener("pointercancel", endDrag);

  resizeHandle.addEventListener("pointerdown", (event) => {
    normalisePosition();
    size = {
      x: event.clientX,
      y: event.clientY,
      width: win.offsetWidth,
      height: win.offsetHeight,
    };
    win.classList.add("is-resizing");
    try {
      resizeHandle.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is an enhancement; pointermove still works without it.
    }
  });

  resizeHandle.addEventListener("pointermove", (event) => {
    if (!size) return;
    const parent = canvas.getBoundingClientRect();
    const left = parseFloat(win.style.left) || 0;
    const top = parseFloat(win.style.top) || 0;
    const width = clamp(size.width + event.clientX - size.x, 480, parent.width - left - 12);
    const height = clamp(size.height + event.clientY - size.y, 420, parent.height - top - 12);
    win.style.width = `${width}px`;
    win.style.height = `${height}px`;
  });

  const endResize = (): void => {
    size = null;
    win.classList.remove("is-resizing");
  };
  resizeHandle.addEventListener("pointerup", endResize);
  resizeHandle.addEventListener("pointercancel", endResize);

  for (const button of canvas.querySelectorAll<HTMLButtonElement>("[data-window-action]")) {
    button.addEventListener("click", () => {
      const action = button.dataset.windowAction;
      if (action === "close") {
        win.hidden = true;
        if (restore) restore.hidden = false;
        setStatus("Window closed");
      }
      if (action === "minimize") {
        win.classList.toggle("is-minimized");
        setStatus(win.classList.contains("is-minimized") ? "Window minimized" : "Window restored");
      }
      if (action === "maximize") {
        const parent = canvas.getBoundingClientRect();
        normalisePosition();
        const isMaximised = win.dataset.maximized === "true";
        if (isMaximised) {
          win.style.left = "40px";
          win.style.top = "66px";
          win.style.width = "min(940px, calc(100% - 80px))";
          win.style.height = "620px";
          win.dataset.maximized = "false";
        } else {
          win.style.left = "16px";
          win.style.top = "66px";
          win.style.width = `${parent.width - 32}px`;
          win.style.height = `${parent.height - 90}px`;
          win.dataset.maximized = "true";
        }
        setStatus(win.dataset.maximized === "true" ? "Window maximised" : "Window restored");
      }
    });
  }

  restore?.addEventListener("click", () => {
    win.hidden = false;
    restore.hidden = true;
    setStatus("Window reopened");
  });

  const roomTitle = canvas.querySelector<HTMLElement>("[data-room-title]");
  const roomSubtitle = canvas.querySelector<HTMLElement>("[data-room-subtitle]");
  for (const button of canvas.querySelectorAll<HTMLButtonElement>("[data-room]")) {
    button.addEventListener("click", () => {
      const room = button.dataset.room!;
      for (const other of canvas.querySelectorAll<HTMLButtonElement>("[data-room]")) {
        other.setAttribute("aria-current", String(other === button));
      }
      for (const panel of canvas.querySelectorAll<HTMLElement>("[data-room-panel]")) {
        panel.hidden = panel.dataset.roomPanel !== room;
      }
      const copy = ROOM_COPY[room];
      if (copy && roomTitle && roomSubtitle) {
        roomTitle.textContent = copy.title;
        roomSubtitle.textContent = copy.subtitle;
      }
      const panel = canvas.querySelector<HTMLElement>(`[data-room-panel="${room}"]`);
      if (panel) animateRecipe(panel, "panel-in");
      setStatus(`${room} view`);
    });
  }

  for (const name of [
    "gk-activate",
    "gk-change",
    "gk-input",
    "gk-open",
    "gk-close",
    "gk-select",
    "gk-navigate",
    "gk-scope-change",
    "gk-token-change",
    "gk-toggle",
    "gk-state-change",
    "gk-dismiss",
    "gk-expand-change",
    "gk-confirm",
    "gk-cancel",
    "gk-snippet-action",
    "gk-point-select",
    "gk-load",
    "gk-sort",
    "gk-reveal-change",
    "gk-submit",
    "gk-reset",
    "gk-delete",
    "gk-move",
    "gk-edit-change",
    "gk-control",
    "gk-outline-toggle",
    "gk-outline-select",
    "gk-group-action",
    "gk-copy",
    "gk-labeled-action",
    "gk-error",
  ]) {
    canvas.addEventListener(name, (event) => {
      const target = event.target as HTMLElement;
      const detail = event instanceof CustomEvent && event.detail ? (event.detail as Record<string, unknown>) : {};
      const label =
        target.getAttribute("label") ||
        target.textContent?.trim() ||
        (typeof detail.label === "string" ? detail.label : "") ||
        target.tagName.toLowerCase();
      const value = eventValue(event);
      setStatus(`${name.replace("gk-", "")} · ${label}${value === undefined ? "" : ` · ${value}`}`);
    });
  }

  const scene = canvas.querySelector<HTMLElement>("[data-scene]");
  scene?.addEventListener("gk-change", (event) => {
    const value = eventValue(event);
    setStatus(`Scene · ${value}`);
  });

  const nameField = canvas.querySelector<HTMLElement & { value: string }>("[data-new-device]");
  const addButton = canvas.querySelector<HTMLElement>("[data-add-device]");
  addButton?.addEventListener("gk-activate", () => {
    const name = (nameField?.value || nameField?.getAttribute("value") || "New device").trim();
    const panel = canvas.querySelector<HTMLElement>('[data-room-panel="living"]');
    if (!panel) return;

    const card = document.createElement("div");
    card.className = "device-card";
    const head = document.createElement("div");
    head.className = "device-head";
    const icon = document.createElement("span");
    icon.className = "device-icon";
    icon.innerHTML = '<svg class="icon" aria-hidden="true"><use href="/icons.svg#icon-plus"></use></svg>';
    const copy = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = name;
    const small = document.createElement("small");
    small.textContent = "Added just now";
    copy.append(strong, small);
    const toggle = document.createElement("gk-toggle") as HTMLElement & { checked: boolean };
    toggle.setAttribute("label", name);
    toggle.checked = true;
    head.append(icon, copy, toggle);
    card.append(head);
    panel.append(card);
    animateRecipe(card, "panel-in");
    setStatus(`Added · ${name}`);
  });

  const recipePanel = canvas.querySelector<HTMLElement>('[data-room-panel="recipes"]');
  const recipeStatus = recipePanel?.querySelector<HTMLElement>("[data-recipe-status]");
  const setRecipeStatus = (text: string): void => {
    if (recipeStatus) recipeStatus.textContent = text;
    setStatus(text);
  };

  recipePanel?.querySelector<HTMLElement>("[data-save-recipe]")?.addEventListener("gk-activate", () => {
    const nameField =
      recipePanel.querySelector<HTMLElement & { value?: string }>("gk-text-field") ??
      recipePanel.querySelector<HTMLElement & { value?: string }>("gk-text-editor");
    const date = recipePanel.querySelector<HTMLElement & { value?: string }>("gk-date-picker");
    const name = (nameField?.value || nameField?.getAttribute("value") || "Untitled recipe").trim();
    const starts = date?.value || date?.getAttribute("value") || "unscheduled";
    setRecipeStatus(`Saved · ${name} · ${starts}`);
  });

  recipePanel?.querySelector<HTMLElement>("[data-reset-recipe]")?.addEventListener("gk-activate", () => {
    for (const field of recipePanel.querySelectorAll<HTMLElement & { value?: string }>("gk-text-field, gk-text-editor")) {
      field.setAttribute("value", "");
      if (field.value !== undefined) field.value = "";
    }
    setRecipeStatus("Recipe reset");
  });
}
