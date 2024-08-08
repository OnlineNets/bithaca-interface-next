import { ReactNode } from "react";
import classNames from "classnames";
import styles from "./AppWrapper.module.scss";
import Container from "@/UI/layouts/Container/Container";

function AppWrapper({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={classNames(className, styles.appWrapper)}>
      <div className={classNames("position-fixed inset-0", styles.background)} />
      <Container className='position-absolute inset-0 pointer-none'>
        <div className={styles.leftShapeContainer}>
          <div className={styles.leftShape} />
        </div>
        <div className={styles.rightShapeContainer}>
          <div className={styles.rightShape} />
        </div>
      </Container>
      {children}
    </div>
  );
}

export default AppWrapper;
