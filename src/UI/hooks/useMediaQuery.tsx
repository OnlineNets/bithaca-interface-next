// Packages
import { useCallback, useEffect, useState } from "react";

const useMediaQuery = (width: number) => {
  const [breakpoint, setBreakpoint] = useState(false);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const updateBreakpoint = useCallback((e: any) => {
    if (e.matches) {
      setBreakpoint(true);
    } else {
      setBreakpoint(false);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${width}px)`);
    media.addEventListener("change", updateBreakpoint);

    if (media.matches) {
      setBreakpoint(true);
    }

    return () => media.removeEventListener("change", updateBreakpoint);
  }, [width, updateBreakpoint]);
  return breakpoint;
};

export default useMediaQuery;
