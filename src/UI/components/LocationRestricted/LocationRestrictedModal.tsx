import React from "react";

// Components
import Button from "@/UI/components/Button/Button";
import Modal from "@/UI/components/Modal/Modal";

// Styles
import styles from "./LocationRestrictedModal.module.scss";

// Types
type ModalAcknowledgeTermsProps = {
  isOpen: boolean;
  onCloseModal: () => void;
};

const LocationRestrictedModal = ({ isOpen, onCloseModal }: ModalAcknowledgeTermsProps) => {
  return (
    <Modal
      title='Location restricted'
      isOpen={isOpen}
      onCloseModal={onCloseModal}
      hideFooter={false}
      showCloseIcon={false}
      className={styles.modalSize}
    >
      <div className={styles.container}>
        <p className={styles.title}>
          Our service is not available in your region. We will update our available countries list from time to time.
          Please stay tuned for more updates.
        </p>

        <Button
          title='Agree and Continue'
          variant='primary'
          onClick={onCloseModal}
          size='sm'
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default LocationRestrictedModal;
