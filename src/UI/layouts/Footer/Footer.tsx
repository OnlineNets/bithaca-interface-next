// Packages
import Link from "next/link";

// Components
import TwitterIcon from "@/UI/components/Icons/Twitter";
import DiscordIcon from "@/UI/components/Icons/Discord";
import TelegramIcon from "@/UI/components/Icons/Telegram";

// Constants
import { DISCORD_LINK, TELEGRAM_LINK, TWITTER_LINK } from "@/UI/constants/pointsProgram";

// Styles
import styles from "./Footer.module.scss";
import containerStyles from "@/UI/layouts/Container/Container.module.scss";
import BuildVersion from "@/UI/components/BuildVersion/BuildVersion";

// Types
type HeaderProps = {
  className?: string;
};
const Footer = ({ className }: HeaderProps) => {
  return (
    <footer className={`${containerStyles.container} ${styles.footer} ${className || ""}`}>
      <div className={styles.footerLinks}>
        <Link href='/terms' target='_blank'>
          Terms & Conditions
        </Link>
        <Link href='/privacy' target='_blank'>
          Privacy Policy
        </Link>
        <Link href='/account-access-management'>Account Access Management</Link>
        <Link href='https://docs.ithacaprotocol.io/docs/'>Docs</Link>
        <BuildVersion className={styles.buildVersion} />
      </div>
      <div className={styles.footerIcons}>
        <a className={styles.socialLink} href={TWITTER_LINK} target='_blank'>
          <TwitterIcon />
        </a>
        <a className={styles.socialLink} href={DISCORD_LINK} target='_blank'>
          <DiscordIcon />
        </a>
        <a className={styles.socialLink} href={TELEGRAM_LINK} target='_blank'>
          <TelegramIcon />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
