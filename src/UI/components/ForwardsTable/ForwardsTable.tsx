import { useQuery } from "@tanstack/react-query";
import { OptionsData } from "@/UI/constants/prices";
import { useAppStore } from "@/UI/lib/zustand/store";
import Table from "@/UI/components/ForwardsTable/Table";

import styles from "./ForwardsTable.module.scss";

const ForwardsTable = () => {
  const { isAuthenticated, contractsWithReferencePrices, fetchBestBidAskPrecise } = useAppStore();

  const { data } = useQuery({
    enabled: isAuthenticated,
    queryKey: ["bestBidAsk", contractsWithReferencePrices],
    queryFn: () => fetchBestBidAskPrecise(),
    select: data => {
      const tempData: OptionsData[] = [];
      for (const key in contractsWithReferencePrices) {
        if (["Forward", "Spot"].includes(contractsWithReferencePrices[key].payoff)) {
          tempData.push({ ...contractsWithReferencePrices[key], ...data[key] });
        }
      }

      return tempData;
    },
  });

  return (
    <div className={styles.wrapper}>
      {data?.map((singleForwardInformation, index) => (
        <Table index={index} key={index} data={singleForwardInformation} />
      ))}
    </div>
  );
};

export default ForwardsTable;
