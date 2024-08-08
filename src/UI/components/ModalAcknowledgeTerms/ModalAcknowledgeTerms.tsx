import React, { useState } from "react";

// Components
import Button from "@/UI/components/Button/Button";
import Modal from "@/UI/components/Modal/Modal";
import CheckBox from "@/UI/components/CheckBox/CheckBox";

// Styles
import styles from "./ModalAcknowledgeTerms.module.scss";

// Types
type ModalAcknowledgeTermsProps = {
  children?: React.ReactNode;
  isOpen: boolean;
  isLoading?: boolean;
  onCloseModal: () => void;
  onDisconnectWallet?: () => void;
  onAgreeAndContinue?: () => void;
};

const ModalAcknowledgeTerms = ({
  isOpen,
  isLoading,
  onCloseModal,
  onDisconnectWallet,
  onAgreeAndContinue,
}: ModalAcknowledgeTermsProps) => {
  const [terms, setTerms] = useState([
    {
      id: 1,
      name: "By ticking this box, I confirm I have read, understood and accepted the General Terms and Conditions of Use governing the Infrastructure (as defined in the T&Cs).",
      isChecked: false,
    },
    {
      id: 2,
      name: "By ticking this box, I confirm I have read, understood and accepted the Privacy Policy governing the treatment of my personal information.",
      isChecked: false,
    },
    {
      id: 3,
      name: "By ticking this box, I acknowledge that blockchain technology and crypto-assets carry significant risks for users, including the possible loss of all value allocated in crypto-assets. Such risks arise from the novelty of this technology, the regulatory uncertainty, the possibility of hacking, the high volatility and the information asymmetry characterising the crypto market. Users should not purchase crypto assets with funds they cannot afford to lose.",
      isChecked: false,
    },
    {
      id: 4,
      name: "By ticking this box, I acknowledge that the information and data provided through the Interface (as defined in the T&Cs) are not intended as financial advice, trading advice, or any other type of advice. The Interface aims to provide information about the Infrastructure, its technical characteristics and features. Adequate professional advice in the financial, legal and technical fields shall be sought before using the Interface.",
      isChecked: false,
    },
    {
      id: 5,
      name: "By ticking this box, I acknowledge that I am not a U.S. resident, citizen or company incorporate in any restricted region.",
      isChecked: false,
    },
  ]);

  const handleOnChangeCheckBox = (id: number) => {
    const updateTerms = terms.map(term => {
      return {
        ...term,
        isChecked: term.id === id ? !term.isChecked : term.isChecked,
      };
    });
    setTerms(updateTerms);
  };

  const disabledButton = () => terms.some(term => term.isChecked == false);

  return (
    <Modal
      title='Legal Terms'
      isOpen={isOpen}
      isLoading={isLoading}
      onCloseModal={onCloseModal}
      hideFooter={false}
      showCloseIcon={false}
      className={styles.tncModal}
    >
      <div className={styles.acknowledgeTerms}>
        <p className={styles.title}>Check the boxes to confirm your acknowledgement and acceptance of the following:</p>
        {terms.map(term => (
          <CheckBox
            key={term.id}
            label={term.name}
            checked={term.isChecked}
            labelClassName={styles.labelCheckBox}
            className={styles.checkBox}
            onChange={() => handleOnChangeCheckBox(term.id)}
          />
        ))}

        <div className={styles.buttonContainer}>
          <Button
            title='Disconnect Wallet'
            variant='outline'
            onClick={onDisconnectWallet}
            size='sm'
            className={styles.button}
          >
            Disconnect Wallet
          </Button>
          <Button
            title='Agree and Continue'
            variant='primary'
            onClick={onAgreeAndContinue}
            size='sm'
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={disabledButton()}
          >
            Agree and Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalAcknowledgeTerms;
