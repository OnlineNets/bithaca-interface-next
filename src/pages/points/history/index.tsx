import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { parseEther } from "viem";

// Components
import Meta from "@/UI/components/Meta/Meta";
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";
import Panel from "@/UI/layouts/Panel/Panel";
import TableRewardsLeaderboard from "@/UI/components/TableRewardsLeaderBoard/TableRewardsLeaderboard";
import Toast from "@/UI/components/Toast/Toast";
import PointsLayout from "@/UI/layouts/PointsLayout/PointsLayout";
import Plug from "@/UI/components/Plug/Plug";
import ProfileCard from "@/UI/components/ProfileCard/ProfileCard";
import PointsCard from "@/UI/components/PointsCard/PointsCard";
import Loader from "@/UI/components/Loader/Loader";

// Utils
import { useAppStore } from "@/UI/lib/zustand/store";
import { useAccount, useAccountEffect, useWalletClient } from "wagmi";
import { handlePointsError } from "@/UI/utils/Points";
import useToast from "@/UI/hooks/useToast";

// Services
import { GetRewardHistory, GetUserData, GetUserWalletProof, UpdateInfoAfterRedeem } from "@/UI/services/PointsAPI";
import { fetchConfig } from "@/services/environment.service";

// Constants
import { AggregatedUserPoints } from "@/UI/constants/pointsProgram";
import { RewardsSortConfig } from "@/UI/constants/rewardsLeaderboard";

// Styles
import styles from "./rewards.module.scss";
import { ithacaDistributorAbi, ithacaDistributorAddress } from "@/assets/abi/ithacaDistributorAbi";

const History = () => {
  const router = useRouter();
  const { toastList, showToast } = useToast();
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { isAuthenticated, resetState, displayName, avatarUrl, isAvatar, setUserPointsData } = useAppStore();
  const [totalDataCount, setTotalDataCount] = useState<number>(0);
  const [data, setData] = useState<AggregatedUserPoints[]>([]);
  const [page, setPage] = useState<number>(1);
  const [currentClaimablePoints, setCurrentClaimablePoints] = useState<number>(0);
  const [mainnetTradingPoints, setMainnetTradingPoints] = useState<number>(0);
  const [isPointActived, setIsPointActived] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [inactiveReferralPoints, setInactiveReferralPoints] = useState(0);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isRedemption, setIsRedemption] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<RewardsSortConfig>({
    key: "date",
    direction: "desc",
  });
  const [isPointsDisabled, setIsPointsDisabled] = useState(true);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const pageLimit = 10;

  useAccountEffect({
    onDisconnect: () => {
      resetState();
      setCurrentClaimablePoints(0);
      setMainnetTradingPoints(0);
      setCurrentPoints(0);
      router.push("/points/season-one");
    },
  });

  useEffect(() => {
    fetchConfig()
      .then(({ DISABLE_POINTS_REDEMPTION, DISABLE_POINTS }) => {
        setIsRedemption(!DISABLE_POINTS_REDEMPTION);
        setIsPointsDisabled(!!DISABLE_POINTS);
        setIsConfigLoading(false);
      })
      .catch(() => {
        setIsPointsDisabled(true);
        setIsConfigLoading(false);
      });
  }, []);

  const formatEvent = (event: string, tradingMode: string | null, date: string) => {
    switch (event) {
      case "WalletConnect":
        return "Connect Wallet";
      case "CampaignPoints":
        return "Campaign Points";
      case "Twitter":
        return "Connect X (Twitter)";
      case "Discord":
        return "Connect Discord";
      case "Farcaster":
        return "Connect Farcaster";
      case "Telegram":
        return "Connect Telegram";
      case "Farcast":
        return "Connect Farcast";
      case "ReferralWalletConnect":
        return "Referral - Connect Wallet";
      case "ReferralTelegram":
        return "Referral - Connect Telegram";
      case "ReferralTwitter":
        return "Referral - Connect X (Twitter)";
      case "ReferralDiscord":
        return "Referral - Connect Discord";
      case "Redemption":
        return "Reward redemption";
      default:
        if (!tradingMode) return `Trading Event - ${format(parseISO(date), "ddMMMyy")}`;
        return `${tradingMode.charAt(0) + tradingMode.slice(1).toLowerCase()} Trading Events - ${format(
          parseISO(date),
          "ddMMMyy"
        )}`;
    }
  };

  const redeemRewardHandler = () => {
    setIsPending(true);
    if (address && walletClient) {
      GetUserWalletProof({
        walletAddress: address,
        points: parseEther(`${currentPoints}`).toString(),
      }).then(({ data, error }) => {
        if (error) {
          setIsPending(false);
          handlePointsError({
            showToast,
            title: error.name,
            message: error.message,
          });
        } else if (data) {
          walletClient
            .writeContract({
              address: ithacaDistributorAddress,
              abi: ithacaDistributorAbi,
              functionName: "claim",
              args: [parseEther(`${currentPoints}`), data.proof],
            })
            .then(hash => {
              UpdateInfoAfterRedeem({
                walletAddress: address,
                points: currentClaimablePoints,
                hash,
                tokenAmount: currentClaimablePoints,
              });
              handlePointsError({
                showToast,
                title: "Transaction Data",
                message: "Transaction completed successfully",
              });
              setCurrentClaimablePoints(0);
              setIsPending(false);
            })
            .catch(error => {
              setIsPending(false);
              handlePointsError({
                showToast,
                title: error.name,
                message: "User rejected the request",
              });
            });
        }
      });
    } else {
      setIsPending(false);
      handlePointsError({
        showToast,
        title: "Connection error",
        message: "Invalid session or wallet client",
      });
    }
  };

  useEffect(() => {
    if (isPointsDisabled) return;
    if (!isConnected || !isAuthenticated) {
      router.push("/points/season-one");
      return;
    }

    GetUserData("", true).then(({ data }) => {
      if (data && !Object.keys(data.user).length) return;

      GetRewardHistory({
        page,
        pageLimit: pageLimit,
        sortField: sortConfig.key,
        sortType: sortConfig.direction,
        filterBy: "All",
      }).then(({ data, error }) => {
        if (error) {
          handlePointsError({
            showToast,
            title: error.name,
            message: error.message,
          });
        } else if (data) {
          const {
            claimablePoints,
            mainnetTradingPoints,
            isPointActived,
            points,
            inactiveReferralPoints,
            rewards,
            user,
          } = data;
          setCurrentClaimablePoints(claimablePoints);
          setMainnetTradingPoints(mainnetTradingPoints);
          setIsPointActived(isPointActived);
          setCurrentPoints(points);
          setInactiveReferralPoints(inactiveReferralPoints);
          setUserPointsData({
            displayName: user.displayName,
            avatarUrl: user.avatarUrl ?? "",
            isAvatar: user.isAvatar,
          });

          setTotalDataCount(rewards.total);
          setData(() => {
            return rewards.events.map(event => {
              return {
                ...event,
                description: formatEvent(event.description, event.tradingMode, event.date),
                date: format(parseISO(event.date), "dd MMM yy"),
              };
            });
          });
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isAuthenticated, sortConfig.key, sortConfig.direction, page, isPointsDisabled]);

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
          <div className={styles.wrapper}>
            <div className={styles.cardsContainer}>
              <ProfileCard displayName={displayName} isAvatar={isAvatar} avatarUrl={avatarUrl} />
              <PointsCard
                mainnetTradingPoints={mainnetTradingPoints}
                isPointActived={isPointActived}
                claimablePoints={currentClaimablePoints}
                inactiveReferralPoints={inactiveReferralPoints}
                totalPoints={currentPoints}
                isRedemption={isRedemption}
                redeemPointsHandler={redeemRewardHandler}
                isPending={mainnetTradingPoints < 10 || isPending || !currentClaimablePoints}
              />
            </div>
            <Panel className={styles.tableWrapper}>
              <h1>Points History</h1>
              {data.length ? (
                <TableRewardsLeaderboard
                  data={data}
                  totalDataCount={totalDataCount}
                  page={page}
                  setPage={(page: number) => setPage(page)}
                  sortConfig={sortConfig}
                  setSortConfig={(newSortConfig: RewardsSortConfig) => setSortConfig(newSortConfig)}
                  pageLimit={pageLimit}
                />
              ) : (
                <div className={styles.loaderWrapper}>
                  <Loader type={"sm"} />
                </div>
              )}
            </Panel>
          </div>
        </Container>
      </Main>
      <Toast toastList={toastList} position='bottom-right' autoDelete={true} />
    </>
  );
};

export default History;
