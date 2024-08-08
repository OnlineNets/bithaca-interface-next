import LogoEth from "../components/Icons/LogoEth";
import LogoUsdc from "../components/Icons/LogoUsdc";

export const getCurrencyLogo = (currency: string, className?: string) => {
  switch (currency) {
    case "WETH":
    case "ETH":
      return <LogoEth className={className} />;
    case "USDC":
    case "USD":
      return <LogoUsdc className={className} />;
    default:
      return <></>;
  }
};

export const getCurrency = (currency: string) => {
  switch (currency) {
    case "WETH":
      return "ETH";
    case "USDC":
      return "USD";
    default:
      return currency;
  }
};
