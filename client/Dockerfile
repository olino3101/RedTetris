# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY . .
RUN npm run build

# Production stage - simple approach to populate the volume
FROM node:20-alpine
WORKDIR /app

# Copy the built files
COPY --from=builder /app/dist ./dist

# Simple script to ensure files are available and exit successfully
CMD ["sh", "-c", "echo 'Client build completed. Files available in /app/dist'; ls -la /app/dist/; sleep 1"]
