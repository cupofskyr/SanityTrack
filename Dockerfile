# 1. Install dependencies
FROM node:20-slim AS deps
WORKDIR /app

# Copy package.json and lockfile
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# 2. Build the app
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
RUN npm run build

# 3. Final production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone output from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

# Run the Next.js server
CMD ["node", "server.js"]
