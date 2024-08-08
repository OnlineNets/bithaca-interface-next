import { useWalletClient } from "wagmi";
import styles from "./ReconnectWallet.module.scss";
import { useAppStore } from "@/UI/lib/zustand/store";
import ConnectIcon from "@/assets/icons/connect.svg";

interface Props {
  title: string;
  content: string;
}

const ReconnectWallet = ({ title, content }: Props) => {
  const { initIthacaSDK } = useAppStore();
  const { data: walletClient } = useWalletClient();

  const signAgain = () => {
    if (!walletClient) return;
    initIthacaSDK(walletClient)
  }

  return (
    <div className='tw-flex tw-space-x-2.5 tw-rounded-[16px] tw-bg-[rgba(18,23,34,.9)] tw-p-5'>
      <div className='tw-min-h-6 tw-min-w-6'>
        <ConnectIcon />
      </div>
      <div className='tw-flex tw-flex-col tw-space-y-2.5 tw-text-white'>
        <span className='tw-mt-0.5 tw-font-lato tw-text-[18px] tw-font-semibold'>
          {title}
        </span>
        <span className='tw-font-lato tw-text-[16px]'>{content}</span>
        <button onClick={signAgain} type='button' className={styles.connectWallet}>
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default ReconnectWallet;
