# syntax=docker/dockerfile:1
FROM node:22-alpine

WORKDIR /app

# Install dependencies using your lockfile
COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./
RUN corepack enable && \
    if [ -f pnpm-lock.yaml ]; then pnpm install; \
    elif [ -f yarn.lock ]; then yarn install; \
    else npm ci; fi

# Build the app
COPY . .
RUN if [ -f pnpm-lock.yaml ]; then pnpm build; \
    elif [ -f yarn.lock ]; then yarn build; \
    else npm run build; fi

# Expose Vite preview port
EXPOSE 4173

# Serve the built app
CMD sh -c '\
  if [ -f pnpm-lock.yaml ]; then pnpm run preview -- --host 0.0.0.0 --port 4173; \
  elif [ -f yarn.lock ]; then yarn preview --host 0.0.0.0 --port 4173; \
  else npm run preview -- --host 0.0.0.0 --port 4173; \
'
