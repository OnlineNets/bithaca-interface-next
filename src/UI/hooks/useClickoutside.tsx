// Packages
import { MutableRefObject, useEffect } from "react";

// Types
type UseClickOutsideProps = (
  ref: MutableRefObject<HTMLElement | null>,
  onCallback: () => void,
  ignoreRef?: MutableRefObject<HTMLElement | null>
) => void;

export const useClickOutside: UseClickOutsideProps = (ref, onCallback, ignoreRef) => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      ref.current &&
      !ref.current.contains(event.target as Node) &&
      (!ignoreRef || !ignoreRef.current || !ignoreRef.current.contains(event.target as Node))
    ) {
      onCallback();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, onCallback, ignoreRef]);
};
