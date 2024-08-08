import { Badge } from "@/UI/constants/badges";
import { BadgeType } from "./types";

const orderByType = {
  [BadgeType.COMMUNITY.valueOf()]: 1,
  [BadgeType.ACTIVITY.valueOf()]: 2,
  [BadgeType.PRODUCT.valueOf()]: 3,
  [BadgeType.TIER.valueOf()]: 4,
  [BadgeType.TRADING.valueOf()]: 5,
  [BadgeType.SPECIAL.valueOf()]: 6,
  [BadgeType.SERIAL.valueOf()]: 7,
};

export function sortBadges(badges: Badge[]): Badge[] {
  const badgesTypeMap = badges.reduce(
    (acc, badge) => {
      acc[badge.badgeType] = acc[badge.badgeType] || [];
      acc[badge.badgeType].push(badge);
      return acc;
    },
    {} as Record<string, Badge[]>
  );

  const activityBadges = badgesTypeMap[BadgeType.ACTIVITY.valueOf()] || [];
  sortActivityBadges(activityBadges);

  const productBadges = badgesTypeMap[BadgeType.PRODUCT.valueOf()] || [];
  sortProductBadges(productBadges);

  return Object.values(badgesTypeMap)
    .sort((arrA, arrB) => {
      const aBadge = arrA[0];
      const bBadge = arrB[0];
      const aOrder = orderByType[aBadge.badgeType] || 20;
      const bOrder = orderByType[bBadge.badgeType] || 20;
      return aOrder - bOrder;
    })
    .flat();
}

function sortActivityBadges(activityBadges: Badge[]): Badge[] {
  return activityBadges.sort((a, b) => {
    if (!a.criteria.referral) {
      return -1;
    }

    if (!b.criteria.referral) {
      return 1;
    }
    return (a.criteria.referral as number) - (b.criteria.referral as number);
  });
}

function sortProductBadges(productBadges: Badge[]): Badge[] {
  return productBadges.sort((a, b) => {
    if (a.criteria.usageCount && b.criteria.usageCount) {
      return (a.criteria.usageCount as number) - (b.criteria.usageCount as number);
    }

    if (a.criteria.usageCount) {
      return -1;
    }

    if (b.criteria.usageCount) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });
}
