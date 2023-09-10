FROM node:14 AS build

ARG NPM_TOKEN

# Workdir for some reason
# Everybody seems to do this :D
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
# Installing dependencies

COPY .npmrc /usr/src/app/.npmrc
COPY package.json /usr/src/app/package.json

RUN npm install
RUN rm -f /usr/src/app/.npmrc

# Copying source files
COPY . /usr/src/app
# Building app
RUN npm run generate

# Nginx to serve generated static website
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80   2
