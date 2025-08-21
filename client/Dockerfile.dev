# Dev-only Dockerfile for Vite
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (use cache)
COPY package*.json ./
# Prefer npm ci if lockfile exists
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Expose Vite dev server port
EXPOSE 5173

ENV NODE_ENV=development

# Default command runs Vite in dev mode, accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
