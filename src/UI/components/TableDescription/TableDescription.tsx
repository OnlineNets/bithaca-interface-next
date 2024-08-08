// Packages
import { ComponentType, Fragment } from "react";

// Components
import LogoEth from "@/UI/components/Icons/LogoEth";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";

// Styles
import styles from "./TableDescription.module.scss";
import { TableDescriptionProps } from "../TableOrder/types";

import { getNumberFormat } from "@/UI/utils/Numbers";

// Types
type ValueWithIcon = {
  value: number;
  Icon?: ComponentType;
};

const TableDescription = ({
  possibleReleaseX,
  possibleReleaseY,
  postOptimisationX,
  postOptimisationY, // totalCollateral,
}: TableDescriptionProps) => {
  const rows = [
    {
      label: "Total Collateral Required: ",
      values: [
        { value: possibleReleaseX, Icon: LogoEth },
        { value: possibleReleaseY, Icon: LogoUsdc },
      ] as ValueWithIcon[],
    },
    {
      label: "Expected Collateral Value Post Execution Collateral Optimization: ",
      values: [
        { value: postOptimisationX, Icon: LogoEth },
        { value: postOptimisationY, Icon: LogoUsdc },
      ] as ValueWithIcon[],
    },
  ];

  return (
    <div className={styles.container}>
      {rows.map((row, index) => (
        <div key={index} className={styles.row}>
          {row.label}
          {row.values.map((val, idx) => (
            <Fragment key={idx}>
              <span>
                {getNumberFormat(val.value)} {val.Icon && <val.Icon />}
              </span>
              {idx < row.values.length - 1 && ", "}
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableDescription;
