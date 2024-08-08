// Packages
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";

// Types
import { GetUserStatsResponse } from "@/types/Stats";

// Components
import Meta from "@/UI/components/Meta/Meta";
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";
import PointsLayout from "@/UI/layouts/PointsLayout/PointsLayout";
import Plug from "@/UI/components/Plug/Plug";
import Loader from "@/UI/components/Loader/Loader";
import StatsCard from "@/UI/components/StatsCard/StatsCard";
import Button from "@/UI/components/Button/Button";
import SeasonLeaderboard from "@/UI/components/SeasonLeaderboard/SeasonLeaderboard";

// Assests
import IthacaSeason1BlogImage from "@/assets/ithaca-season-1-blog.png";

// Services
import { fetchConfig } from "@/services/environment.service";
import { getUserStats } from "@/UI/services/PointsAPI";

// Styles
import styles from "./season-one.module.scss";
import { formatNumber } from "@/UI/utils/Points";

const pageLimit = 10;

const Season1 = () => {
  const { address } = useAccount();

  const [userStats, setUserStats] = useState<GetUserStatsResponse>();
  const [isPointsDisabled, setIsPointsDisabled] = useState(true);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchConfig()
      .then(({ DISABLE_POINTS }) => {
        setIsPointsDisabled(!!DISABLE_POINTS);
        setIsConfigLoading(false);
      })
      .catch(() => {
        setIsPointsDisabled(true);
        setIsConfigLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!address || (!isConfigLoading && isPointsDisabled)) return;
    getUserStats(address.toLowerCase()).then(({ data }) => setUserStats(data));
  }, [address, isConfigLoading, isPointsDisabled]);

  if (isConfigLoading) {
    return (
      <Main>
        <Loader type='lg' />
      </Main>
    );
  }

  if (isPointsDisabled) {
    return (
      <Plug>
        <PointsLayout />
      </Plug>
    );
  }

  return (
    <>
      <Meta />
      <Main>
        <Container>
          <PointsLayout />
          <div className={styles.pageWrapper}>
            <div className={styles.heading}>
              <h1>Ithaca Airdrop Season One</h1>
              <hr />
              <p>
                Earn points by executing trades, entering orders, earning badges, inviting friends and connecting social
                accounts. Activate all your points by trading a minimum notional of $20 (digitals), 0.2ETH (options) or
                1 ETH (forwards).
              </p>
            </div>
            <div className={styles.statsWrapper}>
              <StatsCard
                title='Your Ranking Today'
                stat={userStats?.stats24hr?.ranking}
                badgeImageUrl={userStats?.stats24hr?.badgeImageUrl}
                badgeName={userStats?.stats24hr?.badgeName}
              />
              <StatsCard
                title='Your Trading Points'
                stat={userStats && formatNumber(userStats.mainnetTradingPoints, 2)}
              />
              <StatsCard
                title='Your Pending Points'
                stat={
                  userStats &&
                  (userStats.isPointActived
                    ? formatNumber(userStats.inactiveReferralPoints, 2)
                    : formatNumber(userStats.points, 2))
                }
                tooltip='Pending points are points earned but not activated. They may include pending points from referrals. Accounts will activate all their points after trading a minimum notional of $20 (digitals), 0.2ETH (options) or 1 ETH (forwards).'
              />
              <StatsCard
                title='Your Activated Points'
                stat={
                  userStats && userStats.isPointActived
                    ? formatNumber(userStats.points - Math.max(userStats.inactiveReferralPoints, 0), 2)
                    : 0
                }
                tooltip='Points eligible for airdrop.'
              />
            </div>
            <a
              href='https://blog.ithacaprotocol.io/blog/ithaca-airdrop-season-one'
              target='_blank'
              className={styles.buttonWrapper}
            >
              <Button title='Learn More about Rewards' variant='primary' size='sm' className={styles.button}>
                Learn More about Rewards
              </Button>
            </a>
            <div className={styles.headingWrapper}>
              <h1>Rolling 24 hours Leaderboard</h1>
              <hr />
              <p>
                Reach the top 100 on the leaderboard on a rolling 24 hours to get a random bronze, silver or gold
                booster badge!
              </p>
            </div>
            <SeasonLeaderboard
              userStats={userStats}
              page={page}
              setPage={(page: number) => setPage(page)}
              sortConfig={sortConfig}
              setSortConfig={newSortConfig => setSortConfig(newSortConfig)}
              pageLimit={pageLimit}
            />

            <div className={styles.headingWrapper}>
              <a href='https://blog.ithacaprotocol.io/' target='_blank'>
                <h1>Ithaca Blog</h1>
              </a>
              <hr />
              <a
                href='https://blog.ithacaprotocol.io/blog/ithaca-airdrop-season-one'
                target='_blank'
                className={styles.ithacaBlogImageWrapper}
              >
                <p>Read more about the launch of Ithaca Season One here.</p>
              </a>
            </div>

            <a
              href='https://blog.ithacaprotocol.io/blog/ithaca-airdrop-season-one'
              target='_blank'
              className={styles.ithacaBlogImageWrapper}
            >
              <Image
                src={IthacaSeason1BlogImage}
                alt='Ithaca Season One Blog Post'
                layout='responsive'
                objectFit='fill'
              />
              <a
                href='https://blog.ithacaprotocol.io/blog/ithaca-airdrop-season-one'
                target='_blank'
                className={styles.leftBotttomText}
              >
                Ithaca Season One Airdrop
              </a>
            </a>
          </div>
        </Container>
      </Main>
    </>
  );
};

export default Season1;
