FROM node:14-alpine

COPY package*.json ./
RUN npm install

RUN apk update && apk add ffmpeg

COPY . .

CMD [ "node", "index.js" ]
