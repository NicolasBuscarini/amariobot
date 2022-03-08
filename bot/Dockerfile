FROM node:lts-alpine3.14

# Instalar python/pip
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

# Instalar ferramentas de build
RUN apk update
RUN apk add build-base curl gcc abuild binutils binutils-doc gcc-doc linux-headers ffmpeg

# Selecionar diretório do app
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN yarn install --silent

# Copiar app e buildar
COPY . .
RUN yarn run build

# Deploy de comandos pro discord
RUN node dist/deploy-commands.js

# Rodar programa
CMD ["node", "dist/"]
