ARG BUILDPLATFORM=linux/amd64
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

ARG TARGETPLATFORM
ARG NPM_REGISTRY_CONFIGURATION

ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=999999
ARG NEXT_PUBLIC_BACKEND_URL=
ARG NEXT_PUBLIC_WS_URL=
ARG NEXT_PUBLIC_IS_LOCATION_RESTRICTED=
ARG NEXT_PUBLIC_BUILD_ID=
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS=
ARG NEXT_PUBLIC_MIXPANEL_TOKEN=
ARG NEXT_PUBLIC_LIVE_COIN_WATCH_API_KEY=

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY patches ./patches
RUN echo ${NPM_REGISTRY_CONFIGURATION} | base64 -d > ~/.npmrc && yarn install --ignore-scripts
RUN yarn patch

COPY . .
RUN yarn build

FROM node:20-alpine

WORKDIR /app

ARG APP_PORT=3000

COPY package.json .
COPY yarn.lock .

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/sentry.client.config.ts ./
COPY --from=builder /app/sentry.edge.config.ts ./
COPY --from=builder /app/sentry.server.config.ts ./
COPY --from=builder /app/sentry.shared.config.ts ./
COPY ./src /app/src
COPY ./public /app/public

RUN chown -R nobody:nogroup /app


USER nobody
EXPOSE $APP_PORT

CMD ["yarn", "start"]
