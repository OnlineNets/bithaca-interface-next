import { useState } from "react";
import { useAppStore } from "@/UI/lib/zustand/store";

import RadioButton from "@/UI/components/RadioButton/RadioButton";
import SingleOptionRow from "./SingleOptionRow";
import { PositionBuilderStrategy } from ".";

import { useDevice } from "@/UI/hooks/useDevice";
import { getProductOptions } from "./helpers";
import styles from "./position-builder.module.scss";

interface IMainInfo {
  handleAddStrategy: (strategy: PositionBuilderStrategy) => void;
}

const MainInfo = ({ handleAddStrategy }: IMainInfo) => {
  const [product, setProduct] = useState<string>("options");
  const device = useDevice();

  const handleProductChange = (product: string) => {
    setProduct(product);
  };
  const { currentExpiryDate } = useAppStore();

  return (
    <div className='mt-20'>
      <h3>Position Builder</h3>
      {device !== "desktop" ? (
        <div className={`mb-16 ${styles.options}`}>
          <RadioButton
            options={getProductOptions(currentExpiryDate)}
            selectedOption={product}
            name={`${product}-product`}
            onChange={handleProductChange}
          />
        </div>
      ) : null}
      {getProductOptions(currentExpiryDate).map(option => (
        <SingleOptionRow
          key={option.value}
          isSelected={product === option.value || device === "desktop"}
          handleAddStrategy={handleAddStrategy}
          options={option.options}
          option={option.option}
          sizeIcon={option.sizeIcon}
        />
      ))}
    </div>
  );
};
export default MainInfo;
