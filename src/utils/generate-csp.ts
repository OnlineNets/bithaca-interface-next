import { Directive, Value } from "./types";

const generateCSP = ({ nonce }: { nonce: string }) => {
  const policy: Partial<Record<Directive, Value[]>> = {};

  const add = (directive: Directive, value: Value) => {
    // Disable CSP in development
    if (process.env.NODE_ENV === "development") return;
    const curr = policy[directive];
    policy[directive] = curr ? [...curr, value] : [value];
  };

  add("script-src", `'self' 'nonce-${nonce}' *.mixpanel.com`);
  add("style-src", `'self' 'unsafe-inline' *.mixpanel.com`);
  add("worker-src", `'self' 'nonce-${nonce}' blob: *.walletconnect.org *.walletconnect.com *.mixpanel.com`);
  add("child-src", `'self' 'nonce-${nonce}' blob: *.walletconnect.org *.walletconnect.com *.mixpanel.com`);
  add("frame-src", `'self' 'nonce-${nonce}' blob: *.walletconnect.org *.walletconnect.com`);

  return Object.entries(policy)
    .map(([key, value]) => `${key} ${value.join(" ")}`)
    .join("; ");
};

export default generateCSP;
