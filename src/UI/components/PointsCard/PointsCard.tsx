// Components
import Button from "@/UI/components/Button/Button";
import Href from "@/UI/components/Icons/Href";
import Flex from "@/UI/layouts/Flex/Flex";

// Utils
import { formatPoints } from "@/UI/utils/Points";
import { isProd } from "@/UI/utils/RainbowKit";

// Styles
import styles from "./PointsCard.module.scss";

type PointsCardProps = {
  isPointActived: boolean;
  mainnetTradingPoints: number;
  claimablePoints: number;
  inactiveReferralPoints: number;
  totalPoints: number;
  isRedemption: boolean;
  isPending: boolean;
  redeemPointsHandler: () => void;
};

const PointsCard = ({
  mainnetTradingPoints,
  claimablePoints,
  inactiveReferralPoints,
  totalPoints,
  isPointActived,
  isPending,
  isRedemption,
  redeemPointsHandler,
}: PointsCardProps) => {
  return (
    <div className={`${styles.container} ${styles.card3}`}>
      <div className={styles.data3}>
        {!isPointActived ? (
          <div className={`${styles.descriptions} ${styles.justifyBetween}`}>
            <p className={styles.title}>Total Activated Points</p>
            <div className={styles.descriptionContentBlock}>
              <Flex direction='column'>
                <p className={styles.pointsLabel}>{formatPoints(!isPointActived ? 0 : claimablePoints, "All")}</p>
                <p className={styles.totalPointsLabel}>{`Total Pending Points ${formatPoints(
                  !isPointActived ? totalPoints : inactiveReferralPoints,
                  "All"
                )}`}</p>
                <p className={styles.subtitle}>
                  <a
                    href={isProd ? "/trading/dynamic-option-strategies" : "https://app.ithacaprotocol.io"}
                    target={isProd ? "_self" : "_blank"}
                    className={styles.link}
                  >
                    Trade now on mainnet
                  </a>
                  <a
                    href={isProd ? "/trading/dynamic-option-strategies" : "https://app.ithacaprotocol.io"}
                    target={isProd ? "_self" : "_blank"}
                  >
                    <Href />
                  </a>
                  and trade a minimum notional of $20 (digitals), 0.2ETH (options) or 1 ETH (forwards) to activate all
                  points.
                </p>
              </Flex>
            </div>
          </div>
        ) : (
          <div className={`${styles.descriptions} ${styles.justifyCenter}`}>
            <p className={styles.title}>Total Activated Points</p>
            <div className={styles.descriptionContentBlock}>
              <Flex direction='column'>
                <p className={styles.pointsLabel}>{formatPoints(mainnetTradingPoints < 10 ? 0 : totalPoints, "All")}</p>
              </Flex>
            </div>
          </div>
        )}
        {isRedemption && (
          <div className={styles.redeemButtonContainer}>
            <p className={styles.title}>You have points waiting for you!</p>
            <Button
              className={styles.redeemButton}
              title={"Redeem Points"}
              size={"sm"}
              onClick={redeemPointsHandler}
              disabled={isPending}
            >
              Redeem Points
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsCard;
