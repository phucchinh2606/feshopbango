# GIAI ĐOẠN 1: Build mã nguồn
FROM node:20-alpine AS build_stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# GIAI ĐOẠN 2: Chạy với serve
FROM node:20-alpine
WORKDIR /app
# Copy thư mục đã build từ giai đoạn 1 sang (Vite dùng 'dist')
COPY --from=build_stage /app/dist /app
# Cài đặt serve để chạy file tĩnh
RUN npm install -g serve
EXPOSE 80
# Chạy lệnh serve, tham số -s để hỗ trợ Single Page Application (tránh lỗi 404 khi F5)
CMD ["serve", "-s", ".", "-l", "80"]