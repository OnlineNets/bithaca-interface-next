// Packages
import { useAccount, useBlockNumber, usePublicClient, useWalletClient, useWatchBlockNumber } from "wagmi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { formatUnits, parseAbi, parseUnits } from "viem";
// Constants
import { DESKTOP_BREAKPOINT } from "@/UI/constants/breakpoints";

// Store
import { useAppStore } from "@/UI/lib/zustand/store";

// Hooks
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import useToast from "@/UI/hooks/useToast";

// Components
import Button from "@/UI/components/Button/Button";
import TableCollateral from "@/UI/components/TableCollateral/TableCollateral";
import DisconnectedWallet from "@/UI/components/DisconnectedWallet/DisconnectedWallet";
import Toast from "@/UI/components/Toast/Toast";
import ManageFundsModal from "./ManageFundsModal";
import ButtonDropdown from "../DropdownMenu/ButtonDropdown";
// Layouts
import Flex from "@/UI/layouts/Flex/Flex";
import Panel from "@/UI/layouts/Panel/Panel";
import { DropDownOption } from "../DropdownMenu/DropdownMenu";
import { isProd } from "@/UI/utils/RainbowKit";

import { useUserBalance } from "../../hooks/useUserBalance";
import { getActiveChain } from "@/UI/utils/RainbowKitHelpers";
import { FundlockHistory } from "@ithaca-finance/sdk";

type CollateralPanelProps = {
  setDashboardTab: Dispatch<SetStateAction<string>>;
};

const CollateralPanel = ({ setDashboardTab }: CollateralPanelProps) => {
  const { systemInfo, isAuthenticated, ithacaSDK } = useAppStore();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const desktopBreakpoint = useMediaQuery(DESKTOP_BREAKPOINT);

  const [selectedCurrency, setSelectedCurrency] = useState<{ name: string; value: `0x${string}` }>();
  const [modalTab, setModalTab] = useState<"deposit" | "withdraw">();
  const [fundsToBeReleased, setFundsToBeReleased] = useState<Record<string, number>>({});
  const { toastList, position, showToast } = useToast();
  const { collateralSummary, handleFetchingBalance } = useUserBalance();

  useEffect(() => {
    fetchData();
  }, []);

  const getFaucet = async (currency: string) => {
    if (!walletClient) return;
    try {
      const hash = await walletClient.writeContract({
        address: systemInfo.tokenAddress[currency] as `0x${string}`,
        abi: parseAbi(["function mint(address to, uint256 amount) external"]),
        functionName: "mint",
        args: [walletClient.account.address, parseUnits("5000", systemInfo.tokenDecimals[currency])],
      });
      await publicClient?.waitForTransactionReceipt({ hash });
    } catch (error) {
      showToast(
        {
          id: Math.floor(Math.random() * 1000),
          title: "Faucet Failed",
          message: "Faucet Failed, please try again.",
          type: "error",
        },
        "bottom-right"
      );
      console.error("Failed to claim faucet", error);
    }
  };

  // Get funds to be released data
  const fetchData = async () => {
    if (!isAuthenticated) return;
    const data = await ithacaSDK.fundlock.fundlockHistory();
    transformData(data);
  };

  useWatchBlockNumber({
    chainId: getActiveChain().id,
    enabled: isAuthenticated,
    onBlockNumber: fetchData,
  });

  const transformData = (data: FundlockHistory) => {
    const walletAddresses = Object.keys(systemInfo.tokenAddress).reduce(
      (obj, key) => {
        obj[systemInfo.tokenAddress[key].toLowerCase() as string] = key;
        return obj;
      },
      {} as Record<string, string>
    );
    const withdrawalAmounts = data.withdrawalRequests.reduce(
      (obj, entry) => {
        const currency = walletAddresses[entry.token];
        if (obj[currency])
          obj[currency] = obj[currency] + Number(formatUnits(BigInt(entry.amount), systemInfo.tokenDecimals[currency]));
        else obj[currency] = Number(formatUnits(BigInt(entry.amount), systemInfo.tokenDecimals[currency]));
        return obj;
      },
      {} as Record<string, number>
    );

    setFundsToBeReleased(withdrawalAmounts);
  };

  const showModal = (type: "deposit" | "withdraw") => {
    setModalTab(type);
    setSelectedCurrency({
      name: Object.keys(collateralSummary)[0],
      value: systemInfo.tokenAddress[Object.keys(collateralSummary)[0]],
    });
  };

  const facuetChange = (value: string, selectedOption: DropDownOption) => {
    getFaucet(selectedOption.value);
  };

  return (
    <>
      <Panel margin='p-desktop-30 p-mobile-16 p-16'>
        <h3 className='tw-text-base'>Collateral</h3>
        <Toast toastList={toastList} position={position} />
        <TableCollateral
          collateralSummary={collateralSummary}
          fundsToBeReleased={fundsToBeReleased}
          deposit={(currency: string) => {
            setModalTab("deposit");
            setSelectedCurrency({ name: currency, value: systemInfo.tokenAddress[currency] });
          }}
          withdraw={(currency: string) => {
            setModalTab("withdraw");
            setSelectedCurrency({ name: currency, value: systemInfo.tokenAddress[currency] });
          }}
          faucet={currency => getFaucet(currency)}
        />
        {desktopBreakpoint && isAuthenticated && (
          <Flex direction='row-center-nowrap' gap='gap-8' margin='mt-16'>
            <Button
              title='Click to withdraw'
              size='sm'
              variant='secondary'
              onClick={() => showModal("withdraw")}
              className='full-width'
            >
              Withdraw
            </Button>
            <Button
              title='Click to deposit'
              variant='primary'
              size='sm'
              role='button'
              onClick={() => showModal("deposit")}
              className='full-width'
            >
              Deposit
            </Button>

            {!isProd && (
              <ButtonDropdown
                label='Faucet'
                onChange={facuetChange}
                className='full-width'
                options={[
                  {
                    name: "WETH",
                    value: "WETH",
                  },
                  {
                    name: "USDC",
                    value: "USDC",
                  },
                ]}
              />
            )}
          </Flex>
        )}
        {!address && <DisconnectedWallet />}
      </Panel>
      <ManageFundsModal
        setIsFetchingBalanceEnabled={handleFetchingBalance}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        modalTab={modalTab}
        setModalTab={setModalTab}
        setDashboardTab={setDashboardTab}
      />
    </>
  );
};

export default CollateralPanel;
