import { useEffect, useState } from "react";

export const useLastUrlSegment = (): string => {
  const [lastSegment, setLastSegment] = useState<string>("");
  useEffect(() => {
    const getCurrentURL = (): string => window.location.href;
    const updateLastSegment = (): void => {
      const currentURL = getCurrentURL();
      const segments = currentURL.split("/");
      const lastSegmentValue = segments[segments.length - 1];
      setLastSegment(lastSegmentValue);
    };
    updateLastSegment();
  }, []);
  return lastSegment;
};
