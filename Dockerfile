# Stage 1: Build the application
FROM node:20-slim AS base

# Install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# ---

# Stage 2: Production image
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy the standalone Next.js server output
COPY --from=base /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static

# The standalone output includes its own node_modules, so we don't need to run npm install again.
# A non-root user is used for better security.
USER nextjs

EXPOSE 3000

# Start the Next.js server
CMD ["node", "server.js"]
