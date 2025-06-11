# 1. Stage: Build and test
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and install deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Run tests
RUN npm run test

# Build app
RUN npm run build

# 2. Stage: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
