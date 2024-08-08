// Packages

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { getWelcomeBonusPoints, updateWelcomeBonusPoints } from "@/UI/services/PointsAPI";
import ModalWelcomePoints from "../ModalWelcomePoints/ModalWelcomePoints";

import { useAppStore } from "@/UI/lib/zustand/store";

// Components
import ConnectWalletIcon from "../Icons/ConnectWalletIcon";
import ChevronDown from "../Icons/ChevronDown";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";

// Utils
import mixPanel from "@/services/mixpanel";
import ModalAcknowledgeTerms from "../ModalAcknowledgeTerms/ModalAcknowledgeTerms";
import LocationRestrictedModal from "../LocationRestricted/LocationRestrictedModal";

// Styles
import styles from "./Wallet.module.scss";

import { toast } from "react-toastify";
import CustomAlert from "../CustomAlert";
import classNames from "classnames";

const Wallet = () => {
  const { connectModalOpen } = useConnectModal();
  const { connector } = useAccount();
  const [walletConnectOption, setWalletConnectOption] = useState<Element | null>();
  const { address } = useAccount();
  const router = useRouter();

  const { ithacaSDK, isAuthenticated, isLocationRestricted } = useAppStore();
  const [welcomeBonusePoints, setWelcomeBonusePoints] = useState({ points: 0, showed: false });

  const [showModal, setShowModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [showLocationRestrictedModal, setShowLocationRestrictedModal] = useState(false);
  const getSession = async () => {
    if (isAuthenticated) {
      const result = await ithacaSDK.auth.getSession();
      if (!result?.accountInfos?.tc_confirmation) {
        setShowModal(true);
        if (address) {
          const points = await getWelcomeBonusPoints(address);
          if (points?.data?.points) {
            setWelcomeBonusePoints(points.data);
          }
        }
      }
    }
  };

  const trigger1 = () => {
    toast(
      <CustomAlert
        title={"Step 1 - Connect Wallet"}
        content={
          "Scan QR Code with your phone and approve connection to Ithaca App interface within your WalletConnect compatible wallet."
        }
      />,
      { autoClose: false, position: "bottom-right" }
    );
  }

  const trigger2 = () => {
    toast(
      <CustomAlert
        title={"Step 1 - Connect Wallet"}
        content={
          "Scan QR Code with your phone and approve connection to Ithaca App interface within your Rabby Wallet."
        }
      />,
      { autoClose: false, position: "bottom-right" }
    );
  }

  useEffect(() => {
    if (walletConnectOption) return;
    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    const handleMutation: MutationCallback = mutationList => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          const walletConnectElement = document.querySelector("[data-testid='rk-wallet-option-walletConnect']");
          const rabbyWalletElement = document.querySelector("[data-testid='rk-wallet-option-io.rabby']");
          setWalletConnectOption(walletConnectElement || rabbyWalletElement);
          if (walletConnectElement)
            walletConnectElement.addEventListener("click", trigger1);
          if (rabbyWalletElement) {
            rabbyWalletElement.addEventListener("click", trigger2);
          }
        }
      }
    };
    const observer = new MutationObserver(handleMutation);
    observer.observe(targetNode, config);
    return () => {
      observer.disconnect();
    };
  }, [walletConnectOption]);

  useEffect(() => {
    if (connector?.id === "walletConnect") {
      toast(
        <CustomAlert
          title={"WalletConnect Approved"}
          content={"Your wallet has been connected to Ithaca App Interface."}
        />,
        { autoClose: false, position: "bottom-right" }
      );
      toast(
        <CustomAlert
          title={"Step 2 - Verify Wallet Ownership"}
          content={
            "Sign message in your WalletConnect compatible wallet so as to verify wallet’s ownership and trade on Ithaca App."
          }
        />,
        { autoClose: false, position: "bottom-right" }
      );
    } else if (connector?.id === "io.rabby") {
      toast(
        <CustomAlert
          title={"Rabby Wallet Approved"}
          content={"Your wallet has been connected to Ithaca App Interface."}
        />,
        { autoClose: false, position: "bottom-right" }
      );
      toast(
        <CustomAlert
          title={"Step 2 - Verify Wallet Ownership"}
          content={
            "Sign message in your Rabby Wallet so as to verify wallet’s ownership and trade on Ithaca App."
          }
        />,
        { autoClose: false, position: "bottom-right" }
      );
    }
  }, [connector]);

  useEffect(() => {
    if (connectModalOpen === false) {
      setWalletConnectOption(null);
      const walletConnectElement = document.querySelector("[data-testid='rk-wallet-option-walletConnect']");
      const rabbyWalletElement = document.querySelector("[data-testid='rk-wallet-option-io.rabby']");
      walletConnectElement?.removeEventListener("click", trigger1);
      rabbyWalletElement?.removeEventListener("click", trigger2);
    }
  }, [connectModalOpen]);

  useEffect(() => {
    getSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleAgreeAndContinue = async () => {
    try {
      const response = await ithacaSDK.points.addAccountData("tc_confirmation", "true");
      // POINTS_EVENTS: Account created - service connected
      mixPanel.track("Account created");
      if (response.result === "OK") {
        setShowModal(false);
        if (welcomeBonusePoints.points) {
          setShowWelcomeModal(true);
        }
      }
    } catch (error) {
      setShowModal(false);
    }
  };

  const onCloseWelcomeModal = (tradeClicked: boolean) => {
    if (tradeClicked) {
      mixPanel.track("Welcome bonus Trade clicked");
      router.push("/trading/dynamic-option-strategies");
    }
    address && updateWelcomeBonusPoints(address);
    setShowWelcomeModal(false);
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              className: styles.container,
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type='button'
                    className={classNames(styles.connectWallet, "tw-rounded-2xl")}
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type='button'
                    className={classNames(styles.wrongNetwork, "tw-rounded-2xl")}
                  >
                    Wrong network
                    <ChevronDown color='#fff' />
                  </button>
                );
              }

              // Has to be last to allow for connecting
              if (isLocationRestricted) {
                return (
                  <>
                    <LocationRestrictedModal
                      isOpen={showLocationRestrictedModal}
                      onCloseModal={() => setShowLocationRestrictedModal(false)}
                    />
                    <button
                      onClick={() => setShowLocationRestrictedModal(true)}
                      type='button'
                      className={classNames(styles.wrongNetwork, styles.locationRestricted, "tw-rounded-2xl")}
                    >
                      Location Restricted
                    </button>
                  </>
                );
              }

              return (
                <div className={styles.termsContainer}>
                  <ModalWelcomePoints
                    isOpen={showWelcomeModal}
                    onCloseModal={onCloseWelcomeModal}
                    points={welcomeBonusePoints?.points}
                  />
                  <ModalAcknowledgeTerms
                    isOpen={showModal && connected}
                    onCloseModal={() => setShowModal(false)}
                    onDisconnectWallet={openAccountModal}
                    onAgreeAndContinue={handleAgreeAndContinue}
                  />

                  <button
                    onClick={openAccountModal}
                    type='button'
                    className={classNames(styles.connectedWallet, "tw-rounded-2xl")}
                  >
                    <span className={styles.displayName}>{account.displayName}</span>
                    <ConnectWalletIcon />
                    <ChevronDown className={styles.chevron} />
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default Wallet;
