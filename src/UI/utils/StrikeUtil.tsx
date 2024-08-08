export const findStrikeClosestToSpot = (
  strikes: {
    name: string;
    value: string;
  }[],
  spot: number
) => {
  return strikes.sort((a, b) => Math.abs(spot - Number(a.value)) - Math.abs(spot - Number(b.value)))[0].value;
};

export const closestStrike = (currentspot: number) => {
  return Math.round(currentspot / 100) * 100;
};
