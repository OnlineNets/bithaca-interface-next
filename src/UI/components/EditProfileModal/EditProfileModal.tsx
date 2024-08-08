import React, { ReactElement, useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";

//Components
import Modal from "@/UI/components/Modal/Modal";
import Button from "@/UI/components/Button/Button";
import Avatar from "@/UI/components/Icons/Avatar";
import Input from "@/UI/components/Input/Input";
import Toast from "../Toast/Toast";
import WalletIcon from "../Icons/Wallet";
import CopyIcon from "../Icons/CopyIcon";
import Image from "next/image";

// Constants
import { PointsUserDataType } from "@/UI/constants/pointsProgram";

// Utils
import { formatEthAddress } from "@/UI/utils/Numbers";
import { handlePointsError } from "@/UI/utils/Points";
import { useAppStore } from "@/UI/lib/zustand/store";
import useToast from "@/UI/hooks/useToast";

// Services
import { GetUserData, UpdateUsername } from "@/UI/services/PointsAPI";
import mixPanel from "@/services/mixpanel";

// Styles
import styles from "./EditProfileModal.module.scss";

type EditProfileProps = {
  trigger: ReactElement;
};

const EditProfileModal = ({ trigger }: EditProfileProps) => {
  const { displayName, avatarUrl, isAvatar, setUserPointsData } = useAppStore();
  const { data: walletClient } = useWalletClient();
  const [showTrigger, setShowTrigger] = useState(false);
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toastList, showToast } = useToast();

  const [leaderboardUserData, setLeaderboardUserData] = useState<Omit<PointsUserDataType, "signature">>({
    displayName: displayName,
    avatarUrl: avatarUrl,
    isAvatar: isAvatar,
  });

  const cleanUserData = () => {
    setLeaderboardUserData({
      displayName: "",
      avatarUrl: null,
      isAvatar: false,
    });
  };

  useEffect(() => {
    setShowTrigger(isConnected);
  }, [isConnected]);

  const openPrepared = (data?: Omit<PointsUserDataType, "signature">) => {
    setLeaderboardUserData({
      displayName: data ? data.displayName : displayName,
      avatarUrl: data ? data.avatarUrl : avatarUrl,
      isAvatar: data ? data.isAvatar : isAvatar,
    });
    setIsOpen(true);
  };

  const openDialog = () => {
    if (!displayName.length) {
      GetUserData().then(({ data, error }) => {
        if (error) {
          handlePointsError({
            showToast,
            title: error.name,
            message: error.message,
          });
        } else if (data) {
          const { user } = data;
          setUserPointsData({
            displayName: user.displayName,
            avatarUrl: user.avatarUrl || "",
            isAvatar: user.isAvatar,
            referralCode: user.referralCode,
          });
          openPrepared(user);
        }
      });
    }

    openPrepared();
  };

  const closeDialog = () => {
    setIsOpen(false);
    cleanUserData();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(`${address}`);
    showToast(
      {
        id: new Date().getTime(),
        title: "Copied",
        message: `${address}`,
        type: "success",
      },
      "bottom-right"
    );
  };

  const validate = (): boolean => {
    if (leaderboardUserData.displayName.length < 3) {
      showToast(
        {
          id: new Date().getTime(),
          title: "Not saved",
          message: "Username must be at least 3 characters.",
          type: "error",
        },
        "bottom-right"
      );
      return false;
    }
    if (leaderboardUserData.displayName.length > 42) {
      showToast(
        {
          id: new Date().getTime(),
          title: "Not saved",
          message: "Username must be less than 42 characters.",
          type: "error",
        },
        "bottom-right"
      );
      return false;
    }
    return true;
  };

  const handleSaveChanges = () => {
    if (validate()) {
      const domain = {
        name: "Ithaca",
        version: "0.1",
      } as const;

      const types = {
        UserProfile: [
          { name: "displayName", type: "string" },
          { name: "isAvatar", type: "bool" },
        ],
      } as const;

      const message = {
        displayName: leaderboardUserData.displayName,
        isAvatar: leaderboardUserData.isAvatar,
      };

      walletClient
        ?.signTypedData({
          domain,
          types,
          primaryType: "UserProfile",
          message,
        })
        .then(signature => {
          UpdateUsername({ ...leaderboardUserData, signature }).then(() => {
            // POINTS_EVENTS: Update profile - service connected
            mixPanel.track("Update profile", leaderboardUserData);
            setUserPointsData({ ...leaderboardUserData, avatarUrl: leaderboardUserData.avatarUrl || "" });
            showToast(
              {
                id: new Date().getTime(),
                title: "Saved",
                message: "Profile information has been saved.",
                type: "success",
              },
              "bottom-right"
            );
          });
        })
        .catch(() => {
          showToast(
            {
              id: new Date().getTime(),
              title: "Not saved",
              message: "User rejected signature request",
              type: "error",
            },
            "bottom-right"
          );
        });
    }
  };

  const handleChangeUsername = (value: string) => {
    setLeaderboardUserData(prevState => ({
      ...prevState,
      displayName: value,
    }));
  };

  const handleChangeAvatarVisible = () => {
    setLeaderboardUserData(prevState => ({
      ...prevState,
      isAvatar: !prevState.isAvatar,
    }));
  };

  return (
    <>
      {showTrigger && (
        <button className={styles.transparentBtn} onClick={openDialog}>
          {React.cloneElement(trigger)}
        </button>
      )}

      <Modal isOpen={isOpen} onCloseModal={closeDialog} title='Edit Profile' className={styles.editProfileModal}>
        <div className={styles.dialogBody}>
          <div className={styles.profilePhotoCtrl}>
            {leaderboardUserData.avatarUrl && leaderboardUserData.isAvatar ? (
              <Image
                width={60}
                height={60}
                className={styles.avatar}
                src={leaderboardUserData.avatarUrl}
                alt='Leaderboard avatarUrl'
              />
            ) : (
              <Avatar />
            )}
            <Button title='' variant='secondary' className={styles.hideAvatarBtn} onClick={handleChangeAvatarVisible}>
              {!leaderboardUserData.isAvatar ? "Show" : "Hide"} Avatar
            </Button>
          </div>
          <Input
            id='leaderboardName'
            value={leaderboardUserData.displayName || ""}
            onChange={({ target: { value } }) => handleChangeUsername(value)}
            label='Leaderboard Name'
            type='text'
            className={styles.leaderboardName}
          />
          <div className={styles.walletAddressField}>
            <label>Connected Wallet (Hidden)</label>
            <div className={styles.walletAddress}>
              <WalletIcon />
              {address ? (
                <>
                  <span className={styles.ethAddress}>{formatEthAddress(`${address}`)}</span>
                  <button className={styles.transparentBtn} onClick={copyAddress}>
                    <CopyIcon />
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
          <Button onClick={handleSaveChanges} title=''>
            Save Changes
          </Button>
        </div>
      </Modal>
      <Toast toastList={toastList} position='bottom-right' autoDelete={true} />
    </>
  );
};

export default EditProfileModal;
