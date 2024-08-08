import { ApiService } from "./api.service";
import { fetchSingleConfigKey } from "./environment.service";

interface KycApiData {
  walletAddress?: string;
}

export const checkAndDetectIp = async (data: KycApiData) => {
  const apiUrl = await fetchSingleConfigKey("KYC_URL");
  const KycApiService = new ApiService(apiUrl);
  return KycApiService.post<undefined, KycApiData>("/api/ip/detect-and-check-ip", data);
};
