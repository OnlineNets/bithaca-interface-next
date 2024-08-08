// Components
import Logo from "@/UI/components/Icons/Logo";
import Meta from "@/UI/components/Meta/Meta";
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";

// Styles
import styles from "./Plug.module.scss";
import { PropsWithChildren } from "react";

const Plug = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Meta />
      <Main>
        <Container>
          {children}
          <div className={styles.container}>
            <Logo />
            <div className={styles.textContainer}>
              <span className={styles.title}>Under Scheduled Maintenance</span>
              <span className={styles.description}>We will be back shortly</span>
            </div>
          </div>
        </Container>
      </Main>
    </>
  );
};

export default Plug;
