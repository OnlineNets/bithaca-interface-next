// Components
import LoaderIcon from "@/UI/components/Icons/LoaderIcon";

// Styles
import styles from "./Loader.module.scss";

// Types
type LoaderProps = {
  type?: "sm" | "md" | "lg" | "example";
};

const Loader = ({ type }: LoaderProps) => {
  const loaderClass = type ? `${styles.loader} ${styles[type]}` : styles.loader;

  const renderWatermark = (type === "lg" || type === "example") && (
    <div className={styles.loaderIcon}>
      <LoaderIcon />
    </div>
  );

  return (
    <div className={loaderClass}>
      <div className={styles.spinner} />
      {renderWatermark}
    </div>
  );
};

export default Loader;
