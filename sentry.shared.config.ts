export const DSN = "https://6b360455dc4083e93578c041aed047f4@o4506619036172288.ingest.us.sentry.io/4506897504862208";

export const targetUrls = [
  "localhost",
  /^https:\/\/.*ithacanoemon\.tech\/?(api?.*)?$/gm,
  /^https:\/\/.*ithacaprotocol\.io\/?(api?.*)?$/gm,
];

export const ignoreErrors: Array<string | RegExp> = [
  "Authentication required! Failed to authenticate with the server",
  "<unlabeled event>",
  "Not Found! Requested resource does not exist",
  "Resource: https://app.ithacaprotocol.io/api/v1/clientapi/spotPrices is not available.",
  "Resource: https://app.ithacaprotocol.io/api/v1/clientapi/nextAuction is not available.",
  "Resource: https://app.ithacaprotocol.io/api/v1/clientapi/spotPrices is not available.",
  "Resource: https://app.ithacaprotocol.io/api/v1/clientapi/nextAuction is not available.",
  "Resource: https://app.ithacaprotocol.io/api/v1/clientapi/spotPrices is not available.",
  "Resource: https://app.ithacaprotocol.io/api/v1/clientapi/nextAuction is not available.",
  "Resource: https://app.ithacaprotocol.io/api/v1/clientapi/spotPrices is not available.",
  "Resource: https://app.ithacaprotocol.io/api/v1/clientapi/nextAuction is not available.",
];
