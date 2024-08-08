import { useDevice } from "@/UI/hooks/useDevice";
import { Currency } from "../Currency";
import FundlockValue from "../FundlockSummary";
import styles from "./headerWithInformation.module.scss";
import RefreshPrices from "../RefreshPrices";

interface HeaderWithInformationProps {
  title: string;
  onExpiryChange?: () => void;
  onRefreshPrices?: () => void;
}

const HeaderWithInformation = ({ title, onExpiryChange, onRefreshPrices }: HeaderWithInformationProps) => {
  const device = useDevice();

  if (device === "phone") {
    return (
      <div>
        <div className='space-between flex-row mb-10'>
          <div>
            <h1 className={styles.title}>{title}</h1>
          </div>
          <div className='tw-flex tw-flex-col tw-items-end tw-justify-end tw-gap-4'>
            <FundlockValue />
            <RefreshPrices onRefreshPrices={onRefreshPrices} />
          </div>
        </div>
        <div className='flex-row space-between mb-17'>
          <Currency />
        </div>
      </div>
    );
  }

  return (
    <div className='tw-mb-4 tw-flex tw-flex-row tw-justify-between tw-gap-4'>
      <div className='tw-flex tw-items-center'>
        <Currency onExpiryChange={onExpiryChange} />
      </div>
      <div className='tw-flex tw-flex-col tw-items-end tw-justify-end tw-gap-3'>
        <FundlockValue />
        <RefreshPrices onRefreshPrices={onRefreshPrices} />
      </div>
    </div>
  );
};

export default HeaderWithInformation;
