// symbols
export const layoutKey = "_layout_";

// interfaces
export interface ILayout {
  header: {
    height: string;
  };
  leftDrawer: {
    isVisible: boolean;
    width: string;
    isFixed: boolean;
  };
}
