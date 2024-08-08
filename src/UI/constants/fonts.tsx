// Packages
import { Lato, Roboto } from "next/font/google";

export const LATO = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--lato-font",
});

export const ROBOTO = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--roboto-font",
});
