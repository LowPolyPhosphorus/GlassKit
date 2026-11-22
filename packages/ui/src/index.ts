import { defineElement } from "./base.js";
import {
  GLASS_BUTTON_TAG,
  GlassButton,
} from "./components/glass-button.js";
import {
  GLASS_PANEL_TAG,
  GlassPanel,
} from "./components/glass-panel.js";
import {
  GLASS_TOGGLE_TAG,
  GlassToggle,
} from "./components/glass-toggle.js";
import {
  LIST_ROW_TAG,
  ListRow,
} from "./components/list-row.js";
import {
  SEGMENTED_CONTROL_TAG,
  SegmentedControl,
} from "./components/segmented-control.js";

export {
  GLASS_BUTTON_TAG,
  GLASS_PANEL_TAG,
  GLASS_TOGGLE_TAG,
  LIST_ROW_TAG,
  SEGMENTED_CONTROL_TAG,
};
export { GlassButton, GlassPanel, GlassToggle, ListRow, SegmentedControl };

let installed = false;

/** Register every Glass Kit element. Safe to call more than once. */
export function installGlassKit(): void {
  if (installed) return;
  installed = true;
  defineElement(GLASS_PANEL_TAG, GlassPanel);
  defineElement(GLASS_BUTTON_TAG, GlassButton);
  defineElement(GLASS_TOGGLE_TAG, GlassToggle);
  defineElement(SEGMENTED_CONTROL_TAG, SegmentedControl);
  defineElement(LIST_ROW_TAG, ListRow);
}
