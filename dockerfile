# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install deps first (better cache)
COPY package*.json ./
# Use npm ci when lockfile exists; otherwise fallback to npm install
RUN npm ci --include=dev || npm install

# Copy the rest
COPY . .

# Env is read at build-time by Vite. Your .env.production already has:
# VITE_API_BASE_URL=https://server.nasmehalloffame.com.ng
# But we also allow an override via build-arg if you ever need it.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the app
RUN npm run build


# ---------- Run stage (no nginx; simple static server) ----------
FROM node:22-alpine AS runtime
WORKDIR /app

# Minimal static server
RUN npm i -g serve

# Copy build output
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 8080

# Optional healthcheck (tries to hit the root)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1

# Serve the built SPA
CMD ["serve", "-s", "dist", "-l", "8080"]
