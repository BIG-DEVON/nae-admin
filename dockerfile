# Use a small Node image
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci

# Copy the rest of your source code
COPY . .

# Build the Vite project
RUN npm run build

# Expose Vite preview default port
EXPOSE 5173

# Start the preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
