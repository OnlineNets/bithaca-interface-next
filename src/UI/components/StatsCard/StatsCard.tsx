// Styles
import Image from "next/image";
import styles from "./StatsCard.module.scss";
import Tooltip from "../Icons/Tooltip";

type StatsCardProps = {
  title: string;
  stat: string | number | undefined;
  badgeImageUrl?: string | null;
  badgeName?: string | null;
  tooltip?: string;
};

const StatsCard = ({ title, stat, badgeImageUrl, badgeName, tooltip }: StatsCardProps) => {
  return (
    <div className={styles.container}>
      {tooltip && (
        <div className={styles.tooltip}>
          <Tooltip />
          <span className={styles.tooltipText}>{tooltip}</span>
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.statsContainer}>
        <div className={styles.stat}>{stat ?? "-"}</div>
        {badgeImageUrl && badgeName && (
          <Image src={`/images/badges/${badgeImageUrl}`} alt={badgeName} width={48} height={48} />
        )}
      </div>
    </div>
  );
};

export default StatsCard;
