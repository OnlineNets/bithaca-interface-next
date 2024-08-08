// Styles
import styles from "./Dot.module.scss";

// Types
export type DotTypes = `leg${number}`;

type DotProps = {
  type: DotTypes;
};

// Generate the type to color mapping
const generateTypeToColorMapping = () => {
  const mapping: Record<DotTypes, string> = {};
  for (let i = 1; i <= 16; i++) {
    mapping[`leg${i}` as DotTypes] = styles[`leg${i}`];
  }
  return mapping;
};

const TYPE_TO_COLOR: Record<DotTypes, string> = generateTypeToColorMapping();

const Dot = ({ type }: DotProps) => {
  const className = TYPE_TO_COLOR[type] || styles.leg1;

  return <div className={`${styles.dot} ${className}`} />;
};

export default Dot;
