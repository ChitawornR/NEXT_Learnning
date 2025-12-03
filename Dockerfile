# Stage 1: Build stage
FROM node:iron-trixie-slim AS builder

WORKDIR /app

# Copy package.json and lock files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build



# Stage 2: Production stage
FROM node:iron-trixie-slim

WORKDIR /app

# Copy only necessary build artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
