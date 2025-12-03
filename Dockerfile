# Stage 1: Build stage
FROM node:iron-trixie-slim

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port your application listens on
EXPOSE 3000

CMD ["npm", "start"]