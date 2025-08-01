FROM mcr.microsoft.com/playwright:v1.54.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "start"]