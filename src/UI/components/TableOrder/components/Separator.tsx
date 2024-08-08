import styles from "../TableOrder.module.scss";

export const Separator = (props: { className?: string }) => {
  const { className } = props;
  return <div className={`${styles.separator} ${className}`} style={{ marginTop: 4, marginBottom: 7 }} />;
};
