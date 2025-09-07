# ---------- Stage 1: Build React app ----------
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build (ignore TypeScript errors)
COPY . .
RUN npm run build -- --ignore-build-errors

# ---------- Stage 2: Serve with nginx ----------
FROM nginx:alpine

# Copy built React app to nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default nginx config with ours
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
