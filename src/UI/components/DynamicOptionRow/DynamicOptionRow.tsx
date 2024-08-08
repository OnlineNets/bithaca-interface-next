/* eslint-disable react-hooks/exhaustive-deps */
// Packages
import { useEffect, useState } from "react";
import dayjs from "dayjs";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";
import duration from "dayjs/plugin/duration";

// Utils
import { getNumber, getNumberValue, isInvalidNumber } from "@/UI/utils/Numbers";
import { usePrice } from "@/services/pricing/usePrice";
import mixPanel from "@/services/mixpanel";
import { useDevice } from "@/UI/hooks/useDevice";

// Components
import LogoEth from "@/UI/components/Icons/LogoEth";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import Minus from "@/UI/components/Icons/Minus";
import Plus from "@/UI/components/Icons/Plus";
import Input from "@/UI/components/Input/Input";
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import DropdownMenu from "@/UI/components/DropdownMenu/DropdownMenu";
import Button from "../Button/Button";
import Remove from "../Icons/Remove";

// Layouts
import Panel from "@/UI/layouts/Panel/Panel";
import Flex from "@/UI/layouts/Flex/Flex";

// Constants
import { StrategyLeg } from "@/UI/constants/prepackagedStrategies";

// Styles
import styles from "./DynamicOptionRow.module.scss";
import { useCalcIv } from "@/services/pricing/useCalcIv";
import { PRODUCT_OPTIONS, PRODUCT_TYPES, getProductTypes, type ProductOption } from "./helpers";
import { SIDE } from "@/utils/types";
import { MAXIMUM_POSITION_SIZE } from "@/UI/utils/constants";

dayjs.extend(duration);

type DynamicOptionRowProps = {
  strategy: StrategyLeg;
  updateStrategy: (strategy: StrategyLeg) => void;
  removeStrategy: () => void;
  id: string;
  linked: boolean;
  linkChange: (isLinked: boolean) => void;
  optionChange: () => void;
};

const DynamicOptionRow = ({
  updateStrategy,
  strategy,
  id,
  removeStrategy,
  linkChange,
  linked,
  optionChange,
}: DynamicOptionRowProps) => {
  // Store
  const { getContractsByPayoff, spotPrices, currentExpiryDate, currentSpotPrice, ithacaSDK, spotContract } =
    useAppStore();

  // State
  const [product, setProduct] = useState(strategy.product);
  const [typeList, setTypeList] = useState<ProductOption[]>(PRODUCT_TYPES[strategy.product]);
  const [type, setType] = useState(strategy.type);
  const [side, setSide] = useState<SIDE>(strategy.side);
  const [size, setSize] = useState(strategy.size.toString());
  const [strike, setStrike] = useState<string | undefined>(strategy.product === "Forward" ? "-" : undefined);
  const contracts = getContractsByPayoff(strategy.product === "Forward" ? "Forward" : strategy.type);
  const [strikeList, setStrikeList] = useState(contracts);
  const [unitPrice, setUnitPrice] = useState("");
  const device = useDevice();

  const isForward = product === "Forward";

  const { unitPrice: remoteUnitPriceReference, isLoading: isUnitPriceLoading } = usePrice({
    isForward,
    optionType: type,
    expiryDate: currentExpiryDate,
    strike: strike,
    side: side,
  });

  const { iv: ivFormatted } = useCalcIv({
    unitPrice,
    strike,
    isCall: type === "Call",
    side,
  });

  // Effects
  useEffect(() => {
    setUnitPrice(remoteUnitPriceReference);
  }, [remoteUnitPriceReference]);

  useEffect(() => {
    // Validation part
    if (!strike || isInvalidNumber(getNumber(size)) || isInvalidNumber(getNumber(unitPrice))) return;
    if (isForward && strike !== "-") return;
    if (!isForward && strike === "-") return;

    const internalStrikeList = getContractsByPayoff(isForward ? "Forward" : type);

    updateStrategy({
      ...strategy,
      side: side,
      contractId: type === "NEXT_AUCTION" ? spotContract.contractId : internalStrikeList[strike].contractId,
      size: getNumber(size),
      referencePrice: getNumber(unitPrice),
      payoff: isForward ? "Forward" : type,
      strike: strike,
      product: product,
      type: type,
    });
  }, [product, type, strike, currentExpiryDate, unitPrice, size, side]);

  useEffect(() => {
    handleStrikeListUpdate();
  }, [strikeList, id]);

  useEffect(() => {
    setSide(strategy.side);
  }, [strategy.side]);

  useEffect(() => {
    handleProductChange(strategy.product, strategy.type);
  }, [strategy.product]);

  useEffect(() => {
    handleSizeChange(strategy.size.toString());
  }, [strategy.size]);

  const handleProductChange = (product: string, type?: string) => {
    const productTypes = getProductTypes(currentExpiryDate);
    setProduct(product);
    setTypeList(productTypes[product]);
    setType(type || productTypes[product][0].value);
    setStrikeList({
      ...getContractsByPayoff(product === "Forward" ? "Forward" : type || productTypes[product][0].value),
    });
  };

  const handleTypeChange = (type: string) => {
    setType(type);
    setStrikeList({ ...getContractsByPayoff(product === "Forward" ? "Forward" : type) });
    // POINTS_EVENTS: Option type selected - service connected
    mixPanel.track("Option type selected", {
      type: type,
    });
  };

  const handleStrikeListUpdate = () => {
    if (product === "Forward") {
      setStrike("-");
    } else {
      const spot = spotPrices["WETH/USDC"];
      const list = Object.keys(strikeList);
      const closest = list.sort((a, b) => Math.abs(spot - parseFloat(a)) - Math.abs(spot - parseFloat(b)))[0];
      const index = list.sort().findIndex(a => a === closest);
      const strikePoint = index + strategy.strikeIndex;
      const newStrike = list[strikePoint < 0 ? 0 : strikePoint >= list.length ? list.length - 1 : strikePoint];

      setStrike(newStrike);
    }
  };

  const handleSizeChange = (amount: string) => {
    const size = getNumberValue(amount);
    setSize(size);
  };

  const handleStrikeChange = (strike: string) => {
    setStrike(strike);
  };

  return (
    <>
      <Panel margin='br-20 mb-14 mt-10' className={styles.panel}>
        <div className={styles.parent}>
          <div className={styles.title}>
            {device !== "desktop" && (
              <Flex direction='row-space-between-start'>
                <p className={styles.subtitle}>Product</p>
                <div className={styles.removeButton}>
                  <Button title='Click to remove row' variant='icon' onClick={removeStrategy}>
                    <Remove />
                  </Button>
                </div>
              </Flex>
            )}
            <RadioButton
              options={PRODUCT_OPTIONS}
              selectedOption={product}
              name={`${id}-product`}
              onChange={product => {
                handleProductChange(product);
                optionChange();
              }}
              radioButtonClassName={styles.radioButtonProduct}
            />
          </div>
          <div className={styles.type}>
            {device !== "desktop" ? (
              <>
                <p className={styles.subtitle}>Type</p>
                <RadioButton
                  options={typeList}
                  selectedOption={type}
                  name={`${id}-type`}
                  onChange={type => {
                    handleTypeChange(type);
                    optionChange();
                  }}
                  radioButtonClassName={styles.radioButtonType}
                />
              </>
            ) : (
              <RadioButton
                options={typeList}
                selectedOption={type}
                name={`${id}-type`}
                onChange={type => {
                  handleTypeChange(type);
                  optionChange();
                }}
                width={170}
              />
            )}
          </div>
          <div className={styles.side}>
            {device !== "desktop" && <p className={styles.subtitle}>Side</p>}
            <RadioButton
              options={[
                { option: <Plus />, value: "BUY" },
                { option: <Minus />, value: "SELL" },
              ]}
              selectedOption={side}
              name={`${id}-buy-sell`}
              orientation='vertical'
              onChange={value => setSide(value as SIDE)}
            />
          </div>
          <div className={styles.size}>
            {device !== "desktop" && <p className={styles.subtitle}>Size</p>}
            <Input
              max={MAXIMUM_POSITION_SIZE}
              className={styles.dynamicOptionsInput}
              canLink={true}
              isLinked={linked}
              onLink={link => {
                linkChange(link);
              }}
              increment={direction =>
                size && handleSizeChange((direction === "UP" ? Number(size) + 1 : Number(size) - 1).toString())
              }
              width={120}
              type='number'
              value={size}
              icon={product === "digital-option" ? <LogoUsdc /> : <LogoEth />}
              onChange={({ target }) => handleSizeChange(target.value)}
            />
          </div>
          <div className={styles.strike}>
            {product !== "Forward" && device !== "desktop" && <p className={styles.subtitle}>Strike</p>}
            {product !== "Forward" ? (
              <DropdownMenu
                value={strike ? { name: strike, value: strike } : undefined}
                options={Object.keys(strikeList).map(strike => ({ name: strike, value: strike }))}
                iconEnd={<LogoUsdc />}
                onChange={option => handleStrikeChange(option)}
              />
            ) : (
              <div className={styles.forwardPlaceholder} />
            )}
          </div>
          <div className={`${product === "Forward" ? styles.unitPriceForwards : styles.unitPrice}`}>
            {device !== "desktop" && <p className={styles.subtitle}>Unit Price</p>}
            <Input
              isLoading={isUnitPriceLoading}
              className={styles.dynamicOptionsInput}
              type='number'
              value={unitPrice}
              icon={<LogoUsdc />}
              footerText={product === "option" && !isUnitPriceLoading ? ivFormatted : undefined}
              onChange={({ target }) => {
                setUnitPrice(getNumberValue(target.value));
              }}
            />
          </div>
          {device === "desktop" && (
            <div className={styles.action}>
              <Button title='Click to remove row' variant='icon' onClick={removeStrategy}>
                <Remove />
              </Button>
            </div>
          )}
        </div>
      </Panel>
    </>
  );
};

export default DynamicOptionRow;
