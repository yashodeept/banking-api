# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY .env ./

# Production Stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy production files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]
