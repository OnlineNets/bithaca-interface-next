import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAppStore } from "@/UI/lib/zustand/store";

type Props = {
  children(props: {
    openAccountModal: () => void;
    openChainModal: () => void;
    openConnectModal: () => void;
    connected?: boolean;
    isLocationRestricted?: boolean;
    ready: boolean;
  }): React.ReactNode;
};

export default function ConnectWalletButton(props: Props) {
  const { isLocationRestricted } = useAppStore();

  return (
    <ConnectButton.Custom>
      {btnProps => {
        const ready = btnProps.mounted && btnProps.authenticationStatus !== "loading";
        const connected =
          ready &&
          btnProps.account &&
          btnProps.chain &&
          (!btnProps.authenticationStatus || btnProps.authenticationStatus === "authenticated");
        return props.children({ isLocationRestricted, connected, ready, ...btnProps });
      }}
    </ConnectButton.Custom>
  );
}
