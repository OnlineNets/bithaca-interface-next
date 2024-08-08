// Components
import Minus from "@/UI/components/Icons/Minus";
import Plus from "@/UI/components/Icons/Plus";
import PlusMinus from "@/UI/components/Icons/PlusMinus";
import { SideUnion } from "@/utils/types";

export const displaySideIcon = (side: string) => {
  if (side === "+" || side === "BUY") {
    return <Plus />;
  }
  if (side === "-" || side === "SELL") {
    return <Minus />;
  }
  if (side === "") {
    return <PlusMinus />;
  }

  return "";
};
