FROM node:24-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:24-slim AS final

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

COPY --from=builder ./app/dist ./dist

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

EXPOSE 7777

ENTRYPOINT ["node", "dist/main.js"]

CMD [ "serve", "--address", "[::]:7777", "--log-format", "json", "--log-level", "info" ]
