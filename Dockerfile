# FROM zenato/puppeteer
FROM ghcr.io/puppeteer/puppeteer:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
# RUN npm ci --only=production
COPY . .
CMD ["node","parser.js"]