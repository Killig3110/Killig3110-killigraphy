# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Cài deps trước
COPY package*.json ./
RUN npm ci

# Copy source và build
COPY . .
RUN npm run build

# Nginx stage
FROM nginx:alpine AS production
COPY --from=base /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
