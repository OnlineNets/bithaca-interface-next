import mixpanel, { Mixpanel } from "mixpanel-browser";

class MixPanel {
  private readonly mixPanel: Mixpanel;

  constructor() {
    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "";
    if (!token) throw new Error("Mixpanel token is required.");

    this.mixPanel = mixpanel.init(
      token,
      {
        persistence: "localStorage",
      },
      "main"
    );
  }

  public track(name: string, data?: object) {
    const session = localStorage.getItem("ithaca.session");

    if (!session) return;

    const { ethAddress } = JSON.parse(session);

    this.mixPanel.identify(ethAddress);
    this.mixPanel.track(name, {
      ...data,
      walletAddress: ethAddress,
    });
  }
}

const mixPanel = new MixPanel();
export default mixPanel;
