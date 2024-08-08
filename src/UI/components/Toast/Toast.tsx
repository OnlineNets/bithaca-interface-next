import { useState, useEffect } from "react";

import styles from "./Toast.module.scss";
import Close from "@/UI/components/Icons/Close";
import { ToastItemProp } from "@/UI/constants/toast";
import { createPortal } from "react-dom";
import Button from "../Button/Button";
import { useRouter } from "next/router";
import LogoUsdc from "../Icons/LogoUsdc";
import Flex from "@/UI/layouts/Flex/Flex";

type ToastPropType = {
  toastList: ToastItemProp[];
  autoDelete?: boolean;
  autoDeleteTime?: number;
  position?: string;
};

const Toast = (Props: ToastPropType) => {
  const { toastList, autoDelete = true, autoDeleteTime = 3500, position = "bottom-right" } = Props;
  const [list, setList] = useState(toastList);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setList([...toastList]);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastList]);

  const renderIcon = (type: string) => {
    switch (type) {
      case "info":
        return (
          <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M2.33789 6C4.06694 3.01099 7.29866 1 11.0001 1C16.5229 1 21.0001 5.47715 21.0001 11C21.0001 16.5228 16.5229 21 11.0001 21C7.29866 21 4.06694 18.989 2.33789 16M11 15L15 11M15 11L11 7M15 11H1'
              stroke='#B5B5F8'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        );
      case "success":
        return (
          <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M21 10.0857V11.0057C20.9988 13.1621 20.3005 15.2604 19.0093 16.9875C17.7182 18.7147 15.9033 19.9782 13.8354 20.5896C11.7674 21.201 9.55726 21.1276 7.53447 20.3803C5.51168 19.633 3.78465 18.2518 2.61096 16.4428C1.43727 14.6338 0.879791 12.4938 1.02168 10.342C1.16356 8.19029 1.99721 6.14205 3.39828 4.5028C4.79935 2.86354 6.69279 1.72111 8.79619 1.24587C10.8996 0.770634 13.1003 0.988061 15.07 1.86572M21 3L11 13.01L8 10.01'
              stroke='#4BB475'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        );
      case "error":
        return (
          <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M14 8L8 14M8 8L14 14M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z'
              stroke='#FF3F57'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        );
    }
  };

  const renderPosition = () => {
    switch (position) {
      case "bottom-right":
        return styles.topRight;
      case "top-left":
        return styles.topLeft;
      case "bottom-right":
        return styles.bottomRight;
      case "bottom-left":
        return styles.bottomLeft;
      default:
        return "";
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoDelete && toastList.length && list.length) {
        deleteToast(toastList[0].id);
      }
    }, autoDeleteTime);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [toastList, autoDelete, autoDeleteTime, list]);

  const deleteToast = (id: number) => {
    const listItemIndex = list.findIndex(e => e.id === id);
    const toastListItem = toastList.findIndex(e => e.id === id);
    list.splice(listItemIndex, 1);
    toastList.splice(toastListItem, 1);
    setList([...list]);
  };

  return (
    <>
      {mounted &&
        document.querySelector<HTMLElement>("#portal") &&
        createPortal(
          <div className={`${styles.notificationContainer} ${renderPosition()}`}>
            {list.map((toast, i) => (
              <div key={i} className={`${styles.notification} ${styles.toast} ${renderPosition()}`}>
                <button className={styles.close} onClick={() => deleteToast(toast.id)}>
                  <Close />
                </button>
                <div className={styles.notificationBox}>
                  <div className={styles.notificationImage}>{renderIcon(toast.type)}</div>
                  <div className={styles.notificationDetailContainer}>
                    <p className={styles.notificationTitle}>{toast.title}</p>
                    <p className={styles.notificationMessage}>{toast.message}</p>
                    {toast.netPrice !== undefined && (
                      <Flex>
                        <div className={`${styles.premiumMessage} mt-4`}>
                          Net Premium To {toast.netPrice < 0 ? "Receive" : "Pay"}
                        </div>{" "}
                        <div className='ml-6 color-white fs-sm'>
                          {toast.netPrice < 0 ? toast.netPrice * -1 : toast.netPrice}
                        </div>{" "}
                        <LogoUsdc /> <div className={`${styles.premiumMessage} mt-4`}>USDC</div>
                      </Flex>
                    )}
                    <Flex>
                      {toast.viewOrder && (
                        <div className={styles.liveOrderWrapper}>
                          <Button
                            title='Click to View Live Order '
                            size='sm'
                            variant='secondary'
                            onClick={() => router.push("/dashboard")}
                          >
                            View Live Order
                          </Button>
                        </div>
                      )}
                      {toast.hyper && (
                        <div className={styles.notificationHyperContainer}>
                          <a href={toast.hyper.hyperLink} className={styles.notificationHyper}>
                            {toast.hyper.hyperText}
                          </a>

                          <svg
                            width='14'
                            height='14'
                            viewBox='0 0 14 14'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M13 5L13 1M13 1H9M13 1L7.66667 6.33333M5.66667 2.33333H4.2C3.0799 2.33333 2.51984 2.33333 2.09202 2.55132C1.71569 2.74307 1.40973 3.04903 1.21799 3.42535C1 3.85318 1 4.41323 1 5.53333V9.8C1 10.9201 1 11.4802 1.21799 11.908C1.40973 12.2843 1.71569 12.5903 2.09202 12.782C2.51984 13 3.0799 13 4.2 13H8.46667C9.58677 13 10.1468 13 10.5746 12.782C10.951 12.5903 11.2569 12.2843 11.4487 11.908C11.6667 11.4802 11.6667 10.9201 11.6667 9.8V8.33333'
                              stroke='#5EE192'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                      )}
                    </Flex>
                  </div>
                </div>
              </div>
            ))}
          </div>,
          document.querySelector<HTMLElement>("#portal") as HTMLElement
        )}
    </>
  );
};

export default Toast;
