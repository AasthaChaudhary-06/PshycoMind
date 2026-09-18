# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install OS deps required by native modules (pdfjs-dist, etc.)
RUN apk add --no-cache python3 make g++

# Copy workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci

COPY server/ server/
RUN npm run build -w server

# ---------- Runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json
COPY --from=build /app/server/package.json /app/server/package.json
COPY --from=build /app/server/dist /app/server/dist

# Production deps only (server workspace)
RUN npm ci --omit=dev --workspace server

WORKDIR /app/server
EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5001/health >/dev/null 2>&1 || exit 1

CMD ["node", "dist/server.js"]
