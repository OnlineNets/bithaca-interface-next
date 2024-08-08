// Packages
import { ReactNode } from "react";
import cl from "classnames";
// Styles
import styles from "./Container.module.scss";

// Types
type ContainerProps = {
  size?: "sm" | "md" | "lg" | "xl" | "loader";
  className?: string;
  children: ReactNode;
};

const Container = ({ size = "xl", children, className }: ContainerProps) => {
  return <div className={cl(styles.container, styles[size], className)}>{children}</div>;
};

export default Container;
