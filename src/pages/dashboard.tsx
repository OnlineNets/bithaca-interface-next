// Packages
import { useState } from "react";

// Components
import Meta from "@/UI/components/Meta/Meta";
import CollateralPanel from "@/UI/components/CollateralPanel/CollateralPanel";
import Tabs from "@/UI/components/Tabs/Tabs";
import TableFundLock from "@/UI/components/TableFundLock/TableFundLock";

// Layout
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";
import Panel from "@/UI/layouts/Panel/Panel";
import Orders from "@/UI/components/TableOrder/Orders/Orders";
import Positions from "@/UI/components/TableOrder/Positions/Positions";
import Settlements from "@/UI/components/TableOrder/Settlements/Settlements";
import { HideData } from "@/UI/components/HideData";
import { useAppStore } from "@/UI/lib/zustand/store";
import HeaderWithInformation from "@/UI/components/HeaderWithInformation";
import TradeHistory from "@/UI/components/TableOrder/Orders/TradeHistory";

const DASHBOARD_TABS = [
  {
    id: "liveOrders",
    label: "Live Orders",
    content: <Orders />,
  },
  {
    id: "positions",
    label: "Positions",
    content: <Positions />,
  },
  {
    id: "tradeHistory",
    label: "Trade History",
    content: <TradeHistory />,
  },
  {
    id: "settlements",
    label: "Settlements",
    content: <Settlements />,
  },
  {
    id: "fundLockHistory",
    label: "Transaction History",
    content: <TableFundLock />,
  },
];

const Dashboard = () => {
  const [dashboardTab, setDashboardTab] = useState(DASHBOARD_TABS[0].id);
  const { isLocationRestricted } = useAppStore();

  return (
    <>
      <Meta />
      <Main>
        <HideData visible={isLocationRestricted} withModal={true} title='Location Restricted'>
          <Container>
            <HeaderWithInformation title='Dashboard' />
            <CollateralPanel setDashboardTab={setDashboardTab} />
            <Panel margin='p-desktop-30 mt-15 p-tablet-16 p-16'>
              <Tabs tabs={DASHBOARD_TABS} activeTab={dashboardTab} onChange={setDashboardTab} />
            </Panel>
          </Container>
        </HideData>
      </Main>
    </>
  );
};

export default Dashboard;
