import { ReactNode } from "react";
import classNames from "classnames";
// Components
import LogoEth from "@/UI/components/Icons/LogoEth";

import ConnectWalletButton from "@/UI/components/ConnectWalletButton";
import CurrencyDisplay from "@/UI/components/CurrencyDisplay/CurrencyDisplay";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";

// Layouts
import { useDevice } from "@/UI/hooks/useDevice";
import Flex from "@/UI/layouts/Flex/Flex";
import Panel from "@/UI/layouts/Panel/Panel";
import { useAppStore } from "@/UI/lib/zustand/store";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";
import { OrderSummaryType } from "@/types/orderSummary";

import { HideData } from "../HideData";
import styles from "./OrderSummary.module.scss";
import SubmitButton from "./SubmitButton";
import { calculateTotalPremium } from "./helpers";
import { useUserBalance } from "../../hooks/useUserBalance";

// Types
type OrderSummaryProps = {
  orderSummary: OrderSummaryType | undefined;
  submitAuction: () => void;
  asContainer?: boolean;
  onlyProtiftableOrders?: boolean;
  isSubmitButtonDisabled?: boolean;
};

const Container = ({ asContainer, children }: { asContainer: boolean; children: ReactNode }) => {
  const device = useDevice();
  return asContainer ? (
    <Panel margin={`'br-20 p-20 ${device === "desktop" ? "" : "mt-16"}`}>{children}</Panel>
  ) : (
    <>{children}</>
  );
};

const OrderSummary = ({
  orderSummary,
  onlyProtiftableOrders = false,
  isSubmitButtonDisabled = false,
  submitAuction,
  asContainer = true,
}: OrderSummaryProps) => {
  const { isLocationRestricted } = useAppStore();
  const { collateralSummary } = useUserBalance();
  const limit = orderSummary?.order.totalNetPrice;
  const collatarelETH = (orderSummary?.orderLock?.underlierAmount || 0) - collateralSummary["WETH"].orderValue;
  const collatarelUSDC = (orderSummary?.orderLock?.numeraireAmount || 0) - collateralSummary["USDC"].orderValue;
  const premium = orderSummary?.order.totalNetPrice;
  const fee = orderSummary?.orderFees?.numeraireAmount;

  const device = useDevice();

  const isPaying = Number(premium) > 0;

  return (
    <div className='tw-flex tw-flex-1 tw-flex-col tw-justify-end'>
      <HideData title='Location Restricted' visible={isLocationRestricted}>
        <Container asContainer={asContainer}>
          {!asContainer && <h3 className={`mb-12 mt-10 ${device !== "desktop" && "full-width"}`}>Order Summary</h3>}
          <Flex
            direction={device === "desktop" ? "row-space-between" : "column-space-between"}
            gap={device !== "desktop" ? "gap-16" : "gap-6"}
          >
            {asContainer && <h3 className={`mb-0 ${device !== "desktop" && "full-width"}`}>Order Summary</h3>}
            <div className={styles.orderWrapper}>
              <Flex direction={device === "desktop" ? "column" : "row-space-between"} gap='gap-6'>
                <h5>Order Limit</h5>
                <CurrencyDisplay
                  amount={formatNumberByCurrency(Math.abs(Number(limit)), "string", "USDC")}
                  symbol={<LogoUsdc />}
                  currency='USDC'
                />
              </Flex>
            </div>
            <Flex direction={device === "desktop" ? "column" : "row-space-between-start"} gap='gap-6'>
              <h5>Collateral Requirement</h5>
              <div>
                <Flex direction={device === "desktop" ? "row" : "column"} gap='gap-10'>
                  <CurrencyDisplay
                    amount={formatNumberByCurrency(Math.max(Number(collatarelETH), 0), "string", "WETH")}
                    symbol={<LogoEth />}
                    currency='WETH'
                  />
                  <CurrencyDisplay
                    amount={formatNumberByCurrency(Math.max(Number(collatarelUSDC), 0), "string", "USDC")}
                    symbol={<LogoUsdc />}
                    currency='USDC'
                  />
                </Flex>
              </div>
            </Flex>
            <div className={styles.platformWrapper}>
              <Flex direction={device === "desktop" ? "column" : "row-space-between"} gap='gap-6'>
                <h5 className=''>Platform Fee</h5>
                <CurrencyDisplay
                  amount={formatNumberByCurrency(Number(fee), "string", "USDC")}
                  symbol={<LogoUsdc />}
                  currency='USDC'
                />
              </Flex>
            </div>
            <Flex direction={device === "desktop" ? "column" : "row-space-between"} gap='gap-6'>
              <h5 className='color-white'>Total Premium</h5>
              <div className='tw-flex tw-items-center tw-gap-x-1 '>
                <span className={"tw-mt-[2px] tw-text-xs tw-text-ithaca-white-60"}>{isPaying ? "Pay" : "Receive"}</span>
                <CurrencyDisplay
                  amount={premium ? calculateTotalPremium(premium, fee) : "-"}
                  symbol={<LogoUsdc />}
                  currency='USDC'
                  className={classNames({
                    "!tw-text-ithaca-red-20": isPaying,
                    "!tw-text-ithaca-green-30": !isPaying,
                  })}
                />
              </div>
            </Flex>
            <Flex direction='column'>
              <ConnectWalletButton>
                {({ connected, openConnectModal }) => {
                  return (
                    <SubmitButton
                      isSubmitButtonDisabled={isSubmitButtonDisabled}
                      onlyProtiftableOrders={onlyProtiftableOrders}
                      submitAuction={submitAuction}
                      openConnectModal={openConnectModal}
                      connected={connected}
                      orderSummary={orderSummary}
                    />
                  );
                }}
              </ConnectWalletButton>
            </Flex>
          </Flex>
        </Container>
      </HideData>
    </div>
  );
};

export default OrderSummary;
