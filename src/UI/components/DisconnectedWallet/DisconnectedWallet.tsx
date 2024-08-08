// Components
import Wallet from "@/UI/components/Wallet/Wallet";

// Styles
import styles from "./DisconnectedWallet.module.scss";

// Types
type DisconnectedWalletProps = {
  showButton?: boolean;
};

const DisconnectedWallet = ({ showButton = true }: DisconnectedWalletProps) => {
  return (
    <div className={styles.container}>
      <p>Please connect wallet to check your details.</p>
      {showButton && <Wallet />}
    </div>
  );
};

export default DisconnectedWallet;
