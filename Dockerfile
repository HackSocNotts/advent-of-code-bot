FROM node:carbon-alpine
WORKDIR /usr/app/src
ADD . .
RUN npm ci
CMD [ "node", "index.js" ]
