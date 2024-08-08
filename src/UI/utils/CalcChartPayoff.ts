export interface Economics {
  // currencyPair: string;
  // expiry: number;
  strike?: number;
  // priceCurrency: string;
  // qtyCurrency: string;
}

export interface OptionLeg {
  contractId: number;
  quantity: string;
  side: string;
  payoff?: string;
  economics: Economics;
  premium: number;
}

export type LabelPositionProp = {
  x: number;
  y: number;
  offset: number;
};

export type CustomRange = {
  min: number;
  max: number;
};

export type PayoffMap = Record<string, number>;
export type PayoffMapWithIndex = PayoffMap & { index: number };

const range = (start: number, stop: number, step: number = 10) => {
  const length = Math.ceil((stop - start) / step);
  return Array(length < 0 ? length * -1 : length)
    .fill(start)
    .map((x, y) => x + y * step);
};

const calculateRange = (legs: OptionLeg[], customRange?: CustomRange) => {
  const legsSorted = legs
    .map(leg => (leg.payoff === "Forward" || leg.payoff === "Spot" ? leg.premium : leg.economics?.strike || 1000))
    .sort();
  return customRange
    ? range(customRange.min, customRange.max, 1)
    : range(legsSorted[0] - 500, legsSorted[legsSorted.length - 1] + 500, 1);
};

const payoffMap = {
  Call: "Call",
  Put: "Put",
  BinaryCall: "Digital Call",
  BinaryPut: "Digital Put",
  Forward: "Forward",
  Spot: "Next Auction Forward",
};

type PAYOFF_TYPE = "Call" | "Put" | "BinaryCall" | "BinaryPut" | "Forward" | "Spot";

export function estimateOrderPayoff(legs: OptionLeg[], customRange?: CustomRange): PayoffMap[] {
  const payoffFunctions = {
    Call: (price: number, strike: number) => Math.max(0, price - strike),
    Put: (price: number, strike: number) => Math.max(0, strike - price),
    BinaryCall: (price: number, strike: number) => (price > strike ? 1 : 0),
    BinaryPut: (price: number, strike: number) => (price < strike ? 1 : 0),
    Forward: (price: number, strike: number) => price - strike,
    Spot: (price: number, strike: number) => price - strike,
  };

  const prices = calculateRange(legs, customRange);

  const payoffs = prices.map(price => {
    const payoff: PayoffMap = { x: price, total: 0 };
    legs.forEach((leg, index) => {
      const side = leg.side === "BUY" ? 1 : -1;
      const premium = leg.payoff !== "Forward" && leg.payoff !== "Spot" ? -leg.premium * side : 0;
      const strike = leg.payoff !== "Forward" && leg.payoff !== "Spot" ? leg.economics.strike : leg.premium;
      const intrinsicValue =
        side * payoffFunctions[leg.payoff as keyof typeof payoffFunctions](price, strike || 0) + premium;
      const label = `${payoffMap[leg.payoff as PAYOFF_TYPE]}@${index}`;
      const quantity = parseFloat(leg.quantity);
      payoff[label] = intrinsicValue * quantity;
      payoff.total += intrinsicValue * quantity;
    });
    // Object.keys(payoff).forEach(key => {
    //   if (key != 'x' && Math.abs(payoff[key]) > Math.abs(payoff['total'] * 1.25)) {
    //     delete payoff[key];
    //   }
    // });
    return payoff;
  });

  const mean = payoffs.reduce((sum, payoff) => sum + payoff.total, 0) / payoffs.length;

  const stdDev = Math.sqrt(payoffs.reduce((sq, payoff) => sq + Math.pow(payoff.total - mean, 2), 0) / payoffs.length);

  const significantChanges = calculateSignificantChanges(payoffs, stdDev);
  const mod10 = adjustPayoffs(payoffs, significantChanges);
  return sortPayoffs(payoffs, mod10);
}

const calculateSignificantChanges = (payoffs: PayoffMap[], stdDev: number) => {
  let preTanValue = 0;
  return payoffs.reduce((acc: PayoffMapWithIndex[], payoff, i) => {
    if (i === payoffs.length - 1) return acc;
    const tanValue = (payoff.total - payoffs[i + 1].total) / (payoff.x - payoffs[i + 1].x);
    if (
      preTanValue !== tanValue &&
      Math.round((preTanValue / tanValue) * 10) / 10 !== 1 &&
      Math.abs(payoff.total - payoffs[i + 1].total) > 0.25 * stdDev
    ) {
      preTanValue = tanValue;
      if (i !== 0) acc.push({ ...payoff, index: i });
    }
    return acc;
  }, []);
};

const adjustPayoffs = (payoffs: PayoffMap[], significantChanges: PayoffMapWithIndex[]) => {
  let mod10 = false;
  significantChanges.forEach(change => {
    if (change.index < payoffs.length - 1) {
      const nextPayoff = payoffs[change.index + (Math.abs(Math.round(change.x)) % 10 !== 0 ? 0 : 1)];
      mod10 = mod10 || Math.abs(Math.round(change.x)) % 10 !== 0;
      const diff = change.total + (mod10 ? payoffs[change.index + 1].total : nextPayoff.total);
      if (
        !mod10 &&
        diff < Math.max(change.total, nextPayoff.total) &&
        diff > Math.min(change.total, nextPayoff.total)
      ) {
        payoffs.push({
          ...nextPayoff,
          total: 0,
          x: change.x,
        });
      } else if (
        mod10 &&
        diff < Math.max(change.total, payoffs[change.index + 1].total) &&
        diff > Math.min(change.total, payoffs[change.index + 1].total)
      ) {
        payoffs.push({
          ...nextPayoff,
          total: 0,
          x: change.x + 1,
        });
      }
      payoffs.push({ ...nextPayoff, x: change.x + (mod10 ? 1 : 0) });
    }
  });
  return mod10;
};

const sortPayoffs = (payoffs: PayoffMap[], mod10: boolean) => {
  payoffs.sort((a, b) => {
    if (a.x !== b.x) {
      return a.x - b.x;
    }
    if (mod10) {
      if (a.total < b.total) {
        return a.total - b.total;
      } else {
        return b.total - a.total;
      }
    } else {
      if (a.total < b.total) {
        return b.total - a.total;
      } else {
        return a.total - b.total;
      }
    }
  });

  return payoffs;
};
