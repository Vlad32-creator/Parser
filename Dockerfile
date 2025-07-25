# Используем официальный Node.js LTS образ
FROM node:18-slim

# Устанавливаем зависимости для запуска Chromium
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Создаём рабочую папку
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем npm зависимости
RUN npm install
# Скачиваем браузеры Playwright во время сборки
# RUN npx playwright install chromium

# Копируем весь проект в контейнер
COPY . .

# Указываем порт (если нужно)
EXPOSE 5000

# Запускаем твой скрипт (замени на свой основной файл)
CMD ["node", "parser.js"]
