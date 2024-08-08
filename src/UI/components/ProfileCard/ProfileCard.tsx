// Components
import Avatar from "@/UI/components/Icons/Avatar";
import ProfileImage from "@/UI/components/ProfileImage/ProfileImage";
import EditProfileModal from "../EditProfileModal/EditProfileModal";

// Utils
import { getTruncateEthAddress } from "@/UI/utils/Points";

// Styles
import styles from "./ProfileCard.module.scss";
import { isAddress } from "viem";
import Button from "../Button/Button";

type ProfileCardProps = {
  displayName: string;
  isAvatar: boolean;
  avatarUrl: string;
};

const ProfileCard = ({ displayName, avatarUrl, isAvatar }: ProfileCardProps) => {
  return (
    <div className={`${styles.container} ${styles.card3}`}>
      <div className={styles.data3}>
        <div className={styles.descriptions}>
          <p className={styles.title}>My Profile</p>
          <div className={styles.descriptionContentBlock}>
            <div className={styles.profile}>
              {isAvatar ? (
                <ProfileImage
                  width={60}
                  height={60}
                  className={styles.avatar}
                  src={avatarUrl}
                  alt='Leaderboard avatarUrl'
                />
              ) : (
                <Avatar />
              )}
              <div className={styles.leaderBoardUsername}>
                <p className={styles.userTitle}>Leaderboard Name</p>
                <p className={styles.username}>
                  {isAddress(displayName) ? getTruncateEthAddress(displayName) : displayName}
                </p>
              </div>
            </div>
          </div>
        </div>
        <EditProfileModal
          trigger={
            <Button title='Edit Profile' variant='outline'>
              Edit Profile
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default ProfileCard;
