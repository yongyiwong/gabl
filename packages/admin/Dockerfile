FROM node:14-alpine

ARG NODE_ENV
ARG API_URL
ARG WEB_URL
ARG CDN_URL
ARG MEDIASERVICE_URL
ARG STATIC_URL
ARG STORAGE_URL
ARG UPLOADS_CONTAINER
ARG STATIC_CONTAINER

# Installing dependencies
COPY package*.json ./
RUN npm i -g npm@8.6.0
RUN npm install

# Copying source files
COPY . .

# Building app
RUN rm .env && npm run build

# Running the app
CMD "./run.sh"
