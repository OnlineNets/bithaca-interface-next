export enum BadgeType {
  TIER = "TIER",
  ACTIVITY = "ACTIVITY",
  PRODUCT = "PRODUCT",
  TRADING = "TRADING",
  COMMUNITY = "COMMUNITY",
  SPECIAL = "SPECIAL",
  SERIAL = "SERIAL",
}

export type Directive =
  | "child-src"
  | "connect-src"
  | "default-src"
  | "font-src"
  | "frame-src"
  | "img-src"
  | "manifest-src"
  | "media-src"
  | "object-src"
  | "prefetch-src"
  | "script-src"
  | "script-src-elem"
  | "script-src-attr"
  | "style-src"
  | "style-src-elem"
  | "style-src-attr"
  | "worker-src"
  | "base-uri"
  | "plugin-types"
  | "sandbox"
  | "form-action"
  | "frame-ancestors"
  | "navigate-to"
  | "report-uri"
  | "report-to"
  | "block-all-mixed-content"
  | "referrer"
  | "require-sri-for"
  | "require-trusted-types-for"
  | "trusted-types"
  | "upgrade-insecure-requests";

export type Value = string;

export type Currency = "USDC" | "WETH";

export type SelectedCurrency = { name: string; value: `0x${string}` };

export type Payoff = "BinaryCall" | "BinaryPut" | "Call" | "Put" | "Forward";

export type SideUnion = "BUY" | "SELL";

export enum SIDE {
  BUY = "BUY",
  SELL = "SELL",
}
