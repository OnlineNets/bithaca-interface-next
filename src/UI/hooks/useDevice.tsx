import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from "../constants/breakpoints";
import { useWindowSize } from "./useWindowSize";

export const useDevice = () => {
  const { width: windowWidth } = useWindowSize();

  if ((windowWidth && windowWidth >= DESKTOP_BREAKPOINT) || !windowWidth) {
    return "desktop";
  }
  if (windowWidth && windowWidth >= TABLET_BREAKPOINT) {
    return "tablet";
  }
  return "phone";
};
