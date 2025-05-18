# Use the official Node.js image
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy dependencies and install them
COPY package.json package-lock.json ./
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Use Nginx to serve static files
FROM nginx:alpine

# Copy built frontend files
COPY --from=build /app/dist /usr/share/nginx/html

# Expose frontend port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
