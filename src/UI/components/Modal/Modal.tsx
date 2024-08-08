// Packages
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";

// Components
import Button from "@/UI/components/Button/Button";
import Loader from "@/UI/components/Loader/Loader";
import ModalClose from "@/UI/components/Icons/ModalClose";

// Styles
import styles from "./Modal.module.scss";

// Animation
const animatedModal = {
  hidden: { opacity: 1, scale: 1 },
  visible: {
    y: "0",
    scale: [0.2, 1.1, 1],
    opacity: 1,
    transition: {
      scale: { type: "tween", duration: 0.5 },
    },
  },
  exit: {
    y: "0",
    opacity: 0,
  },
};

// Types
type ModalProps = {
  children: React.ReactNode;
  title: string | React.ReactNode;
  onCloseModal: () => void;
  onSubmitOrder?: () => void;
  isLoading?: boolean;
  isOpen: boolean;
  hideFooter?: boolean;
  className?: string;
  headerContainerClassName?: string;
  showCloseIcon?: boolean;
};

const Modal = ({
  children,
  title,
  onCloseModal,
  onSubmitOrder,
  isLoading,
  isOpen,
  hideFooter,
  className,
  headerContainerClassName,
  showCloseIcon = true,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("is-active");
    } else {
      document.body.classList.remove("is-active");
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseModal();
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.classList.remove("is-active");
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onCloseModal]);

  const modalContent = (
    <motion.div
      className={styles.modalBackdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onCloseModal()}
    >
      <motion.div
        onClick={(e: React.MouseEvent<Element, Event>) => e.stopPropagation()}
        className={`${styles.modal} ${className}`}
        variants={animatedModal}
        initial='hidden'
        animate='visible'
        exit='exit'
      >
        <div className={`${styles.modalHeader} ${headerContainerClassName || ""}`}>
          <h4 className={styles.modalTitle}>{title}</h4>
          {showCloseIcon ? (
            <Button onClick={onCloseModal} className={styles.buttonClose} title='Click to close modal'>
              <ModalClose />
            </Button>
          ) : null}
        </div>
        <div className={styles.modalContent}>{children}</div>
        {!hideFooter && onSubmitOrder ? (
          <div className={styles.modalFooter}>
            <Button
              className={`${styles.confirmButton} ${isLoading ? styles.buttonLoading : ""}`}
              onClick={onSubmitOrder}
              title='Click to confirm'
            >
              {isLoading ? <Loader /> : "Confirm"}
            </Button>
          </div>
        ) : (
          ""
        )}
      </motion.div>
    </motion.div>
  );

  return isOpen && document.body
    ? ReactDOM.createPortal(
        <AnimatePresence initial={true} mode='wait'>
          {modalContent}
        </AnimatePresence>,
        document.body
      )
    : null;
};

export default Modal;
