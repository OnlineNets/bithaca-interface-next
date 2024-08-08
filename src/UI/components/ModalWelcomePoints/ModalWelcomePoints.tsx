import React, { useState } from "react";

// Components
import Button from "@/UI/components/Button/Button";
import Modal from "@/UI/components/Modal/Modal";
import WelcomeImage from "@/assets/welcome-points-bg.png";

// Styles
import styles from "./ModalWelcomePoints.module.scss";
import Image from "next/image";

// Types
type ModalWelcomePointsProps = {
  children?: React.ReactNode;
  isOpen: boolean;
  points: number;
  onCloseModal: (tradeClicked: boolean) => void;
};

const ModalWelcomePoints = ({ isOpen, onCloseModal, points }: ModalWelcomePointsProps) => {
  const pointsStr = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(points);
  return (
    <Modal
      title=''
      headerContainerClassName={styles.modalHeaderContainer}
      isOpen={isOpen}
      onCloseModal={() => onCloseModal(false)}
      hideFooter={false}
      showCloseIcon={false}
      className={styles.tncModal}
    >
      <Image src={WelcomeImage} alt='Welcome' className={styles.welcomeImage} />
      <div className={styles.container}>
        <h2 className={styles.title}>Claim</h2>
        <div>
          <div className={styles.pointCont}>{pointsStr} point</div>
        </div>
        <p className={styles.description}>
          Activate your points by trading at least $20 notional digital calls/puts, 0.2 ETH notional calls/puts OR 1 ETH
          notional forwards
        </p>
        <div className={styles.buttonContainer}>
          <Button
            title='Trade Now'
            variant='primary'
            onClick={() => onCloseModal(true)}
            size='sm'
            className={`${styles.button} ${styles.primaryButton}`}
          >
            Trade Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalWelcomePoints;
