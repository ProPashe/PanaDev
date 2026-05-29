FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Build the Vite client and compile the server to CJS
RUN npm run build

# Expose the port used by the Express server (default 3000)
EXPOSE 3000

# Start the server
CMD ["node", "dist/server.cjs"]
