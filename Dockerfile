FROM --platform=linux/amd64 node:20-alpine AS base

FROM base as deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY prisma/ /app/prisma/
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --legacy-peer-deps

FROM base as builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

ARG AUTH_SECRET
ARG AUTH_DISCORD_ID
ARG AUTH_DISCORD_SECRET
ARG AUTH_GOOGLE_ID
ARG AUTH_GOOGLE_SECRET
ARG AWS_ENDPOINT
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AUTH_TRUST_HOST
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENT_VAR


RUN npm run build

FROM base as runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ARG PORT

EXPOSE ${PORT}

ARG HOSTNAME

CMD ["node", "server.js"]
