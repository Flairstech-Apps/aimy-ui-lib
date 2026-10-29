# AiMY UI on Coolify: builds the docs, registry and npm store, then serves
# them with server/index.mjs. Open to anyone while server/access.json says
# public; otherwise behind the library token (see COOLIFY.md).

FROM node:24-slim AS build
WORKDIR /app
RUN npm install -g pnpm@9.15.0
COPY package.json pnpm-lock.yaml ./
COPY package/tokens ./package/tokens
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build /app/out ./out
COPY server ./server
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "server/index.mjs"]
