// Constants
import { LEADERBOARD_CARDS } from "@/UI/constants/leaderboard";

// Layout
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";
import Flex from "@/UI/layouts/Flex/Flex";
import Panel from "@/UI/layouts/Panel/Panel";

// Components
import Meta from "@/UI/components/Meta/Meta";
import Card from "@/UI/components/Card/Card";
import TableLeaderboard from "@/UI/components/TableLeaderboard/TableLeaderboard";

// Constants
import { TABLE_LEADERBOARD_DATA } from "@/UI/constants/tableLeaderboard";

const Leaderboard = () => {
  return (
    <>
      <Meta />
      <Main>
        <Container className='mb-15 mt-8'>
          {/* <h1>Leaderboard</h1> */}
          <Flex direction='row-space-between' gap='gap-15 wrap-tablet'>
            {LEADERBOARD_CARDS.map((data, index) => (
              <Card key={index} {...data} />
            ))}
          </Flex>
        </Container>
        <Container>
          <Panel margin='p-30 p-tablet-16'>
            <h3 className='mb-tablet-16'>Weekly Ranking</h3>
            <TableLeaderboard data={TABLE_LEADERBOARD_DATA} />
          </Panel>
        </Container>
      </Main>
    </>
  );
};

export default Leaderboard;
