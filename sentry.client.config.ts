// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { DSN, ignoreErrors, targetUrls } from "./sentry.shared.config";

Sentry.init({
  dsn: DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Part of instrumentation for performance monitoring
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  tracePropagationTargets: targetUrls,

  // Part of Replay Session integration
  // Display 100% of the replays containing errors
  replaysOnErrorSampleRate: 1.0,
  // This sets the sample rate to be 100% to production.
  // You may want this to be 100% while in development and sample at a lower rate in production
  replaysSessionSampleRate: 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here.
      networkDetailAllowUrls: targetUrls,
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: false,
    }),
    Sentry.httpClientIntegration(),
    Sentry.extraErrorDataIntegration(),
    Sentry.browserTracingIntegration({ enableLongTask: true, enableInp: true }),
  ],

  // Part of HttpClient integration
  // This option is required for capturing headers and cookies.
  sendDefaultPii: true,

  ignoreErrors: ignoreErrors,
});
