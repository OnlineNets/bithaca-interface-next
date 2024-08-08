import axios from "axios";

export interface EnvironmentConfig {
  API_URL: string;
  WS_URL: string;
  POINTS_URL: string;
  GRAFANA_URL: string;
  KYC_URL: string;
  TRADING_URL: string;
  DISABLE_POINTS_REDEMPTION: string;
  DISABLE_POINTS: string;
  SUBGRAPH_URL: string;
  SQUID_API_URL: string;
}

export const fetchConfig = async (): Promise<EnvironmentConfig> => {
  const result = await axios.get<EnvironmentConfig>("/environment/environment.json");
  return result.data;
};

export const fetchSingleConfigKey = async (key: keyof EnvironmentConfig): Promise<string> => {
  const data = await fetchConfig();
  return data[key];
};
