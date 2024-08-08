import { LockedCollateralResponse } from "@ithaca-finance/sdk";

export const sumLockedCollateral = (lockups: LockedCollateralResponse) => {
  return Object.values(lockups)
    .flat()
    .reduce(
      (acc, lockup) => {
        acc.totalUnderlierAmount += lockup.locked.underlierAmount;
        acc.totalNumeraireAmount += lockup.locked.numeraireAmount;
        return acc;
      },
      { totalUnderlierAmount: 0, totalNumeraireAmount: 0 }
    );
};
