import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

interface ApiResponse<T> {
  status: number;
  data: T;
}

export class ApiService {
  private readonly api: AxiosInstance;

  constructor(baseUrl: string, timeout?: number) {
    this.api = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      validateStatus: status => status >= 200 && status < 402,
    });
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  public async post<T, Q>(url: string, data?: Q, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  public async put<T>(url: string, data?: T, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.request<T>(config);

    return {
      status: response.status,
      data: response.data,
    };
  }
}
