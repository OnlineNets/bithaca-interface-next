// Packages
import { useState } from "react";

// Components
import Meta from "@/UI/components/Meta/Meta";
import TabCard from "@/UI/components/TabCard/TabCard";

// Layout
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";
import TradingLayout from "@/UI/layouts/TradingLayout/TradingLayout";

// Constants
import { TRADING_MARKET_TABS } from "@/UI/constants/tabCard";
import { Currency } from "@/UI/components/Currency";

// Styles
import styles from "./market.module.scss";

const Index = () => {
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <>
      <Meta />
      <Main>
        <Container>
          <TradingLayout />
          <Currency
            onExpiryChange={() => {
              console.log();
            }}
          />
          <TabCard
            className={`mt-39 ${styles.tabCard}`}
            tabClassName='ptb-5 plr-20'
            tabs={TRADING_MARKET_TABS}
            showInstructions={showInstructions}
            setShowInstructions={setShowInstructions}
          />
        </Container>
      </Main>
    </>
  );
};

export default Index;
