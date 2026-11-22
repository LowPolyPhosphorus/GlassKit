import { defineElement } from "./base.js";
import { BADGE_TAG, Badge } from "./components/badge.js";
import { GLASS_BUTTON_TAG, GlassButton } from "./components/glass-button.js";
import { GLASS_PANEL_TAG, GlassPanel } from "./components/glass-panel.js";
import { GLASS_TOGGLE_TAG, GlassToggle } from "./components/glass-toggle.js";
import { LIST_ROW_TAG, ListRow } from "./components/list-row.js";
import { SEGMENTED_CONTROL_TAG, SegmentedControl } from "./components/segmented-control.js";
import { SLIDER_TAG, Slider } from "./components/slider.js";
import { TEXT_FIELD_TAG, TextField } from "./components/text-field.js";
import { TOOLBAR_TAG, Toolbar } from "./components/toolbar.js";

export {
  BADGE_TAG,
  GLASS_BUTTON_TAG,
  GLASS_PANEL_TAG,
  GLASS_TOGGLE_TAG,
  LIST_ROW_TAG,
  SEGMENTED_CONTROL_TAG,
  SLIDER_TAG,
  TEXT_FIELD_TAG,
  TOOLBAR_TAG,
};
export {
  Badge,
  GlassButton,
  GlassPanel,
  GlassToggle,
  ListRow,
  SegmentedControl,
  Slider,
  TextField,
  Toolbar,
};

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
  defineElement(TEXT_FIELD_TAG, TextField);
  defineElement(SLIDER_TAG, Slider);
  defineElement(BADGE_TAG, Badge);
  defineElement(TOOLBAR_TAG, Toolbar);
}
