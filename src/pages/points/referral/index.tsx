import "@farcaster/auth-kit/styles.css";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAccount, useAccountEffect } from "wagmi";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

// Components
import Panel from "@/UI/layouts/Panel/Panel";
import Button from "@/UI/components/Button/Button";
import WalletIcon from "@/UI/components/Icons/Wallet";
import TwitterIcon from "@/UI/components/Icons/Twitter";
import DiscordIcon from "@/UI/components/Icons/Discord";
import TelegramIcon from "@/UI/components/Icons/Telegram";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Main from "@/UI/layouts/Main/Main";
import Meta from "@/UI/components/Meta/Meta";
import Container from "@/UI/layouts/Container/Container";
import PointsLayout from "@/UI/layouts/PointsLayout/PointsLayout";
import Toast from "@/UI/components/Toast/Toast";
import Input from "@/UI/components/Input/Input";
import Plug from "@/UI/components/Plug/Plug";
import Loader from "@/UI/components/Loader/Loader";

// Utils
import { handlePointsError, openCentredPopup } from "@/UI/utils/Points";
import { useAppStore } from "@/UI/lib/zustand/store";
import useToast from "@/UI/hooks/useToast";

// Services
import {
  JoinTelegram,
  JoinTwitter,
  JoinDiscord,
  DiscordCallback,
  GetUserData,
  TwitterVerify,
  farcasterCallback,
} from "@/UI/services/PointsAPI";
import mixPanel from "@/services/mixpanel";
import { fetchSingleConfigKey } from "@/services/environment.service";

// Constants
import { DISCORD_LINK, SocialMediaStatus, TELEGRAM_LINK, TWITTER_LINK } from "@/UI/constants/pointsProgram";

// Styles
import styles from "./referral.module.scss";
import { StatusAPIResponse, createAppClient, viemConnector } from "@farcaster/auth-kit";
import FarcasterIcon from "@/UI/components/Icons/Farcaster";
import { FarcasterModal } from "./FarcasterModal";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Referral = () => {
  const { isAuthenticated, setUserPointsData, referralCode } = useAppStore();
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifingTwitter, setIsVerifingTwitter] = useState(false);
  const { toastList, showToast } = useToast();
  const [isDBConnected, setIsDBConnected] = useState<boolean | null>(null);
  const [referralToken, setReferralToken] = useState<string>();
  const [twitterPostLink, setTwitterPostLink] = useState<string>("");
  const [twitterIsPosted, setTwitterIsPosted] = useState<boolean>(false);
  const [referralLink, setReferralLink] = useState<string>(
    `https://${window.location.hostname}/points-program?referral=${referralCode}`
  );

  const [actions, setActions] = useState<SocialMediaStatus>({
    wallet: false,
    twitter: false,
    discord: false,
    telegram: false,
    farcaster: false,
  });
  const [isPointsDisabled, setIsPointsDisabled] = useState(true);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const [farcasterData, setFarcasterData] = useState<null | {
    url: string;
    channelToken: string;
    auth?: StatusAPIResponse;
    farcasterFollowClicked?: boolean;
  }>();
  const [showQR, setShowQR] = useState(false);

  const appClient = useMemo(() => {
    const appClient = createAppClient({
      relay: "https://relay.farcaster.xyz",
      ethereum: viemConnector(),
    });
    return appClient;
  }, []);

  async function setupFarcaster() {
    const result = await appClient.createChannel({
      siweUri: "https://clever-rats-cheat.loca.lt/farcaster-login",
      domain: window.location.host,
    });

    setFarcasterData({ url: result.data.url, channelToken: result.data.channelToken });
  }

  useEffect(() => {
    if (!appClient || !address) {
      return;
    }

    if (!actions.farcaster) {
      setupFarcaster();
    }
    // Update connection very 20 seconds
  }, [appClient, address, actions]);

  useEffect(() => {
    const token = searchParams.get("referral");
    if (token) setReferralToken(token);
  }, [searchParams]);

  useEffect(() => {
    if (!isConnected || !isAuthenticated || !referralCode) return;

    setReferralLink(`https://${window.location.hostname}/points/referral?referral=${referralCode}`);
  }, [isConnected, isAuthenticated, referralCode]);

  useEffect(() => {
    const discordFragment: string | undefined = router.asPath.split("#")[1];
    if (discordFragment) {
      const keyValuePairs: string[] = discordFragment.split("&");
      const queryParams: Record<string, string> = {};
      for (const pair of keyValuePairs) {
        const [key, value] = pair.split("=");
        queryParams[key] = value;
      }
      const accessToken = queryParams.access_token;
      DiscordCallback(accessToken).then(({ error }) => {
        const newUrl = router.asPath.replace(`#${discordFragment}`, "");
        router.replace(newUrl, undefined, { shallow: true });
        if (error) {
          handlePointsError({
            showToast,
            title: "Discord connection error",
            message: error.message,
          });
        } else {
          openUrl(DISCORD_LINK);
          setActions(prev => ({ ...prev, discord: true }));
          // POINTS_EVENTS: Join community Discord - service connected
          mixPanel.track("Join community Discord");
        }
      });
    }
    const twitterFragmentRegex = /[?&]twitter=([^&]+)&?(?:message=([^&]+))?&?(?:points=([^&]+))?/;
    const twitterFragment: RegExpMatchArray | null = router.asPath.match(twitterFragmentRegex);
    if (twitterFragment) {
      const [, twitter, message, points] = twitterFragment;
      const queryParams: Record<string, string> = {
        twitter: decodeURIComponent(twitter),
        message: message ? decodeURIComponent(message) : "",
        points: points ? decodeURIComponent(points) : "",
      };
      if (queryParams.twitter === "error") {
        handlePointsError({
          showToast,
          title: "Twitter connection error",
          message: queryParams.message,
        });
      } else {
        setTwitterPostLink(
          `I just signed up for @IthacaProtocol and earned ${queryParams.points} points! Ready to start options trading.%0A%0AUse my referral link to sign up:`
        );
      }
      const newUrl = router.asPath.replace(twitterFragmentRegex, "");
      router.replace(newUrl, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, router.asPath]);

  const updateUserData = (refToken: string) => {
    GetUserData(refToken).then(({ data, error }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
      } else if (data) {
        setIsDBConnected(true);
        const { displayName, avatarUrl, isAvatar, referralCode, telegram, farcaster, twitter, discord } = data.user;
        setActions({
          wallet: true,
          twitter: twitter || false,
          discord: discord || false,
          telegram: telegram || false,
          farcaster: farcaster || false,
        });
        setUserPointsData({
          displayName: displayName,
          avatarUrl: avatarUrl || "",
          isAvatar: isAvatar,
          referralCode: referralCode,
        });
      }
    });
  };

  useEffect(() => {
    if (!isConnected || !isAuthenticated || actions.wallet) {
      if (actions.wallet) setIsDBConnected(true);
      return;
    }

    setIsDBConnected(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    updateUserData(referralToken!);
  }, [isConnected, isAuthenticated, referralToken]);

  useEffect(() => {
    fetchSingleConfigKey("DISABLE_POINTS")
      .then(isPointsDisabled => {
        setIsPointsDisabled(!!isPointsDisabled);
        setIsConfigLoading(false);
      })
      .catch(() => {
        setIsPointsDisabled(true);
        setIsConfigLoading(false);
      });
  }, []);

  useAccountEffect({
    onDisconnect: () => {
      setIsDBConnected(null);
      setActions({
        wallet: false,
        twitter: false,
        discord: false,
        telegram: false,
        farcaster: false,
      });
    },
  });

  const openUrl = (url: string, target: string = "_blank") => {
    window.open(url, target);
  };

  const handleTwitterClick = useCallback(async () => {
    if (twitterIsPosted) {
      if (isVerifingTwitter) return;
      try {
        setIsVerifingTwitter(true);
        // Force to wait for 2 seconds to avoid the verification error, twitter API issue with twitts not being available
        await sleep(2000);
        const verifyResponse = await TwitterVerify();
        setIsVerifingTwitter(false);
        if (verifyResponse.error) {
          throw verifyResponse.error;
        }
        if (verifyResponse.data) {
          openUrl(TWITTER_LINK);
          setActions(prev => ({ ...prev, twitter: true }));
          // POINTS_EVENTS: Join community Twitter - service connected
          mixPanel.track("Join community Twitter");
        }
      } catch (error) {
        setIsVerifingTwitter(false);
        handlePointsError({
          showToast,
          title: (error as Error).name?.toString() || "Verification error",
          message: (error as Error).message?.toString() || "Verification error",
        });
      }
      return;
    }

    if (twitterPostLink) {
      openCentredPopup({
        url: `https://twitter.com/intent/post?text=${twitterPostLink}&url=${referralLink}`,
        width: 640,
        height: 320,
      });
      setTwitterIsPosted(true);
    } else {
      JoinTwitter().then(({ data, error }) => {
        if (error) {
          handlePointsError({
            showToast,
            title: error.name,
            message: error.message,
          });
        } else if (data && data.url) {
          openUrl(data.url, "_self");
        }
      });
    }
  }, [twitterIsPosted, twitterPostLink, showToast, referralLink, isVerifingTwitter]);

  const handleDiscordClick = async () => {
    JoinDiscord().then(({ data, error }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
      } else if (data && data.url) {
        openUrl(data.url, "_self");
      }
    });
  };

  const handleTelegramClick = async () => {
    JoinTelegram().then(({ data, error }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
      } else if (data && data.url) {
        // POINTS_EVENTS: Join community Telegram - service connected
        mixPanel.track("Join community Telegram");
        openUrl(TELEGRAM_LINK);
        setActions(prev => ({ ...prev, telegram: true }));
      }
    });
  };

  const handleFarcasterClick = async () => {
    if (!farcasterData) {
      handlePointsError({
        showToast,
        title: "Farcaster connection error",
        message: "An error occurred while connecting to Farcaster",
      });
      return;
    }

    if (!farcasterData.auth?.username) {
      return authFarcaster();
    }

    if (!farcasterData.farcasterFollowClicked) {
      return followFarcaster();
    }

    return verifyFarcaster();
  };

  const followFarcaster = async () => {
    setFarcasterData(prev => ({ ...prev!, farcasterFollowClicked: true }));
    window.open("https://warpcast.com/ithacaprotocol", "_blank");
  };

  const authFarcaster = async () => {
    if (!farcasterData) {
      return;
    }

    setShowQR(true);
    const data = await appClient.watchStatus({
      channelToken: farcasterData.channelToken,
    });

    if (data.isError) {
      console.error(data.error);
      handlePointsError({
        showToast,
        title: "Farcaster connection error",
        message: data.error?.message || "An error occurred while connecting to Farcaster",
      });
      setShowQR(false);

      setupFarcaster();
      return;
    }

    setShowQR(false);
    setFarcasterData(prev => ({ ...prev!, auth: data.data }));
  };

  const verifyFarcaster = async () => {
    const data: StatusAPIResponse = farcasterData!.auth!;
    try {
      const response = await farcasterCallback({
        ...data,
        walletAddress: address!,
      });
      if (response.error) {
        throw new Error(response.error.message || "An error occurred while connecting to Farcaster");
      }
    } catch (error) {
      console.error(error);
      handlePointsError({
        showToast,
        title: "Farcaster Error",
        message: (error as Error).message || "An error occurred while connecting to Farcaster",
      });
      if (!farcasterData?.auth?.username) {
        setupFarcaster();
      }
      return;
    }

    showToast(
      {
        id: new Date().getTime(),
        title: "Farcaster connected",
        message: "You have successfully connected to Farcaster.",
        type: "info",
      },
      "bottom-right"
    );
    updateUserData(referralToken!);
  };

  const ActionDescription = useCallback(
    ({ action, text }: { action: boolean; text: string }) => {
      return (
        <div
          className={`${styles.itemName} ${!isDBConnected ? styles.isDisconnected : action ? styles.isConnected : ""}`}
        >
          {text}
        </div>
      );
    },
    [isDBConnected]
  );

  const ActionCompleted = useCallback(({ action }: { action: boolean }) => {
    return action ? <span className={styles.completedTxt}>+ points earned</span> : <></>;
  }, []);

  const ActionButton = useCallback(
    ({
      action,
      text,
      onBtnClick,
      isLoading = false,
    }: {
      action: boolean;
      isLoading?: boolean;
      text: string;
      onBtnClick: () => void;
    }) => {
      if (action) {
        return (
          <Button title='Completed' variant='outline' className={styles.completedBtn}>
            <>Completed</>
          </Button>
        );
      }

      return (
        <Button title='' disabled={!actions.wallet} onClick={onBtnClick}>
          {isLoading && <Loader type={"sm"} />}
          {!isLoading && text}
        </Button>
      );
    },
    [actions]
  );

  if (isConfigLoading) {
    return (
      <Main>
        <Loader type='lg' />
      </Main>
    );
  }

  if (isPointsDisabled) {
    return (
      <Plug>
        <PointsLayout />
      </Plug>
    );
  }

  return (
    <>
      <Meta />
      <Main>
        <Container>
          <PointsLayout />
          <div className={styles.wrapper}>
            <Panel margin={styles.mainPanel}>
              <p>Trade on Ithaca Testnet and complete the actions below to earn Ithaca points.</p>
              <ul className={styles.programChecklist}>
                {/* Connect Wallet */}
                <li className={styles.listItem}>
                  <div className={styles.listIcon}>
                    <WalletIcon />
                  </div>
                  <div className={`${styles.itemName} ${actions.wallet ? styles.isConnected : ""}`}>
                    Connect your wallet
                  </div>
                  <div className={styles.buttonContainer}>
                    <ActionCompleted action={actions.wallet} />
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => {
                        if (actions.wallet) {
                          return (
                            <Button title='Completed' variant='outline' className={styles.completedBtn}>
                              {!isDBConnected ? "Loading" : "Completed"}
                            </Button>
                          );
                        } else {
                          return (
                            <Button title='Connect Wallet' onClick={openConnectModal}>
                              {isDBConnected === null ? "Connect Wallet" : "Loading"}
                            </Button>
                          );
                        }
                      }}
                    </ConnectButton.Custom>
                  </div>
                </li>
                {/* Follow on Twitter */}
                <li className={styles.listItem}>
                  <div className={styles.listIcon}>
                    <TwitterIcon />
                  </div>
                  <ActionDescription
                    action={actions.wallet && actions.twitter}
                    text={"Follow Ithaca and Post on X (Twitter)"}
                  />
                  <div className={styles.buttonContainer}>
                    <ActionCompleted action={actions.wallet && actions.twitter} />
                    <ActionButton
                      isLoading={isVerifingTwitter}
                      action={actions.wallet && actions.twitter}
                      text={twitterIsPosted ? "Verify (3/3)" : twitterPostLink ? "Post (2/3)" : "Follow (1/3)"}
                      onBtnClick={handleTwitterClick}
                    />
                  </div>
                </li>
                {/* Join Discord */}
                <li className={styles.listItem}>
                  <div className={styles.listIcon}>
                    <DiscordIcon />
                  </div>
                  <ActionDescription action={actions.wallet && actions.discord} text={"Join Ithaca Discord"} />
                  <div className={styles.buttonContainer}>
                    <ActionCompleted action={actions.wallet && actions.discord} />
                    <ActionButton
                      action={actions.wallet && actions.discord}
                      text='Join'
                      onBtnClick={handleDiscordClick}
                    />
                  </div>
                </li>
                {/* Join Telegram */}
                <li className={styles.listItem}>
                  <div className={styles.listIcon}>
                    <TelegramIcon />
                  </div>
                  <ActionDescription action={actions.wallet && actions.telegram} text={"Join Ithaca TG"} />
                  <div className={styles.buttonContainer}>
                    <ActionCompleted action={actions.wallet && actions.telegram} />
                    <ActionButton
                      action={actions.wallet && actions.telegram}
                      text='Join'
                      onBtnClick={handleTelegramClick}
                    />
                  </div>
                </li>
                {/* Follow on FarcasterIcon */}
                <li className={styles.listItem}>
                  <div className={styles.listIcon}>
                    <FarcasterIcon />
                  </div>
                  <ActionDescription action={actions.wallet && actions.farcaster} text={"Follow Ithaca on Farcaster"} />
                  <div className={styles.buttonContainer}>
                    <ActionCompleted action={actions.wallet && actions.farcaster} />
                    <ActionButton
                      action={actions.wallet && actions.farcaster}
                      text={
                        farcasterData?.farcasterFollowClicked
                          ? "Verify (3/3)"
                          : farcasterData?.auth?.username
                            ? "Follow (2/3)"
                            : "Auth (1/3)"
                      }
                      onBtnClick={handleFarcasterClick}
                    />
                  </div>
                </li>
                {/* Referral Code */}
                {actions.wallet && (
                  <li className={`${styles.listItem} ${styles.referralLinkSection}`}>
                    <p>Your referral link to share:</p>
                    <div className={styles.rowContainer}>
                      <Input className={styles.inputReferral} label='' type='text' value={referralLink} />
                      <div>
                        <Button
                          variant='secondary'
                          title=''
                          onClick={() => {
                            navigator.clipboard.writeText(referralLink);
                            showToast(
                              {
                                id: new Date().getTime(),
                                title: "Copied",
                                message: referralLink,
                                type: "success",
                              },
                              "bottom-right"
                            );
                          }}
                        >
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </Panel>
          </div>
        </Container>
      </Main>

      <FarcasterModal
        isOpen={showQR && !!farcasterData?.url}
        onCloseModal={() => setShowQR(false)}
        url={farcasterData?.url}
      />
      <Toast toastList={toastList} position='bottom-right' autoDelete={true} />
    </>
  );
};

export default Referral;
