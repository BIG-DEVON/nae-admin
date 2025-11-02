# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install deps first (better cache)
COPY package*.json ./
# Use npm ci when lockfile exists; otherwise fallback to npm install
RUN npm ci --include=dev || npm install

# Copy the rest
COPY . .

# Allow override of API base at build time if ever needed (optional)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the app (reads .env.production at build time)
RUN npm run build


# ---------- Run stage (no nginx; simple static server) ----------
FROM node:22-alpine AS runtime
WORKDIR /app

# Minimal static server
RUN npm i -g serve@14.2.3 

# Copy build output
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production

# Default to 5173 (Coolify can override by setting PORT)
ENV PORT=5173
EXPOSE 5173

# Healthcheck honors $PORT
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD sh -c "wget -qO- http://127.0.0.1:${PORT:-5173}/ >/dev/null 2>&1 || exit 1"

# Serve the built SPA; bind to 0.0.0.0 and honor $PORT
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-5173}"]
