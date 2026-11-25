import type { GlassKitComponent } from "@glasskit/ui";

/** Shared, source-accurate preview data for the atlas and API browser. */
export const PREVIEW_ATTRIBUTES: Record<string, Record<string, string>> = {
  "gk-badge": { tone: "accent", dot: "" },
  "gk-button": { variant: "primary" },
  "gk-glass-panel": { tone: "thin" },
  "gk-toggle": { checked: "", label: "Enabled" },
  "gk-list-row": { subtitle: "Aligned detail row" },
  "gk-segmented": { value: "one", label: "Choices" },
  "gk-slider": { label: "Brightness", min: "0", max: "100", value: "68", unit: "%" },
  "gk-text-field": { label: "Name", placeholder: "Enter a value", clearable: "" },
  "gk-toolbar": {},
  "gk-box": { title: "Grouped content", subtitle: "Title and subtitle" },
  "gk-chart": { title: "Trend", values: "12,18,14,24,20,9", labels: "Mon,Tue,Wed,Thu,Fri,Sat" },
  "gk-color-well": { value: "#0a84ff" },
  "gk-combo-box": {},
  "gk-collection": { columns: "2", gap: "8px" },
  "gk-column-view": {
    columns: '[{"title":"Library","selected":"Living Room","items":["Living Room","Kitchen"]},{"title":"Devices","items":[{"label":"Lights","subtitle":"6 devices"}]}]',
  },
  "gk-control-tile": { label: "Wi-Fi", state: "on" },
  "gk-digit-entry-view": {},
  "gk-disclosure": { label: "Details", open: "" },
  "gk-image-view": {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='120'%3E%3Crect width='240' height='120' fill='%231f2430'/%3E%3Ccircle cx='120' cy='60' r='26' fill='none' stroke='%230a84ff' stroke-width='3'/%3E%3C/svg%3E",
    alt: "Abstract preview",
    ratio: "16 / 9",
  },
  "gk-image-well": {},
  "gk-label": { text: "Selectable static text", variant: "caption" },
  "gk-live-activity": { title: "Air purifier", status: "Filter at 82%", progress: "82", "action-label": "Pause", expanded: "" },
  "gk-notification": { title: "Automation ready", message: "Your scene is available.", tone: "info" },
  "gk-path-control": { items: '["Home","Living Room","Lights"]' },
  "gk-picker": {},
  "gk-search-field": { label: "Search", placeholder: "Search components", scopes: '["All","Core","HIG"]', scope: "All" },
  "gk-sidebar": { label: "Sections", active: "general" },
  "gk-snippet": { kind: "confirmation", title: "Run scene?", message: "This dims the lights." },
  "gk-status-bar": { label: "Home", status: "All systems normal", network: "Wi-Fi", battery: "82%", time: "09:41" },
  "gk-stepper": { value: "2", min: "0", max: "8" },
  "gk-tab-bar": { tabs: '[{"id":"all","label":"All"},{"id":"core","label":"Core"},{"id":"hig","label":"HIG"}]', active: "all" },
  "gk-token-field": { label: "Rooms", placeholder: "Add a room", tokens: '["Kitchen","Hallway"]' },
  "gk-virtual-keyboard": {},
  "gk-web-view": { title: "Inline content", height: "90", srcdoc: "<p>Sandboxed content stays inside the app.</p>" },
  "gk-action-menu": {
    label: "Actions",
    items: '[{"label":"Duplicate","detail":"Ctrl+D"},{"label":"Rename"},{"separator":true},{"label":"Delete","value":"delete"}]',
  },
  "gk-async-image": {
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect width='320' height='180' fill='%231c1c1e'/%3E%3Ccircle cx='160' cy='90' r='30' fill='none' stroke='%230a84ff' stroke-width='4'/%3E%3C/svg%3E",
    alt: "Abstract preview",
    ratio: "16 / 9",
  },
  "gk-content-unavailable": {
    title: "No results",
    message: "Try a different room or clear the filter.",
    "action-label": "Clear filter",
    search: "",
  },
  "gk-date-picker": { label: "Start date", value: "2026-11-23T09:00", components: "date,hourAndMinute" },
  "gk-navigation-link": { label: "Living Room", detail: "6 devices", value: "living-room" },
  "gk-progress-view": { label: "Syncing", value: "68", total: "100", "current-value-label": "68%" },
  "gk-text-editor": { label: "Notes", value: "Describe the scene you want to save.", rows: "3", "max-length": "120" },
  "gk-value-gauge": { label: "Comfort", value: "68", min: "0", max: "100", "current-value-label": "68%" },
  "gk-alert-dialog": {
    title: "Discard scene?",
    message: "This removes changes that have not been saved.",
    "trigger-label": "Review",
    "action-label": "Discard",
    "cancel-label": "Keep editing",
    tone: "danger",
  },
  "gk-color-picker": {
    label: "Accent color",
    value: "#0a84ff",
    swatches: '["#0a84ff","#30d158","#ff9f0a","#ff453a"]',
  },
  "gk-data-table": {
    caption: "Devices",
    columns: '[{"key":"name","title":"Device"},{"key":"room","title":"Room"},{"key":"state","title":"State","align":"end"}]',
    rows: '[{"id":"lights","name":"Lights","room":"Living Room","state":"On"},{"id":"thermostat","name":"Thermostat","room":"Hallway","state":"Auto"},{"id":"lock","name":"Front Lock","room":"Entry","state":"Locked"}]',
    "row-key": "id",
    value: "lights",
  },
  "gk-stepper-control": { label: "Brightness", value: "2", min: "0", max: "8", step: "1", unit: "×" },
  "gk-value-picker": {
    label: "Notify me about",
    value: "mentions",
    options: '[{"label":"Direct messages","value":"direct","detail":"Only people you follow"},{"label":"Mentions","value":"mentions","detail":"When your name appears"},{"label":"Anything","value":"all","detail":"Every update"}]',
  },
  "gk-web-link": { label: "SwiftUI documentation", href: "https://developer.apple.com/documentation/swiftui/", detail: "Source" },
  "gk-grid-view": {
    caption: "Rooms",
    columns: "3",
    items: '[{"label":"Living Room","value":"living","detail":"6 devices","badge":"Active"},{"label":"Kitchen","value":"kitchen","detail":"4 devices"},{"label":"Entry","value":"entry","detail":"2 devices","badge":"Away"}]',
    value: "living",
  },
  "gk-navigation-stack": {
    title: "Destinations",
    items: '[{"label":"Living Room","value":"living","detail":"6 devices","description":"Lights, climate, and media in the main living space."},{"label":"Kitchen","value":"kitchen","detail":"4 devices","description":"Counter lights, kettle, and fridge sensors."}]',
  },
  "gk-secure-field": {
    label: "Password",
    value: "glasskit-preview",
    placeholder: "Enter a password",
    caption: "Private text stays masked until revealed.",
    autocomplete: "current-password",
  },
  "gk-form": {
    label: "Scene settings",
    "submit-label": "Save form",
    "show-actions": "",
    sections: '[{"title":"Notifications","rows":[{"label":"Notify me about","control":"picker","value":"mentions","options":[{"label":"Direct messages","value":"direct"},{"label":"Mentions","value":"mentions"},{"label":"Anything","value":"all"}]},{"label":"Play notification sounds","control":"toggle","checked":true}],"footer":"Choose how alerts arrive."},{"title":"Profile","rows":[{"label":"Display name","control":"text","value":"Home Hub"},{"label":"Repeat","control":"stepper","value":"2","min":"0","max":"8"}]}]',
  },
  "gk-disclosure-group": {
    label: "Details",
    items: '[{"title":"Items","expanded":true,"content":"Light, climate, and media controls.","children":[{"title":"Sub-items","content":"Scene steps and schedules."}]},{"title":"Access","content":"Who can run this scene."}]',
  },
  "gk-editable-list": {
    label: "Oceans",
    items: '[{"label":"Living Room","value":"living","detail":"6 devices"},{"label":"Kitchen","value":"kitchen","detail":"4 devices"},{"label":"Entry","value":"entry","detail":"2 devices"}]',
  },
  "gk-control-group": {
    label: "Playback",
    items: '[{"label":"Rewind","value":"rewind"},{"label":"Play","value":"play","variant":"primary"},{"label":"Forward","value":"forward"},{"label":"Share","value":"share","variant":"quiet","disabled":true}]',
  },
  "gk-navigation-split-view": {
    title: "Library",
    columns: "3",
    sections: '[{"value":"living","label":"Living Room","detail":{"title":"Living Room","body":"Six responsive devices."},"children":[{"value":"lights","label":"Lights","detail":{"title":"Lights","body":"Three scenes available."}},{"value":"climate","label":"Climate","detail":{"title":"Climate","body":"21 °C, auto."}}]},{"value":"kitchen","label":"Kitchen","detail":{"title":"Kitchen","body":"Four devices."},"children":[{"value":"sensors","label":"Sensors","detail":{"title":"Sensors","body":"Occupancy and temperature."}}]}]',
  },
  "gk-confirmation-dialog": {
    "trigger-label": "Choose destination",
    title: "Resume workout recording",
    message: "Choose a destination for workout data.",
    actions: '[{"label":"Append to current workout","value":"append"},{"label":"Overwrite current workout","value":"overwrite","style":"destructive"},{"label":"Cancel","value":"cancel","style":"cancel"}]',
  },
  "gk-outline-group": {
    label: "Project files",
    items: '[{"label":"Sources","value":"sources","expanded":true,"detail":"12 files","children":[{"label":"Components","value":"components","detail":"8 files"},{"label":"Styles","value":"styles","detail":"4 files"}]},{"label":"Tests","value":"tests","detail":"6 files","children":[{"label":"Unit","value":"unit","detail":"4 files"}]}]',
  },
  "gk-group-box": {
    label: "Scene summary",
    caption: "Current room configuration",
    content: "Six devices respond to this scene.",
    actions: '[{"label":"Edit","value":"edit"},{"label":"Run","value":"run","variant":"primary"}]',
  },
  "gk-labeled-content": {
    label: "Hub details",
    rows: '[{"label":"Name","value":"Living Room Hub","copy":true},{"label":"Status","value":"Online","detail":"updated just now"},{"label":"Firmware","value":"2.4.1","action":"Update"}]',
  },
  "gk-adaptive-view": {
    label: "Upload status",
    variants: '[{"label":"Uploading files","detail":"75% · 3 files remaining"},{"label":"Uploading","detail":"75% complete"},{"label":"75%","detail":"compact"}]',
  },
  "gk-timeline-view": {
    label: "Current time",
    interval: "1000",
    "show-seconds": "",
  },
  "gk-canvas-view": {
    label: "Annotation",
    hint: "Draw a note",
    height: "110",
  },
  "gk-scroll-navigator": {
    label: "Jump to section",
    targets: '[{"label":"Overview","value":"overview"},{"label":"Devices","value":"devices"},{"label":"Scenes","value":"scenes"},{"label":"Energy","value":"energy"},{"label":"Diagnostics","value":"diagnostics"}]',
  },
  "gk-share-action": {
    label: "Share scene",
    title: "Evening scene",
    url: "glasskit://scene/evening",
  },
  "gk-long-press": {
    label: "Hold to arm",
    hint: "1.2s",
    duration: "1200",
    value: "arm-scene",
  },
  "gk-paste-button": {
    label: "Paste a note",
    placeholder: "Paste or type a note",
    sample: "Living Room lights at 60%",
  },
  "gk-multi-date-picker": {
    label: "Availability",
    month: "2026-11",
    value: "[6,13,20]",
  },
  "gk-lazy-stack": {
    label: "Device activity",
    items: '[{"label":"Lamp on","value":"event-1","detail":"09:12"},{"label":"Climate set to 21°C","value":"event-2","detail":"09:18"},{"label":"Door locked","value":"event-3","detail":"09:24"},{"label":"Scene started","value":"event-4","detail":"09:31"},{"label":"Sensor clear","value":"event-5","detail":"09:44"},{"label":"Lamp off","value":"event-6","detail":"10:02"},{"label":"Energy report","value":"event-7","detail":"10:15"},{"label":"Camera online","value":"event-8","detail":"10:22"},{"label":"Scene ended","value":"event-9","detail":"10:38"},{"label":"Climate auto","value":"event-10","detail":"10:51"},{"label":"Door unlocked","value":"event-11","detail":"11:04"},{"label":"Backup complete","value":"event-12","detail":"11:20"}]',
    height: "150",
  },
  "gk-drag-surface": { label: "Position sensor", x: "20", y: "20", height: "120" },
  "gk-tap-counter": { label: "Calibrate", count: "3", value: "0" },
  "gk-lazy-grid": {
    label: "Room tiles",
    items: '[{"label":"Lamp","value":"tile-1","detail":"01"},{"label":"Climate","value":"tile-2","detail":"02"},{"label":"Door","value":"tile-3","detail":"03"},{"label":"Camera","value":"tile-4","detail":"04"},{"label":"Scene","value":"tile-5","detail":"05"},{"label":"Energy","value":"tile-6","detail":"06"},{"label":"Sensor","value":"tile-7","detail":"07"},{"label":"Backup","value":"tile-8","detail":"08"},{"label":"Router","value":"tile-9","detail":"09"},{"label":"Speaker","value":"tile-10","detail":"10"},{"label":"Lock","value":"tile-11","detail":"11"},{"label":"Light","value":"tile-12","detail":"12"},{"label":"Bridge","value":"tile-13","detail":"13"},{"label":"Outlet","value":"tile-14","detail":"14"},{"label":"Thermostat","value":"tile-15","detail":"15"},{"label":"Hub","value":"tile-16","detail":"16"},{"label":"Meter","value":"tile-17","detail":"17"},{"label":"Panel","value":"tile-18","detail":"18"},{"label":"Gate","value":"tile-19","detail":"19"},{"label":"Garage","value":"tile-20","detail":"20"},{"label":"Porch","value":"tile-21","detail":"21"},{"label":"Hall","value":"tile-22","detail":"22"},{"label":"Studio","value":"tile-23","detail":"23"},{"label":"Yard","value":"tile-24","detail":"24"}]',
    rows: "2",
  },
  "gk-rotate-view": { label: "Rotate sensor", angle: "0", height: "160" },
  "gk-lazy-vgrid": {
    label: "Metric tiles",
    items: '[{"label":"Lamp","value":"metric-1","detail":"01"},{"label":"Climate","value":"metric-2","detail":"02"},{"label":"Door","value":"metric-3","detail":"03"},{"label":"Camera","value":"metric-4","detail":"04"},{"label":"Scene","value":"metric-5","detail":"05"},{"label":"Energy","value":"metric-6","detail":"06"},{"label":"Sensor","value":"metric-7","detail":"07"},{"label":"Backup","value":"metric-8","detail":"08"},{"label":"Router","value":"metric-9","detail":"09"},{"label":"Speaker","value":"metric-10","detail":"10"},{"label":"Lock","value":"metric-11","detail":"11"},{"label":"Light","value":"metric-12","detail":"12"},{"label":"Bridge","value":"metric-13","detail":"13"},{"label":"Outlet","value":"metric-14","detail":"14"},{"label":"Meter","value":"metric-15","detail":"15"},{"label":"Hub","value":"metric-16","detail":"16"},{"label":"Panel","value":"metric-17","detail":"17"},{"label":"Gate","value":"metric-18","detail":"18"},{"label":"Garage","value":"metric-19","detail":"19"},{"label":"Porch","value":"metric-20","detail":"20"},{"label":"Hall","value":"metric-21","detail":"21"},{"label":"Studio","value":"metric-22","detail":"22"},{"label":"Yard","value":"metric-23","detail":"23"},{"label":"Yard 2","value":"metric-24","detail":"24"}]',
    columns: "3",
    height: "140",
  },
  "gk-list-view": {
    label: "Oceans",
    mode: "multiple",
    value: '["pacific","atlantic"]',
    items: '[{"label":"Pacific","value":"pacific","section":"Oceans","detail":"Largest"},{"label":"Atlantic","value":"atlantic","section":"Oceans","detail":"Second"},{"label":"Indian","value":"indian","section":"Oceans","detail":"Third"},{"label":"Southern","value":"southern","section":"Oceans","detail":"Fourth"},{"label":"Arctic","value":"arctic","section":"Oceans","detail":"Fifth"}]',
    height: "160",
  },
  "gk-rich-text": { text: "Hamlet", scale: "title", weight: "semibold", color: "default" },
  "gk-icon-label": { label: "Lightning", glyph: "⚡", variant: "title-icon" },
  "gk-grid-layout": {
    label: "Greetings",
    columns: "2",
    gap: "6",
    items: '[{"label":"Hello","value":"hello","glyph":"◇","detail":"01"},{"label":"World","value":"world","glyph":"◈","detail":"02"},{"label":"Scene","value":"scene","glyph":"◉","detail":"03"},{"label":"Energy","value":"energy","glyph":"▣","detail":"04"}]',
  },
  "gk-push-button": { label: "Sign In", glyph: "↗", variant: "filled" },
  "gk-nav-pane": {
    label: "Notes",
    items: '[{"label":"Welcome","value":"welcome","detail":"Draft"},{"label":"Scenes","value":"scenes","detail":"Shared"},{"label":"Energy","value":"energy","detail":"Report"}]',
    value: "welcome",
    "detail-title": "Welcome",
    "detail-body": "A master and detail pane keeps navigation local while preserving context.",
  },
  "gk-check-row": { label: "Checklist row", checked: "", position: "leading" },
};

export const PREVIEW_CHILDREN: Record<string, string> = {
  "gk-button": "Action",
  "gk-badge": "Status",
  "gk-glass-panel": "Padded, rounded surface",
  "gk-list-row": "List row",
  "gk-segmented": '<button value="one">One</button><button value="two">Two</button>',
  "gk-toolbar": '<gk-button size="small">Action</gk-button><gk-button size="small" variant="quiet">More</gk-button>',
  "gk-box": '<gk-label text="Shared token system" variant="caption"></gk-label>',
  "gk-sidebar":
    '<span slot="header">Sections</span><gk-sidebar-item value="general" label="General" selected></gk-sidebar-item><gk-sidebar-item value="about" label="About"></gk-sidebar-item>',
};

export const GROUP_ORDER = [
  "Core",
  "Material",
  "Layout",
  "Content",
  "Navigation and search",
  "Selection and input",
  "Menus and actions",
  "Presentation",
  "Status",
  "System experiences",
  "Inputs",
];

function quoteAttribute(value: string): string {
  const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.includes("'") ? `"${escaped.replace(/"/g, "&quot;")}"` : `'${escaped}'`;
}

export function componentMarkup(component: GlassKitComponent): string {
  const attributes = Object.entries(PREVIEW_ATTRIBUTES[component.tag] ?? {})
    .map(([name, value]) => (value === "" ? name : `${name}=${quoteAttribute(value)}`))
    .join(" ");
  const children = PREVIEW_CHILDREN[component.tag] ?? "";
  return `<${component.tag}${attributes ? ` ${attributes}` : ""}>${children}</${component.tag}>`;
}

export function createComponentPreview(component: GlassKitComponent): HTMLElement {
  const element = document.createElement(component.tag);
  for (const [name, value] of Object.entries(PREVIEW_ATTRIBUTES[component.tag] ?? {})) {
    element.setAttribute(name, value);
  }
  if (PREVIEW_CHILDREN[component.tag]) element.innerHTML = PREVIEW_CHILDREN[component.tag];
  element.setAttribute("aria-label", component.title);
  return element;
}

