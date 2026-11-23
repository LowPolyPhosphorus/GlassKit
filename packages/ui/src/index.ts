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
import { BOX_TAG, Box } from "./components/box.js";
import { DISCLOSURE_TAG, Disclosure } from "./components/disclosure.js";
import { LABEL_TAG, Label } from "./components/label.js";
import { COLLECTION_TAG, Collection } from "./components/collection.js";
import { COLUMN_VIEW_TAG, ColumnView } from "./components/column-view.js";
import { SEARCH_FIELD_TAG, SearchField } from "./components/search-field.js";
import { PATH_CONTROL_TAG, PathControl } from "./components/path-control.js";
import { TAB_BAR_TAG, TabBar } from "./components/tab-bar.js";
import { TOKEN_FIELD_TAG, TokenField } from "./components/token-field.js";
import { SIDEBAR_TAG, Sidebar } from "./components/sidebar.js";
import { SIDEBAR_ITEM_TAG, SidebarItem } from "./components/sidebar-item.js";
import { STATUS_BAR_TAG, StatusBar } from "./components/status-bar.js";
import { CONTROL_TILE_TAG, ControlTile } from "./components/control-tile.js";
import { NOTIFICATION_TAG, NotificationCard } from "./components/notification.js";
import { LIVE_ACTIVITY_TAG, LiveActivity } from "./components/live-activity.js";
import { SNIPPET_TAG, Snippet } from "./components/snippet.js";
import { IMAGE_VIEW_TAG, ImageView } from "./components/image-view.js";
import { CHART_TAG, Chart } from "./components/chart.js";
import { WEB_VIEW_TAG, WebView } from "./components/web-view.js";

export {
  BADGE_TAG,
  BOX_TAG,
  CHART_TAG,
  COLLECTION_TAG,
  COLUMN_VIEW_TAG,
  CONTROL_TILE_TAG,
  DISCLOSURE_TAG,
  GLASS_BUTTON_TAG,
  GLASS_PANEL_TAG,
  GLASS_TOGGLE_TAG,
  IMAGE_VIEW_TAG,
  LABEL_TAG,
  LIVE_ACTIVITY_TAG,
  LIST_ROW_TAG,
  NOTIFICATION_TAG,
  PATH_CONTROL_TAG,
  SEARCH_FIELD_TAG,
  SEGMENTED_CONTROL_TAG,
  SIDEBAR_ITEM_TAG,
  SIDEBAR_TAG,
  SLIDER_TAG,
  SNIPPET_TAG,
  STATUS_BAR_TAG,
  TAB_BAR_TAG,
  TEXT_FIELD_TAG,
  TOKEN_FIELD_TAG,
  TOOLBAR_TAG,
  WEB_VIEW_TAG,
};
export {
  Badge,
  Box,
  Chart,
  Collection,
  ColumnView,
  ControlTile,
  Disclosure,
  GlassButton,
  GlassPanel,
  GlassToggle,
  ImageView,
  Label,
  LiveActivity,
  ListRow,
  NotificationCard,
  PathControl,
  SearchField,
  SegmentedControl,
  Sidebar,
  SidebarItem,
  Slider,
  Snippet,
  StatusBar,
  TabBar,
  TextField,
  TokenField,
  Toolbar,
  WebView,
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
  defineElement(BOX_TAG, Box);
  defineElement(DISCLOSURE_TAG, Disclosure);
  defineElement(LABEL_TAG, Label);
  defineElement(COLLECTION_TAG, Collection);
  defineElement(COLUMN_VIEW_TAG, ColumnView);
  defineElement(SEARCH_FIELD_TAG, SearchField);
  defineElement(PATH_CONTROL_TAG, PathControl);
  defineElement(TAB_BAR_TAG, TabBar);
  defineElement(TOKEN_FIELD_TAG, TokenField);
  defineElement(SIDEBAR_ITEM_TAG, SidebarItem);
  defineElement(SIDEBAR_TAG, Sidebar);
  defineElement(STATUS_BAR_TAG, StatusBar);
  defineElement(CONTROL_TILE_TAG, ControlTile);
  defineElement(NOTIFICATION_TAG, NotificationCard);
  defineElement(LIVE_ACTIVITY_TAG, LiveActivity);
  defineElement(SNIPPET_TAG, Snippet);
  defineElement(IMAGE_VIEW_TAG, ImageView);
  defineElement(CHART_TAG, Chart);
  defineElement(WEB_VIEW_TAG, WebView);
}
