# --- Base build stage ---
FROM node:20-alpine AS base

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ mã nguồn và build
COPY . .
RUN npm run build

# --- Nginx production stage ---
FROM nginx:alpine AS production

# Copy bản build từ stage base vào thư mục Nginx
COPY --from=base /app/dist /usr/share/nginx/html

# Copy cấu hình Nginx nếu có
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
