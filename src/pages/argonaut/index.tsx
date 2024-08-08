// Packages
import React, { useState } from "react";

// Components
import ArgonautLeaderboard from "@/UI/components/ArgonautLeaderboard/ArgonautLeaderboard";
import Meta from "@/UI/components/Meta/Meta";

// Layouts
import Container from "@/UI/layouts/Container/Container";
import Main from "@/UI/layouts/Main/Main";

// Constants
import { ArgonautSortConfig } from "@/UI/constants/argonaut";

// Styles
import styles from "./argonaut.module.scss";

function Argonaut() {
  const [page, setPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<ArgonautSortConfig>({
    key: "ranking",
    direction: "asc",
  });

  const pageLimit = 10;

  return (
    <>
      <Meta />
      <Main>
        <Container size='lg'>
          <div className={styles.wrapper}>
            <h1>Argonauts Leaderboard</h1>
            <ArgonautLeaderboard
              page={page}
              setPage={(page: number) => setPage(page)}
              sortConfig={sortConfig}
              setSortConfig={(newSortConfig: ArgonautSortConfig) => setSortConfig(newSortConfig)}
              pageLimit={pageLimit}
            />
          </div>
        </Container>
      </Main>
    </>
  );
}

export default Argonaut;
