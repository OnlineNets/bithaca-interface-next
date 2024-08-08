import { usePathname } from "next/navigation";

// Layout
import Flex from "@/UI/layouts/Flex/Flex";

// Services
import mixPanel from "@/services/mixpanel";

// Components
import Tabs from "@/UI/components/Tabs/Tabs";

// Constants
import { POINTS_TABS_ITEMS } from "@/UI/constants/tabs";

const PointsLayout = () => {
  const pathname = usePathname();

  const handleChange = (newPath: string) => {
    // POINTS_EVENTS: Points menu interactions - service connected
    const pathParts = pathname.split("/");
    pathParts[2] = newPath;
    mixPanel.track("Points menu interactions", { path: pathParts.join("/") });
  };

  return (
    <Flex direction='row-space-between'>
      <Tabs
        tabs={POINTS_TABS_ITEMS}
        className='mb-0'
        activeTab={POINTS_TABS_ITEMS.find(tab => tab.path === pathname)?.id ?? POINTS_TABS_ITEMS[0].id}
        onChange={handleChange}
      />
    </Flex>
  );
};

export default PointsLayout;
