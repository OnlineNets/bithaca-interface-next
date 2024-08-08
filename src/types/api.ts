export interface ListResponse<T> {
  data: T[];
  status: number;
}

export interface ApiDataResponse<T> {
  data: T;
  status: number;
}
