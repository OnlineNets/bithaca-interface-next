// Packages
import { MouseEvent } from "react";

// Prevent user from changing input number on mouse scroll
export const preventScrollOnNumberInput = (e: MouseEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
  e.stopPropagation();
  setTimeout(() => {
    e?.currentTarget?.focus();
  }, 0);
};
