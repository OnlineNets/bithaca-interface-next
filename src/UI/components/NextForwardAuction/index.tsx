import { useNextForwardAuction } from "@/services/pricing/useForwardPrices";

const NextForwardAuction = () => {
  const { data } = useNextForwardAuction();

  return data?.data.toFixed(1) ?? "-";
};

export default NextForwardAuction;
