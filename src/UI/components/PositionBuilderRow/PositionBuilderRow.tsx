// Packages
import { ReactNode, useEffect, useMemo, useState } from "react";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";

// Utils
import { formatNumberByCurrency, getNumber, getNumberValue, isInvalidNumber } from "@/UI/utils/Numbers";

// Components
import Button from "@/UI/components/Button/Button";
import LogoEth from "@/UI/components/Icons/LogoEth";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import Minus from "@/UI/components/Icons/Minus";
import Plus from "@/UI/components/Icons/Plus";
import Input from "@/UI/components/Input/Input";
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import PriceLabel from "@/UI/components/PriceLabel/PriceLabel";
import DropdownMenu from "@/UI/components/DropdownMenu/DropdownMenu";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";
import Panel from "@/UI/layouts/Panel/Panel";

// Styles
import styles from "./PositionBuilderRow.module.scss";

// SDK
import { Leg, calculateNetPrice, calcCollateralRequirement } from "@ithaca-finance/sdk";
import { PositionBuilderStrategy } from "@/pages/trading/position-builder";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useDevice } from "@/UI/hooks/useDevice";
import { usePrice } from "@/services/pricing/usePrice";
import { useCalcIv } from "@/services/pricing/useCalcIv";
import { MAXIMUM_POSITION_SIZE } from "@/UI/utils/constants";

dayjs.extend(duration);

type PositionBuilderRowProps = {
  title: string;
  options: { option: string | ReactNode; value: string }[];
  addStrategy: (strategy: PositionBuilderStrategy) => void;
  sizeIcon: ReactNode;
};

type SectionType = {
  name: string;
  style: string;
};

const PositionBuilderRow = ({ title, options, addStrategy, sizeIcon }: PositionBuilderRowProps) => {
  // Store
  const {
    currencyPrecision,
    currentExpiryDate,
    getContractsByPayoff,
    getContractsByExpiry,
    currentSpotPrice,
    ithacaSDK,
    spotContract,
  } = useAppStore();

  const isForward = title === "Forwards";

  // State
  const [payoff, setPayoff] = useState(options[0].value);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [size, setSize] = useState("1");
  const [strike, setStrike] = useState<string | undefined>(isForward ? "-" : undefined);
  const contracts = getContractsByPayoff(isForward ? "Forward" : payoff);
  const [unitPrice, setUnitPrice] = useState("");

  // Sections
  const sections: SectionType[] = [
    { name: "Side", style: styles.side },
    { name: "Size", style: styles.size },
    { name: "Strike", style: styles.strike },
    { name: "Unit Price", style: styles.unitPrice },
    { name: "Collateral", style: styles.collateral },
    { name: "Premium", style: styles.premium },
  ];

  const device = useDevice();

  const { unitPrice: remoteUnitPriceReference, isLoading: isUnitPriceLoading } = usePrice({
    isForward,
    optionType: payoff,
    expiryDate: currentExpiryDate,
    strike: strike,
    side: side,
  });

  const { iv: ivFormatted } = useCalcIv({
    unitPrice,
    strike,
    isCall: payoff === "Call",
    side,
  });

  // Comprehensive dependencies will force setUnitPrice to take place
  // even though unitPrice from backend it's not changed
  useEffect(() => {
    setUnitPrice(remoteUnitPriceReference);
  }, [remoteUnitPriceReference, strike, payoff, currentExpiryDate]);

  const handlePayoffChange = (payoff: string) => {
    setPayoff(payoff);
    setStrike(isForward ? "-" : undefined);
    setUnitPrice("");
  };

  const handleSideChange = (side: "BUY" | "SELL") => {
    setSide(side);
  };

  const handleSizeChange = (amount: string) => {
    const size = getNumberValue(amount);
    setSize(size);
  };

  const handleStrikeChange = (strike: string) => {
    setStrike(strike);
  };

  const calcCollateral = () => {
    if (!strike || isInvalidNumber(getNumber(size))) return "-";
    const leg = {
      contractId: contracts[strike]?.contractId,
      quantity: size,
      side,
    };
    if (isForward) {
      const forwardContracts =
        payoff === "Forward" ? getContractsByExpiry(`${currentExpiryDate}`, "Forward")[strike] : spotContract;
      leg.contractId = forwardContracts.contractId;
    }
    return formatNumberByCurrency(
      calcCollateralRequirement(leg, isForward ? "Forward" : payoff, getNumber(strike), currencyPrecision.strike),
      "string",
      "WETH"
    );
  };

  const calcPremium = () => {
    if (!strike || isInvalidNumber(getNumber(size)) || isInvalidNumber(getNumber(unitPrice))) return "-";
    const leg = {
      contractId: contracts[strike]?.contractId,
      quantity: size,
      side,
    };
    if (isForward) {
      const forwardContracts =
        payoff === "Forward" ? getContractsByExpiry(`${currentExpiryDate}`, "Forward")[strike] : spotContract;
      leg.contractId = forwardContracts.contractId;
    }

    const finalPrice = Number(calculateNetPrice([leg], [getNumber(unitPrice)], currencyPrecision.strike));
    return formatNumberByCurrency(finalPrice, "string", "USDC");
  };

  const renderValues = () => (
    <>
      <div className={styles.collateral}>
        {device !== "desktop" && <p className={styles.subtitle__side}>Collateral</p>}
        <PriceLabel label={calcCollateral()} icon={<LogoEth />} />
      </div>
      <div className={styles.premium}>
        {device !== "desktop" && <p className={styles.subtitle__side}>Premium</p>}
        <PriceLabel label={calcPremium()} icon={<LogoUsdc />} />
      </div>
    </>
  );

  const isAddStrategyButtonActive = useMemo(() => {
    if (isForward) {
      return unitPrice && size;
    }
    return unitPrice && size && strike;
  }, [isForward, unitPrice, size, strike]);

  const handleAddStrategySubmit = () => {
    if (!strike || isInvalidNumber(getNumber(size)) || isInvalidNumber(getNumber(unitPrice))) {
      alert("Please fill in all fields");
      return;
    }

    const leg = {
      contractId: contracts[strike].contractId,
      quantity: size,
      side,
    } as Leg;
    if (isForward) {
      const forwardContracts =
        payoff === "Forward" ? getContractsByExpiry(`${currentExpiryDate}`, "Forward")[strike] : spotContract;
      leg.contractId = forwardContracts.contractId;
    }
    addStrategy({
      leg,
      referencePrice: getNumber(unitPrice),
      payoff,
      strike,
    });
  };

  return (
    <>
      {device === "desktop" && (
        <div className={styles.parent}>
          <>
            <div className={styles.title}>
              <h4>{title}</h4>
            </div>
            {title === "Options" && (
              <>
                {sections.map((section, index) => (
                  <div key={index} className={section.style}>
                    <p>{section.name}</p>
                  </div>
                ))}
                <div className={styles.action}></div>
              </>
            )}
          </>
        </div>
      )}
      <Panel margin='ptb-8 plr-6 br-20 mb-14 mt-10'>
        <div className={styles.parent}>
          <div className={styles.title}>
            {device !== "desktop" && <p className={styles.subtitle}>Type</p>}
            <RadioButton
              options={options}
              selectedOption={payoff}
              name={`${title}-payoff`}
              onChange={handlePayoffChange}
              width={`100%`}
            />
          </div>
          <div className={styles.side}>
            {device !== "desktop" && <p className={styles.subtitle}>Side</p>}
            <RadioButton
              options={[
                { option: <Plus />, value: "BUY" },
                { option: <Minus />, value: "SELL" },
              ]}
              selectedOption={side}
              name={`${title}-buy-sell`}
              orientation='vertical'
              onChange={value => handleSideChange(value as "BUY" | "SELL")}
            />
          </div>
          <div className={styles.size}>
            {device !== "desktop" && <p className={styles.subtitle}>Size</p>}
            <Input
              max={MAXIMUM_POSITION_SIZE}
              type='number'
              value={size}
              icon={sizeIcon}
              width={105}
              increment={direction =>
                size && handleSizeChange((direction === "UP" ? Number(size) + 1 : Number(size) - 1).toString())
              }
              onChange={({ target }) => handleSizeChange(target.value)}
            />
          </div>
          <div className={styles.strike}>
            {title !== "Forwards" ? (
              <>
                {device !== "desktop" && <p className={styles.subtitle}>Strike</p>}
                <DropdownMenu
                  value={strike ? { name: strike, value: strike } : undefined}
                  options={Object.keys(contracts).map(strike => ({ name: strike, value: strike }))}
                  iconEnd={<LogoUsdc />}
                  onChange={option => handleStrikeChange(option)}
                />
              </>
            ) : (
              <div className={styles.forwardPlaceholder} />
            )}
          </div>
          <div className={styles.unitPrice}>
            {device !== "desktop" && <p className={styles.subtitle}>Unit Price</p>}
            <Input
              isLoading={isUnitPriceLoading}
              type='number'
              footerText={title === "Options" && !isUnitPriceLoading ? ivFormatted : undefined}
              value={unitPrice}
              icon={<LogoUsdc />}
              onChange={({ target }) => setUnitPrice(getNumberValue(target.value))}
            />
          </div>
          {device === "tablet" ? <div className={styles.value}>{renderValues()}</div> : renderValues()}
          <div className={styles.action}>
            <Flex gap='gap-5' direction='justify-end'>
              <Button
                size='sm'
                title='Click to add to Strategy'
                variant='secondary'
                disabled={!isAddStrategyButtonActive}
                onClick={handleAddStrategySubmit}
              >
                <Plus />
                Strategy
              </Button>
            </Flex>
          </div>
        </div>
      </Panel>
    </>
  );
};

export default PositionBuilderRow;
