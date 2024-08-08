import { useState } from "react";
import { ToastItemProp } from "../constants/toast";
import { BasicToastParams } from "@/types/useToast";

export default function useToast() {
  const [toastList, setToastList] = useState<ToastItemProp[]>([]);
  const [position, setPosition] = useState("bottom-right");

  const showToast = (newToast: ToastItemProp, position: string) => {
    setToastList([...toastList, newToast]);
    setPosition(position);
  };

  const showSuccessToast = ({ title, message }: BasicToastParams) => {
    showToast(
      {
        id: Math.floor(Math.random() * 1000),
        title: title,
        message: message,
        type: "info",
      },
      "bottom-right"
    );
  };

  const showErrorToast = ({ title, message }: BasicToastParams) => {
    showToast(
      {
        id: Math.floor(Math.random() * 1000),
        title: title,
        message: message,
        type: "error",
      },
      "bottom-right"
    );
  };

  const showOrderConfirmationToast = () => {
    showSuccessToast({
      title: "Transaction Confirmed",
      message: "Order received & submitted into the auction",
    });
  };

  const showOrderErrorToast = () => {
    showToast(
      {
        id: Math.floor(Math.random() * 1000),
        title: "Failed to Send Order",
        message: "Failed to Send Order, please try again.",
        type: "error",
      },
      "bottom-right"
    );
  };

  return {
    toastList,
    showToast,
    position,
    showOrderConfirmationToast,
    showOrderErrorToast,
    showSuccessToast,
    showErrorToast,
  };
}
