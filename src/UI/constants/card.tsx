import { ReactNode } from "react";

export type CardProps = {
  title: string;
  address: string;
  label: string;
  value: number;
  icon?: ReactNode;
  currency?: string;
};
