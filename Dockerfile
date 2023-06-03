FROM node:16-alpine
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --production
COPY . .
# Соберите TypeScript
RUN yarn build
# Установите переменную среды NODE_ENV в production
ENV NODE_ENV=production

ENV PORT=3000
EXPOSE $PORT
CMD ["node", "build/main"]