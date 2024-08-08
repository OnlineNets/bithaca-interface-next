// Packages
import React, { useState } from "react";

// Components
import EnjinstarterLeaderboard from "@/UI/components/EnjinstarterLeaderboard/EnjinstarterLeaderboard";
import Meta from "@/UI/components/Meta/Meta";

// Layouts
import Container from "@/UI/layouts/Container/Container";
import Main from "@/UI/layouts/Main/Main";

// Styles
import styles from "./enjinstarter.module.scss";
import { EnjinstarterSortConfig } from "@/UI/constants/enjinstarter";

function Enjinstarter() {
  return (
    <>
      <Meta />
      <Main>
        <Container size='lg'>
          <div className={styles.wrapper}>
            <EnjinstarterLeaderboard />
          </div>
        </Container>
      </Main>
    </>
  );
}

export default Enjinstarter;
