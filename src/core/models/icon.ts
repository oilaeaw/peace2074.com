export const ICON_NAMES = {
  Home: "",
  Menu: "fas fa-bars",
  Close: "",
  Route: "",
  Settings: "",
} as const;
type IconNameKey = keyof typeof ICON_NAMES;
export type IconName = (typeof ICON_NAMES)[IconNameKey];
