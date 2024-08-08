import { useMemo } from "react";

import Main from "@/UI/layouts/Main/Main";
import Meta from "@/UI/components/Meta/Meta";
import Panel from "@/UI/layouts/Panel/Panel";
import { useQuery } from "@tanstack/react-query";
import Button from "@/UI/components/Button/Button";
import { OptionsData } from "@/UI/constants/prices";
import { useAppStore } from "@/UI/lib/zustand/store";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Container from "@/UI/layouts/Container/Container";
import OptionsTable from "@/UI/components/OptionsTable/OptionsTable";
import ForwardsTable from "@/UI/components/ForwardsTable/ForwardsTable";
import HeaderWithInformation from "@/UI/components/HeaderWithInformation";

import styles from "./pricing.module.scss";
import LogoEth from "@/UI/components/Icons/LogoEth";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";

const Pricing = () => {
  const { isAuthenticated, contractsWithReferencePrices, currentExpiryDate, fetchBestBidAskPrecise } = useAppStore();

  const { data, refetch } = useQuery({
    enabled: isAuthenticated,
    queryKey: ["bestBidAsk", contractsWithReferencePrices, currentExpiryDate],
    queryFn: () => fetchBestBidAskPrecise(),
    select: data => {
      const tempData: OptionsData[] = [];
      for (const key in contractsWithReferencePrices) {
        if (contractsWithReferencePrices[key].economics.expiry === currentExpiryDate) {
          tempData.push({ ...contractsWithReferencePrices[key], ...data[key] });
        }
      }

      return tempData;
    },
  });

  const options = useMemo(() => {
    return data?.filter(el => ["Put", "Call"].includes(el.payoff)) || [];
  }, [data]);

  const digitalOptions = useMemo(() => {
    return data?.filter(el => ["BinaryPut", "BinaryCall"].includes(el.payoff)) || [];
  }, [data]);

  const refreshPrices = () => {
    refetch();
  };

  return (
    <>
      <Meta />
      <Main>
        <Container>
          <div className={styles.wrapper}>
            <HeaderWithInformation title='Pricing' onRefreshPrices={refreshPrices} />
            <div className={styles.tablesWrapper}>
              <div className={styles.optionsWrapper}>
                <Panel className={`${styles.tableContainer} ${!isAuthenticated && styles.offline}`}>
                  <h1>Options</h1>
                  <OptionsTable data={options} currency={"WETH"} />
                </Panel>
                <Panel className={`${styles.tableContainer} ${!isAuthenticated && styles.offline}`}>
                  <h1>Digital Options</h1>
                  <OptionsTable data={digitalOptions} currency={"USDC"} />
                </Panel>
              </div>
              <Panel className={`${styles.tableContainer} ${!isAuthenticated && styles.offline}`}>
                <h1>Forwards</h1>
                <ForwardsTable />
              </Panel>
            </div>
            {!isAuthenticated && (
              <div className={styles.offlineContainer}>
                <p>Please connect wallet to check prices.</p>
                <ConnectButton.Custom>
                  {({ openConnectModal }) => {
                    return (
                      <Button
                        title='Connect wallet'
                        variant='primary'
                        onClick={openConnectModal}
                        className={styles.connectButton}
                      >
                        Connect Wallet
                      </Button>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            )}
          </div>
        </Container>
      </Main>
    </>
  );
};

export default Pricing;
