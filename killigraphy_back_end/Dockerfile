FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Cài nodemon global (cho chắc nếu dùng docker run thủ công)
RUN npm install -g nodemon

EXPOSE 5000

CMD ["npm", "run", "dev"]
