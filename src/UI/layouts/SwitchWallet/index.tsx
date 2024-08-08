import { useEffect, useMemo, useState } from "react";

import { useAccount, useWalletClient } from "wagmi";

import Link from "next/link";
import useToast from "@/UI/hooks/useToast";
import { maskString } from "@/UI/utils/Text";
import Toast from "@/UI/components/Toast/Toast";
import { useQuery } from "@tanstack/react-query";
import SwitchIcon from "@/assets/icons/switch.svg";
import WalletIcon from "@/assets/icons/wallet.svg";
import { useAppStore } from "@/UI/lib/zustand/store";
import { getSessionInfo } from "@/UI/services/PointsAPI";
import { CloseButton, Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

export const SwitchWallet = () => {
  const { ithacaSDK, isAuthenticated } = useAppStore();
  const [isSwitchedAlready, setIsSwitchedAlready] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { showSuccessToast, showErrorToast, toastList } = useToast();

  const { data: { payload } = { payload: [] }, refetch: refetchWallets } = useQuery({
    queryKey: ["switchList"],
    queryFn: () => ithacaSDK.wallets.switchList(),
    enabled: isAuthenticated,
    refetchInterval: 5_000,
  });

  useEffect(() => {
    const checkSession = () => {
      const session = getSessionInfo();
      if (session.origAddr) {
        setIsSwitchedAlready(true);
      }
    };

    if (isAuthenticated) {
      checkSession();
      const interval = setInterval(() => checkSession(), 5_000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const selectWallet = async (addr: string) => {
    try {
      const newSession = await ithacaSDK.auth.switchAuth({ addr: addr.toLocaleLowerCase() });
      setIsSwitchedAlready(Boolean(newSession.origAddr));
      localStorage.setItem("ithaca.session", JSON.stringify(newSession));
      refetchWallets();
      showSuccessToast({
        title: "Wallet switched",
        message: `Wallet switched to ${maskString(addr)} successfully`,
      });
    } catch (error) {
      showErrorToast({
        title: "Wallet switch failed",
        message: `Wallet switch to ${maskString(addr)} failed`,
      });
      console.error(error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div>
      <Toast toastList={toastList} position={"bottom-right"} />
      <Popover className='tw-relative'>
        <PopoverButton className='tw-mr-2 tw-flex tw-items-center tw-justify-center tw-outline-none'>
          <SwitchIcon />
        </PopoverButton>
        <PopoverPanel
          anchor='bottom'
          className='tw-shadow-panel tw-z-10 tw-mt-5 tw-box-border tw-flex tw-flex-col tw-rounded-lg tw-bg-black-dark tw-backdrop-blur-[100px] focus:tw-ring-0'
        >
          <CloseButton className='tw-flex tw-cursor-default tw-flex-row tw-items-center tw-gap-2 tw-rounded-tl-lg tw-rounded-tr-lg tw-px-4 tw-py-3 tw-text-white hover:tw-text-ithaca-green-30 '>
            <div className='tw-flex tw-flex-col'>
              <p>No delegated wallet. Go to</p>
              <Link className='tw-p-2 tw-underline' href='/account-access-management'>
                Account Access Management
              </Link>
              <p>to delegate a wallet</p>
            </div>
          </CloseButton>
          {isSwitchedAlready && walletClient?.account && (
            <CloseButton
              onClick={() => selectWallet(walletClient.account.address)}
              className='tw-flex tw-flex-row tw-items-center tw-gap-2 tw-rounded-tl-lg tw-rounded-tr-lg tw-px-4 tw-py-3 tw-text-white hover:tw-text-ithaca-green-30 '
            >
              <WalletIcon />
              <span className='tw-text-base tw-font-normal'>
                Switch Back ({maskString(walletClient.account.address)})
              </span>
            </CloseButton>
          )}
          {payload.map((address: string) => (
            <CloseButton
              key={maskString(address)}
              onClick={() => selectWallet(address)}
              className='tw-flex tw-flex-row tw-items-center tw-gap-2 tw-rounded-tl-lg tw-rounded-tr-lg tw-px-4 tw-py-3 tw-text-white hover:tw-text-ithaca-green-30 '
            >
              <WalletIcon />
              <span className='tw-text-base tw-font-normal'>Switch to: {maskString(address)}</span>
            </CloseButton>
          ))}
        </PopoverPanel>
      </Popover>
    </div>
  );
};
