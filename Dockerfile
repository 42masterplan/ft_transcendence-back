FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package.json ./

RUN npm install

COPY . .
# install packages
RUN npm install
RUN npm install -g @nestjs/cli
# build
RUN nest build

RUN chmod +x entry.sh

CMD ["./entry.sh"]
