// Packages
import { useEffect, useState } from "react";

// constants
import { KeyOption, KeyType } from "@/UI/constants/charts/charts";

// Components
import Dot, { DotTypes } from "@/UI/components/Dot/Dot";

// Styles
import styles from "./ChartPayoff.module.scss";

type KeysProps = {
  keys: KeyOption[];
  onChange?: (key: KeyType) => void;
  onDashed: (key: KeyType) => void;
};

const Key = (props: KeysProps) => {
  const { keys, onChange, onDashed } = props;
  const [keyMap, setKeyMap] = useState<KeyType[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selected, setSelected] = useState<KeyType>({
    label: {
      option: "Total",
      value: "total",
    },
    type: "leg16",
  });

  useEffect(() => {
    const keyArray: KeyType[] = [];
    const dotArray: DotTypes[] = [
      "leg1",
      "leg2",
      "leg3",
      "leg4",
      "leg5",
      "leg6",
      "leg7",
      "leg8",
      "leg9",
      "leg10",
      "leg11",
      "leg12",
      "leg13",
      "leg14",
      "leg15",
      "leg16",
    ];

    keys.map((item, index) => {
      if (item.value == "total") {
        const keyObj: KeyType = {
          label: {
            option: "Total",
            value: "total",
          },
          type: "leg16",
        };
        keyArray.push(keyObj);
      } else if (item.value !== "quantity") {
        const type: DotTypes = dotArray[index - 1] || "leg1";
        const keyObj: KeyType = { label: item, type: type };
        keyArray.push(keyObj);
      }
    });

    setKeyMap(keyArray);
  }, [keys]);

  // Add class to total item
  const getBadgeClass = (label: KeyOption): string => {
    return label.value === selected.label.value ? styles.badge : "";
  };

  // Change Label
  const updateChange = (key: KeyType) => {
    // setSelected(key);
    if (onChange) onChange(key);
  };

  const showDashedLine = (key: KeyType) => {
    onDashed(key);
  };
  return (
    <div className={styles.container}>
      {keyMap.map((key, index) => (
        <div
          key={index}
          className={`${styles.key} ${getBadgeClass(key.label)}`}
          onClick={() => {
            setSelected(key);
            updateChange(key);
          }}
          onMouseEnter={() => showDashedLine(key)}
          onMouseLeave={() =>
            showDashedLine({
              label: {
                option: "",
                value: "",
              },
              type: "leg16",
            })
          }
        >
          <Dot type={key.type} />
          <p>{key.label.option}</p>
        </div>
      ))}
    </div>
  );
};

export default Key;
