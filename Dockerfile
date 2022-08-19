FROM node:18-alpine3.15

WORKDIR /app

COPY . /app

RUN npm install

RUN npm run build

ENV APP_PORT 3000

EXPOSE 3000

CMD npm run start:prod