import { useState, useRef, useEffect } from "react";
import { useEscKey } from "@/UI/hooks/useEscKey";

export const useDropdown = (initialValue = false) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(initialValue);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [optionsPosition, setOptionsPosition] = useState({ width: 0, top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    setMounted(true);
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, []);

  useEscKey(() => isDropdownOpen && setIsDropdownOpen(false));

  const handleDropdownClick = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    setOptionsPosition({
      width: containerRect?.width ?? 100,
      left: containerRect?.x ?? 0,
      top: (containerRect?.y ?? 0) + (containerRect?.height ?? 0) + document.documentElement.scrollTop + 1,
    });
    setIsDropdownOpen(!isDropdownOpen);
  };

  return {
    handleDropdownClick,
    isDropdownOpen,
    setIsDropdownOpen,
    containerRef,
    optionsRef,
    optionsPosition,
    setOptionsPosition,
    mounted,
  };
};
