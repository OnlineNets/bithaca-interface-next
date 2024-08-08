import { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useAccount, useAccountEffect } from "wagmi";
import axios from "axios";

import { useRouter } from "next/navigation";

// Components
import Panel from "@/UI/layouts/Panel/Panel";
import Avatar from "@/UI/components/Icons/Avatar";
import Button from "@/UI/components/Button/Button";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ProfileImage from "@/UI/components/ProfileImage/ProfileImage";

// Constants
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from "@/UI/constants/breakpoints";
import { getBadgeImage, getTierImage, INITIAL_TIER_DATA, PointsProfileProps, TierData } from "@/UI/constants/badges";

// Utils
import { formatNumber, getTruncateEthAddress, handlePointsError } from "@/UI/utils/Points";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { useAppStore } from "@/UI/lib/zustand/store";

// Services
import { GetBadgesProfile } from "@/UI/services/PointsAPI";

// Styles
import styles from "./PointsProfile.module.scss";

const PointsProfile = ({ showToast }: PointsProfileProps) => {
  const router = useRouter();
  const {
    isAuthenticated,
    displayName,
    avatarUrl,
    isAvatar,
    resetState,
    setUserPointsData,
    userBadges,
    setUserBadges,
  } = useAppStore();
  const { isConnected } = useAccount();
  const tabletBreakpoint = useMediaQuery(TABLET_BREAKPOINT);
  const desktopBreakpoint = useMediaQuery(DESKTOP_BREAKPOINT);

  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [userTier, setUserTier] = useState<TierData>(INITIAL_TIER_DATA);
  const [isRedemption, setIsRedemption] = useState<boolean>(false);
  const [inactiveReferralPoints, setInactiveReferralPoints] = useState(0);
  const [claimablePoints, setClaimablePoints] = useState(0);

  const visibleBadgesCount = useMemo(() => {
    if (tabletBreakpoint) return 2;
    if (desktopBreakpoint) return 4;
    if (!desktopBreakpoint) return 5;
    return 5;
  }, [desktopBreakpoint, tabletBreakpoint]);

  const handleHistory = () => {
    router.push("/points/history");
  };

  useAccountEffect({
    onDisconnect: () => {
      resetState();
      setUserTier(INITIAL_TIER_DATA);
      setCurrentPoints(0);
    },
  });

  useEffect(() => {
    axios.get<{ DISABLE_POINTS_REDEMPTION: string }>("/environment/environment.json").then(({ data }) => {
      setIsRedemption(!data.DISABLE_POINTS_REDEMPTION);
    });
  }, []);

  useEffect(() => {
    if (!isConnected || !isAuthenticated) return;

    GetBadgesProfile().then(({ error, data }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
      } else if (data) {
        setCurrentPoints(data.points);
        setInactiveReferralPoints(data.inactiveReferralPoints);
        setClaimablePoints(data.claimablePoints);
        const { user } = data;
        setUserPointsData({
          displayName: user.displayName,
          avatarUrl: user.avatarUrl || "",
          isAvatar: user.isAvatar,
          referralCode: user.referralCode,
        });
        setUserTier(data.tiers);
        setUserBadges(data.userBadges || []);
      }
    });
  }, [isConnected, isAuthenticated]);

  const OfflinePlug = useCallback(({ isDisconnected }: { isDisconnected: boolean }) => {
    return isDisconnected ? (
      <div className={styles.offlinePlug}>
        <p>Please connect wallet to check your details.</p>
        <ConnectButton.Custom>
          {({ openConnectModal }) => {
            return (
              <Button
                title='Connect wallet'
                variant='primary'
                onClick={openConnectModal}
                className={styles.connectButton}
              >
                Connect Wallet
              </Button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    ) : null;
  }, []);

  const showingBadges = userBadges?.slice(Math.max(0, userBadges.length - visibleBadgesCount), userBadges.length) || [];

  return (
    <Panel className={styles.container}>
      <div className={styles.profileHeader}>
        <h1>My Profile</h1>
      </div>
      <div className={`${styles.profile} ${(!isAuthenticated || !isConnected) && styles.offline}`}>
        <div className={styles.profileInfo}>
          <div className={styles.infoContainer}>
            {isAvatar && avatarUrl ? (
              <ProfileImage
                width={40}
                height={40}
                className={styles.avatar}
                src={avatarUrl}
                alt='Leaderboard avatarUrl'
              />
            ) : (
              <Avatar />
            )}
            <div className={styles.info}>
              <p className={styles.title}>Leaderboard Name</p>
              <p className={styles.value}>
                {!isConnected || !isAuthenticated ? "-" : getTruncateEthAddress(displayName)}
              </p>
            </div>
          </div>
          <div className={styles.rewards}>
            <div className={styles.experienceInfo}>
              <div>
                <p className={styles.title}>Total Points Earned</p>
                <p className={styles.experienceValue}>
                  {!isConnected || !isAuthenticated ? "-" : formatNumber(currentPoints, 3)} Points
                </p>
              </div>
              <div className={styles.nextTierInfo}>
                <p className={styles.title}>Next Tier</p>
                <p className={styles.nextTierValue}>
                  {!isConnected || !isAuthenticated ? "-" : userTier.maxPoints} Points
                </p>
              </div>
            </div>
            <div className={styles.experienceLine}>
              <div
                style={{
                  width: `${((currentPoints - userTier.minPoints) / (userTier.maxPoints - userTier.minPoints)) * 100}%`,
                }}
                className={styles.currentExperienceLine}
              ></div>
            </div>
            <div className={styles.pointsInfo}>{`Includes ${formatNumber(
              claimablePoints > 0 ? inactiveReferralPoints : currentPoints,
              2
            )} Pending Points`}</div>
            <div className={styles.buttonsContainer}>
              <Button
                title={isRedemption ? "Redeem Points" : "Points History"}
                onClick={handleHistory}
                size='sm'
                variant='outline'
              >
                {isRedemption ? "Redeem Points" : "Points History"}
              </Button>
            </div>
          </div>
        </div>
        <div className={styles.profileBadges}>
          <div className={styles.profileBadge}>
            <Image src={getTierImage(userTier.id)} alt={userTier.description} width='140' height='140' />
            <p className={`${styles.label} ${userTier.name.length > 16 ? styles.smallText : ""}`}>{userTier.name}</p>
            <p className={styles.title}>Tier {userTier.id}</p>
          </div>
          {/* <div className={styles.profileBadge}>
            <Image src={getStreakImage(new Date().toISOString())} alt={"Seedling"} width='100' height='100' />
            <p className={styles.label}>{getStreakLabel(new Date().toISOString())}</p>
            <p className={styles.title}>Streak</p>
          </div> */}
        </div>
      </div>
      <div className={styles.badgesHeader}>
        <h1>My Badges</h1>
      </div>
      {/*<div className={`${styles.badges} ${(!isAuthenticated || !isConnected) && styles.offline}`}>*/}
      <div className={styles.badges}>
        <div>
          {userBadges.length === 0 && (
            <div className={styles.noBadge}>
              <p className={styles.title}>Complete Quests to Earn Badges</p>
            </div>
          )}
          <div className={styles.badgesGrid}>
            {showingBadges.map(badgeData => {
              return (
                <div key={badgeData.id} className={styles.badge}>
                  <Image
                    className={styles.badgeImage}
                    src={getBadgeImage(badgeData.Badge)}
                    alt={badgeData.Badge?.name}
                    width={80}
                    height={80}
                  />
                  <p className={styles.title}>{badgeData.data?.name || badgeData.Badge.name}</p>
                  {badgeData.awardedAt ? (
                    <p className={styles.earned}>Earned on {format(parseISO(badgeData.awardedAt), "dMMMyy")}</p>
                  ) : (
                    <Button title='Unlock' onClick={() => {}} size='sm' variant='secondary'>
                      Unlock
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <OfflinePlug isDisconnected={!isAuthenticated || !isConnected} />
    </Panel>
  );
};

export default PointsProfile;
