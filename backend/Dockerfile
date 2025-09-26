FROM node:20

WORKDIR /usr/src/app

# Copia solo package.json para instalar dependencias
COPY package*.json ./

RUN npm install

# No copiamos el resto del código -> lo monta docker-compose con volumes

EXPOSE 4000

CMD ["npm", "run", "dev"]
