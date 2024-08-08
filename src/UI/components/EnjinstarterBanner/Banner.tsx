// Styles
import styles from "./Banner.module.scss";
import BannerIamge from "@/assets/Banner.png";
import Image from "next/image";

type EnjinstarterProps = {
  title: string;
  stat: string | number;
};

const Banner = ({ title, stat }: EnjinstarterProps) => {
  return (
    <div className={styles.container}>
      <Image src={BannerIamge} alt='Banner Image' />
    </div>
  );
};

export default Banner;
