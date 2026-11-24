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
import { ALERT_DIALOG_TAG, AlertDialog } from "./components/alert-dialog.js";
import { COLOR_PICKER_TAG, ColorPicker } from "./components/color-picker.js";
import { DATA_TABLE_TAG, DataTable } from "./components/data-table.js";
import { STEPPER_TAG, Stepper } from "./components/stepper.js";
import { VALUE_PICKER_TAG, ValuePicker } from "./components/value-picker.js";
import { WEB_LINK_TAG, WebLink } from "./components/web-link.js";
import { GRID_VIEW_TAG, GridView } from "./components/grid-view.js";
import { NAVIGATION_STACK_TAG, NavigationStack } from "./components/navigation-stack.js";
import { SECURE_FIELD_TAG, SecureField } from "./components/secure-field.js";
import { DISCLOSURE_GROUP_TAG, DisclosureGroup } from "./components/disclosure-group.js";
import { EDITABLE_LIST_TAG, EditableList } from "./components/editable-list.js";
import { FORM_TAG, GlassForm } from "./components/form.js";
import { CONTROL_GROUP_TAG, ControlGroup } from "./components/control-group.js";
import { NAVIGATION_SPLIT_VIEW_TAG, NavigationSplitView } from "./components/navigation-split-view.js";
import { CONFIRMATION_DIALOG_TAG, ConfirmationDialog } from "./components/confirmation-dialog.js";
import { OUTLINE_GROUP_TAG, OutlineGroup } from "./components/outline-group.js";
import { GROUP_BOX_TAG, GroupBox } from "./components/group-box.js";
import { LABELED_CONTENT_TAG, LabeledContent } from "./components/labeled-content.js";
import { ADAPTIVE_VIEW_TAG, AdaptiveView } from "./components/adaptive-view.js";
import { TIMELINE_VIEW_TAG, TimelineView } from "./components/timeline-view.js";
import { CANVAS_VIEW_TAG, CanvasView } from "./components/canvas-view.js";
import { SCROLL_NAVIGATOR_TAG, ScrollNavigator } from "./components/scroll-navigator.js";
import { SHARE_ACTION_TAG, ShareAction } from "./components/share-action.js";
import { LONG_PRESS_TAG, LongPress } from "./components/long-press.js";
import { PASTE_BUTTON_TAG, PasteButton } from "./components/paste-button.js";
import { MULTI_DATE_PICKER_TAG, MultiDatePicker } from "./components/multi-date-picker.js";
import { LAZY_STACK_TAG, LazyStack } from "./components/lazy-stack.js";
import { ACTION_MENU_TAG, ActionMenu } from "./components/action-menu.js";
import { ASYNC_IMAGE_TAG, AsyncImage } from "./components/async-image.js";
import { CONTENT_UNAVAILABLE_TAG, ContentUnavailable } from "./components/content-unavailable.js";
import { DATE_PICKER_TAG, DatePicker } from "./components/date-picker.js";
import { NAVIGATION_LINK_TAG, NavigationLink } from "./components/navigation-link.js";
import { PROGRESS_VIEW_TAG, ProgressView } from "./components/progress-view.js";
import { TEXT_EDITOR_TAG, TextEditor } from "./components/text-editor.js";
import { VALUE_GAUGE_TAG, ValueGauge } from "./components/value-gauge.js";
import { HIG_PATTERN_MAP, HIG_PATTERNS } from "./components/hig-atlas.js";

export * from "./components/hig-atlas.js";

const CORE_TAGS = [
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
  ALERT_DIALOG_TAG,
  COLOR_PICKER_TAG,
  DATA_TABLE_TAG,
  STEPPER_TAG,
  VALUE_PICKER_TAG,
  WEB_LINK_TAG,
  GRID_VIEW_TAG,
  NAVIGATION_STACK_TAG,
  SECURE_FIELD_TAG,
  DISCLOSURE_GROUP_TAG,
  EDITABLE_LIST_TAG,
  FORM_TAG,
  CONTROL_GROUP_TAG,
  NAVIGATION_SPLIT_VIEW_TAG,
  CONFIRMATION_DIALOG_TAG,
  OUTLINE_GROUP_TAG,
  GROUP_BOX_TAG,
  LABELED_CONTENT_TAG,
  ADAPTIVE_VIEW_TAG,
  TIMELINE_VIEW_TAG,
  CANVAS_VIEW_TAG,
  SCROLL_NAVIGATOR_TAG,
  SHARE_ACTION_TAG,
  LONG_PRESS_TAG,
  PASTE_BUTTON_TAG,
  MULTI_DATE_PICKER_TAG,
  LAZY_STACK_TAG,
  ACTION_MENU_TAG,
  ASYNC_IMAGE_TAG,
  CONTENT_UNAVAILABLE_TAG,
  DATE_PICKER_TAG,
  NAVIGATION_LINK_TAG,
  PROGRESS_VIEW_TAG,
  TEXT_EDITOR_TAG,
  VALUE_GAUGE_TAG,
] as const;

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
  ALERT_DIALOG_TAG,
  COLOR_PICKER_TAG,
  DATA_TABLE_TAG,
  STEPPER_TAG,
  VALUE_PICKER_TAG,
  WEB_LINK_TAG,
  GRID_VIEW_TAG,
  NAVIGATION_STACK_TAG,
  SECURE_FIELD_TAG,
  DISCLOSURE_GROUP_TAG,
  EDITABLE_LIST_TAG,
  FORM_TAG,
  CONTROL_GROUP_TAG,
  NAVIGATION_SPLIT_VIEW_TAG,
  CONFIRMATION_DIALOG_TAG,
  OUTLINE_GROUP_TAG,
  GROUP_BOX_TAG,
  LABELED_CONTENT_TAG,
  ADAPTIVE_VIEW_TAG,
  TIMELINE_VIEW_TAG,
  CANVAS_VIEW_TAG,
  SCROLL_NAVIGATOR_TAG,
  SHARE_ACTION_TAG,
  LONG_PRESS_TAG,
  PASTE_BUTTON_TAG,
  MULTI_DATE_PICKER_TAG,
  LAZY_STACK_TAG,
  ACTION_MENU_TAG,
  ASYNC_IMAGE_TAG,
  CONTENT_UNAVAILABLE_TAG,
  DATE_PICKER_TAG,
  NAVIGATION_LINK_TAG,
  PROGRESS_VIEW_TAG,
  TEXT_EDITOR_TAG,
  VALUE_GAUGE_TAG,
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
  SidebarItem,
  Sidebar,
  Slider,
  Snippet,
  StatusBar,
  TabBar,
  TextField,
  TokenField,
  Toolbar,
  WebView,
  AlertDialog,
  ColorPicker,
  DataTable,
  Stepper,
  ValuePicker,
  WebLink,
  GridView,
  NavigationStack,
  SecureField,
  DisclosureGroup,
  EditableList,
  GlassForm,
  ControlGroup,
  NavigationSplitView,
  ConfirmationDialog,
  OutlineGroup,
  GroupBox,
  LabeledContent,
  AdaptiveView,
  TimelineView,
  CanvasView,
  ScrollNavigator,
  ShareAction,
  LongPress,
  PasteButton,
  MultiDatePicker,
  LazyStack,
  ActionMenu,
  AsyncImage,
  ContentUnavailable,
  DatePicker,
  NavigationLink,
  ProgressView,
  TextEditor,
  ValueGauge,
};

const CORE_CLASSES: CustomElementConstructor[] = [
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
  SidebarItem,
  Sidebar,
  Slider,
  Snippet,
  StatusBar,
  TabBar,
  TextField,
  TokenField,
  Toolbar,
  WebView,
  AlertDialog,
  ColorPicker,
  DataTable,
  Stepper,
  ValuePicker,
  WebLink,
  GridView,
  NavigationStack,
  SecureField,
  DisclosureGroup,
  EditableList,
  GlassForm,
  ControlGroup,
  NavigationSplitView,
  ConfirmationDialog,
  OutlineGroup,
  GroupBox,
  LabeledContent,
  AdaptiveView,
  TimelineView,
  CanvasView,
  ScrollNavigator,
  ShareAction,
  LongPress,
  PasteButton,
  MultiDatePicker,
  LazyStack,
  ActionMenu,
  AsyncImage,
  ContentUnavailable,
  DatePicker,
  NavigationLink,
  ProgressView,
  TextEditor,
  ValueGauge,
];

const swiftui = (page: string): string => `https://developer.apple.com/documentation/swiftui/${page}`;

const hig = (page: string): string => `https://developer.apple.com/design/human-interface-guidelines/${page}`;

export interface GlassKitComponent {
  tag: string;
  ctor: CustomElementConstructor;
  title: string;
  group: string;
  description: string;
  higPage: string;
}

const CORE_META: Array<Pick<GlassKitComponent, "title" | "group" | "description" | "higPage">> = [
  { title: "Badge", group: "Core", description: "Compact status and count label.", higPage: "" },
  { title: "Box", group: "Layout", description: "Grouped content with title and subtitle.", higPage: hig("boxes") },
  { title: "Chart", group: "Content", description: "Compact bar chart for glanceable data.", higPage: hig("charts") },
  { title: "Collection", group: "Layout", description: "Responsive grid of same-size items.", higPage: hig("collections") },
  { title: "Column view", group: "Layout", description: "Multi-column browser with hierarchical selection.", higPage: hig("column-views") },
  { title: "Control tile", group: "System experiences", description: "Toggle or action tile for quick controls.", higPage: hig("controls") },
  { title: "Disclosure control", group: "Layout", description: "Expandable section with a visible triangle.", higPage: hig("disclosure-controls") },
  { title: "Button", group: "Menus and actions", description: "Primary, secondary, and quiet actions.", higPage: hig("buttons") },
  { title: "Glass panel", group: "Material", description: "Semantic surface with flat fills and hairlines.", higPage: "" },
  { title: "Toggle", group: "Selection and input", description: "Switch, checkbox, and radio states with labels.", higPage: hig("toggles") },
  { title: "Image view", group: "Content", description: "Aspect-aware image with accessible alt text.", higPage: hig("image-views") },
  { title: "Label", group: "Layout", description: "Selectable static text with type variants.", higPage: hig("labels") },
  { title: "Live activity", group: "System experiences", description: "Ongoing task with progress and action.", higPage: hig("live-activities") },
  { title: "List row", group: "Layout", description: "Aligned row with trailing control slot.", higPage: hig("lists-and-tables") },
  { title: "Notification", group: "System experiences", description: "Dismissible status message with tone.", higPage: hig("notifications") },
  { title: "Path control", group: "Navigation and search", description: "Breadcrumb navigation with separators.", higPage: hig("path-controls") },
  { title: "Search field", group: "Navigation and search", description: "Search input with scopes and clear action.", higPage: hig("search-fields") },
  { title: "Segmented control", group: "Selection and input", description: "Mutually exclusive choices in one control.", higPage: hig("segmented-controls") },
  { title: "Sidebar item", group: "Navigation and search", description: "Selectable sidebar row with badge support.", higPage: hig("sidebars") },
  { title: "Sidebar", group: "Navigation and search", description: "Leading navigation pane with header and footer.", higPage: hig("sidebars") },
  { title: "Slider", group: "Selection and input", description: "Linear and circular sliders with ticks and icons.", higPage: hig("sliders") },
  { title: "Snippet", group: "System experiences", description: "Compact confirmation or notice card.", higPage: hig("snippets") },
  { title: "Status bar", group: "System experiences", description: "Window-level status summary.", higPage: hig("status-bars") },
  { title: "Tab bar", group: "Navigation and search", description: "Top-level tab switcher with badge support.", higPage: hig("tab-bars") },
  { title: "Text field", group: "Selection and input", description: "Single-line input with clear, caption, and slots.", higPage: hig("text-fields") },
  { title: "Token field", group: "Navigation and search", description: "Editable token list with add and remove events.", higPage: hig("token-fields") },
  { title: "Toolbar", group: "Menus and actions", description: "Horizontal action strip with slotted controls.", higPage: hig("toolbars") },
  { title: "Web view", group: "Content", description: "Sandboxed inline HTML surface.", higPage: hig("web-views") },
  { title: "Alert dialog", group: "Presentation", description: "Focus-managed confirmation with confirm and cancel actions.", higPage: swiftui("alert") },
  { title: "Color picker", group: "Selection and input", description: "Native color input, hex entry, and suggested swatches.", higPage: swiftui("colorpicker") },
  { title: "Data table", group: "Content", description: "Sortable, selectable rows with accessible column headers.", higPage: swiftui("table") },
  { title: "Stepper control", group: "Selection and input", description: "Bounded increment and decrement with wrap support.", higPage: swiftui("stepper") },
  { title: "Value picker", group: "Selection and input", description: "Radio-style selection with labels, details, and disabled options.", higPage: swiftui("picker") },
  { title: "Web link", group: "Navigation and search", description: "Safe external link with a route event and visible affordance.", higPage: swiftui("link") },
  { title: "Grid view", group: "Layout", description: "Responsive item grid with selectable cells and badges.", higPage: swiftui("lazyvgrid") },
  { title: "Navigation stack", group: "Navigation and search", description: "Root-to-detail navigation with a back route and slotted content.", higPage: swiftui("navigationstack") },
  { title: "Secure field", group: "Selection and input", description: "Private text entry with reveal, validation, and submit events.", higPage: swiftui("securefield") },
  { title: "Disclosure group", group: "Layout", description: "Nested expandable sections with single or multiple expansion.", higPage: swiftui("disclosuregroup") },
  { title: "Editable list", group: "Layout", description: "Reorderable and removable rows with an explicit edit mode.", higPage: swiftui("editbutton") },
  { title: "Form", group: "Layout", description: "Grouped data-entry sections with labelled controls and actions.", higPage: swiftui("form") },
  { title: "Control group", group: "Menus and actions", description: "Related controls grouped horizontally or vertically with a single event.", higPage: swiftui("controlgroup") },
  { title: "Navigation split view", group: "Navigation and search", description: "Two- or three-column drill-down with a live selection route.", higPage: swiftui("navigationsplitview") },
  { title: "Confirmation dialog", group: "Presentation", description: "Stacked choices including cancel and destructive actions with focus management.", higPage: swiftui("actionsheet") },
  { title: "Outline group", group: "Layout", description: "Recursive hierarchical rows with disclosure and single selection.", higPage: swiftui("outlinegroup") },
  { title: "Group box", group: "Layout", description: "Semantic titled container with caption, content, and actions.", higPage: swiftui("groupbox") },
  { title: "Labeled content", group: "Content", description: "Aligned label and value rows with copy and secondary actions.", higPage: swiftui("labeledcontent") },
  { title: "Adaptive view", group: "Layout", description: "Chooses the first layout variant that fits the available width.", higPage: swiftui("viewthatfits") },
  { title: "Timeline view", group: "Status", description: "Periodic clock updates with elapsed time and tick events.", higPage: swiftui("timelineview") },
  { title: "Canvas view", group: "Content", description: "Pointer drawing surface with undo, clear, and stroke events.", higPage: swiftui("canvas") },
  { title: "Scroll navigator", group: "Navigation", description: "Scroll-proxy target buttons with live position and scroll-to events.", higPage: swiftui("scrollviewreader") },
  { title: "Share action", group: "Menus and actions", description: "Share sheet with copy, draft, and local destinations plus share events.", higPage: swiftui("sharelink") },
  { title: "Long press", group: "Gestures", description: "Held action with progress feedback, completion, start, and cancel events.", higPage: swiftui("longpressgesture") },
  { title: "Paste button", group: "Selection and input", description: "Clipboard paste control with editable value and paste events.", higPage: swiftui("pastebutton") },
  { title: "Multi-date picker", group: "Selection and input", description: "Month grid that toggles several dates with ISO values and change events.", higPage: swiftui("multidatepicker") },
  { title: "Lazy stack", group: "Layout", description: "Virtualized vertical or horizontal rows with rendered range and selection events.", higPage: swiftui("lazyvstack") },
  { title: "Action menu", group: "Menus and actions", description: "Keyboard-ready menu of commands with details and separators.", higPage: swiftui("menu") },
  { title: "Async image", group: "Content", description: "Image with explicit loading, placeholder, and error states.", higPage: swiftui("asyncimage") },
  { title: "Content unavailable", group: "Content", description: "Empty or no-results state with a clear next action.", higPage: swiftui("contentunavailableview") },
  { title: "Date picker", group: "Selection and input", description: "Absolute date and optional time selection with bounds.", higPage: swiftui("datepicker") },
  { title: "Navigation link", group: "Navigation and search", description: "Row that pushes a detail view and emits a route.", higPage: swiftui("navigationstack") },
  { title: "Progress view", group: "Status", description: "Determinate or indeterminate progress with labelled bounds.", higPage: swiftui("progressview") },
  { title: "Text editor", group: "Selection and input", description: "Long-form text entry with a live character count.", higPage: swiftui("texteditor") },
  { title: "Value gauge", group: "Status", description: "Bounded measure with circular or linear presentation.", higPage: swiftui("gauge") },
];

/** Every registered Glass Kit element, with HIG provenance where applicable. */
export const COMPONENT_REGISTRY: GlassKitComponent[] = [
  ...CORE_TAGS.map((tag, index) => ({ tag, ctor: CORE_CLASSES[index], ...CORE_META[index] })),
  ...HIG_PATTERNS.map((pattern) => ({
    tag: pattern.tag,
    ctor: HIG_PATTERN_MAP.get(pattern.tag)!.ctor,
    title: pattern.title,
    group: pattern.group,
    description: pattern.description,
    higPage: pattern.higPage,
  })),
];

let installed = false;

/** Register every Glass Kit element. Safe to call more than once. */
export function installGlassKit(): void {
  if (installed) return;
  installed = true;
  for (const component of COMPONENT_REGISTRY) defineElement(component.tag, component.ctor);
}
