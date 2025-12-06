# ---- Base image ----
FROM node:22-alpine AS base

# Install dependencies for native modules and signal handling
RUN apk add --no-cache libc6-compat dumb-init bash

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build and dev)
RUN npm ci

# ---- Development stage ----
FROM base AS dev

# Copy source code
COPY . .

# Expose dev port
EXPOSE 3000

# Run dev server with hot reload
CMD ["npm", "run", "dev"]

# ---- Build stage ----
FROM base AS builder

# Copy source code
COPY . .

# Set dummy env vars for build (real ones injected at runtime)
ENV RESEND_API_KEY=re_dummy_key_for_build
ENV NEXTAUTH_SECRET=dummy_secret_for_build
ENV NEXTAUTH_URL=http://localhost:3000

# Build Next.js app
RUN npm run build

# ---- Production stage ----
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --gid 1001 --system nextjs && adduser --system --uid 1001 --ingroup nextjs nextjs

WORKDIR /app

# Copy production build from builder
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/package*.json ./

# Switch to non-root user
USER nextjs

# Expose production port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start standalone server with dumb-init
CMD ["dumb-init", "node", "server.js"]