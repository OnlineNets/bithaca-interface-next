// Packages
import { usePathname } from "next/navigation";

// Constants
import { TRADING_TABS_ITEMS } from "@/UI/constants/tabs";

// Services
import mixPanel from "@/services/mixpanel";

// Components
import Tabs from "@/UI/components/Tabs/Tabs";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";
import FundlockValue from "@/UI/components/FundlockSummary";

const TradingLayout = () => {
  const pathname = usePathname();

  const handleChange = (newPath: string) => {
    // POINTS_EVENTS: Trading menu interactions - service connected
    const pathParts = pathname.split("/");
    pathParts[2] = newPath;
    mixPanel.track("Trading menu interactions", { path: pathParts.join("/") });
  };

  return (
    <Flex direction='row-space-between'>
      <Tabs
        tabs={TRADING_TABS_ITEMS}
        className='mb-0'
        activeTab={TRADING_TABS_ITEMS.find(tab => tab.path === pathname)?.id ?? TRADING_TABS_ITEMS[0].id}
        onChange={handleChange}
      />
      <FundlockValue />
    </Flex>
  );
};

export default TradingLayout;
