FROM node:lts-alpine3.14

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn run build

RUN node dist/deploy-commands.js

CMD ["node", "dist/"]
