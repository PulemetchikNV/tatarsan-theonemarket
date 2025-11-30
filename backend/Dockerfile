FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install -g pnpm
# Install dependencies
RUN pnpm i -d

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start server with tsx (no build needed)
CMD ["npx", "tsx", "watch", "src/index.ts"]

