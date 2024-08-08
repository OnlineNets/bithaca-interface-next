import { arbitrum, arbitrumSepolia, polygonMumbai } from "wagmi/chains";
import { Chain } from "viem/_types/types/chain";

interface EnvChainsType {
  [key: string]: Chain;
}

const DEFAULT_CHAIN = arbitrum;

const envChains: EnvChainsType = {
  // prettier-ignore
  "localhost": arbitrumSepolia,
  "app.ithacaprotocol.io": DEFAULT_CHAIN,
  "sepolia.canary.ithacanoemon.tech": arbitrumSepolia,
  "testnet.ithacaprotocol.io": arbitrumSepolia,
  "app.canary.ithacanoemon.tech": arbitrumSepolia,
  "mumbai.canary.ithacanoemon.tech": polygonMumbai,
  "decent-governor-development-phase1.up.railway.app": arbitrumSepolia,
  "axelar-integration.ithacaprotocol.io": arbitrum,
};

export const getActiveChain = () => {
  if (typeof window !== "undefined") {
    return envChains[window.location.hostname] ?? DEFAULT_CHAIN;
  }

  return DEFAULT_CHAIN;
};
