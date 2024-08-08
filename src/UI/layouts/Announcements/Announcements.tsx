import { useMemo } from "react";
import styles from "./Announcements.module.scss";

import MarqueeAnnouncement from "@/UI/components/Marquee";

function Announcements() {
  const announcements = useMemo(() => {
    const messages = ["Ithaca Protocol Mainnet Open Alpha - Join us on Telegram, Discord & X (Twitter)"];

    return messages.map(message => (
      <p key={message} className={styles["announcement-message"]}>
        {message}
      </p>
    ));
  }, []);

  return (
    <MarqueeAnnouncement key={announcements.length} className={styles.announcement}>
      {announcements}
    </MarqueeAnnouncement>
  );
}

export default Announcements;
