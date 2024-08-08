export type ToastItemProp = {
  id: number;
  title: string;
  message: string;
  hyper?: {
    hyperLink: string;
    hyperText: string;
  };
  type: string;
  netPrice?: number;
  viewOrder?: boolean;
};
