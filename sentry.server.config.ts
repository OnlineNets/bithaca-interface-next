// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { DSN, ignoreErrors, targetUrls } from "./sentry.shared.config";

Sentry.init({
  dsn: DSN,
  environment: process.env.NODE_ENV,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Part of instrumentation for performance monitoring
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  tracePropagationTargets: targetUrls,

  integrations: [],
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
  ignoreErrors: ignoreErrors,
});
