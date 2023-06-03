FROM node:16-alpine
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --production
COPY . .

# Укажите аргументы для передачи переменных окружения при сборке образа
ARG TELEGRAM_TOKEN
ARG OPENAI_KEY

# Передайте значения переменных окружения внутри образа
ENV TELEGRAM_TOKEN=$TELEGRAM_TOKEN
ENV OPENAI_KEY=$OPENAI_KEY

ENV NODE_ENV=production
ENV PORT=3000

# Соберите TypeScript
RUN yarn build
EXPOSE $PORT
CMD ["node", "build/main"]