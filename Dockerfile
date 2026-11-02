# Base Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci --ignore-scripts

# Copy application source code
COPY . .

# Build frontend production bundle
RUN npm run build

# Expose port (default 3000)
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Start collaborative backend server
CMD ["npm", "start"]
