# Temel imaj
FROM node:20-alpine

# Gerekli bağımlılıkları kurun
RUN apk add --no-cache bash curl

# Dockerize'yi indirin ve kurun
RUN curl -sSL https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz | tar -xzv -C /usr/local/bin

# Çalışma dizini oluştur
WORKDIR /app

# package.json ve package-lock.json'ı kopyala
COPY package*.json ./

# Gerekli paketleri yükle
RUN npm install

# Tüm projeyi konteynere kopyala
COPY . .

# Uygulamayı derle
RUN npm run build

# 3000 portunu dışa aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["node", "dist/main"]
