FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .

RUN npm i
RUN npm run build

CMD ["npm", "run", "start:prod"]