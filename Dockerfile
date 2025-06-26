# Stage 1: Build the application
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Create the production image
FROM node:20-slim AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
# Expose the port the app runs on
ENV PORT=3000

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
# Copy the public and static folders
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# The server is started from server.js in the standalone output
CMD ["node", "server.js"]
