// Types
export type GreekSymbolType = {
  symbol: string;
  name: string;
  id: string;
};

export const GREEK_SYMBOLS: GreekSymbolType[] = [
  { symbol: "&Delta;", name: "Delta", id: "delta" },
  { symbol: "&nu;", name: "Vega", id: "vega" },
  { symbol: "&Gamma;", name: "Gamma", id: "gamma" },
  { symbol: "&theta;", name: "Theta", id: "theta" },
  // { symbol: '&Rho;', name: 'Rho', id: 'price' },
];
