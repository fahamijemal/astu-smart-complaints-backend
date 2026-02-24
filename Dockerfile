FROM node:20-slim AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package info
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm run build

# Runner stage
FROM node:20-slim AS runner

# Configure pnpm
RUN npm install -g pnpm

WORKDIR /app
ENV NODE_ENV=production

# Copy package info
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built app
COPY --from=builder /app/dist ./dist

# Create necessary folders and change ownership
RUN mkdir -p uploads logs && \
    groupadd -r appgroup && useradd -r -g appgroup appuser && \
    chown -R appuser:appgroup /app

USER appuser
EXPOSE 5000
CMD ["node", "dist/server.js"]
