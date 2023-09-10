FROM node:14-alpine

COPY package*.json ./

RUN npm install

COPY . .

RUN npm build

CMD [ "node", "dist/index.js" ]
