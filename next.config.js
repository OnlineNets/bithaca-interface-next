// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs");

/**
 * Get the build id from the environment variable or git hash
 * @returns {string | "unknown"}
 */
const getBuildId = () => {
  try {
    const buildId = process.env.NEXT_PUBLIC_BUILD_ID;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return buildId || require("child_process").execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.error("Error getting build id", error);
    return "unknown";
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    fontLoaders: [{ loader: "@next/font/google", options: { subsets: ["latin"] } }],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  generateBuildId: getBuildId,
  env: {
    NEXT_PUBLIC_BUILD_ID: getBuildId(),
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "src/UI/stylesheets")],
    additionalData: `
      @import "_mixins.scss";
			@import "_variables.scss";
    `,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/trading/dynamic-option-strategies",
        permanent: true,
      },
      {
        source: "/trading",
        destination: "/trading/dynamic-option-strategies",
        permanent: true,
      },
      {
        source: "/badges",
        destination: "/points/profile",
        permanent: true,
      },
      {
        source: "/my-points",
        destination: "/points/history",
        permanent: true,
      },
      {
        source: "/points-program",
        destination: "/points/season-one",
        permanent: true,
      },
      {
        source: "/prices",
        destination: "/pricing",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "abs.twimg.com",
        pathname: "**",
      },
    ],
  },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "ithacanoemon-tech",
    project: "ithaca-interface",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers. (increases server load)
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
