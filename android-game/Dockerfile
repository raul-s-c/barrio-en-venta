FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
ENV NODE_ENV=production PORT=8788 HOST=0.0.0.0 DB_PATH=/app/data/barrio.sqlite
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 8788
CMD ["node","--import","tsx","server/index.ts"]
