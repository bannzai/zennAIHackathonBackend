FROM node:lts-slim

WORKDIR /usr/src/app

ENV PORT 8080

COPY package*.json ./

RUN npm install --only=production

COPY . ./

RUN npm run build
CMD [ "npm", "start" ]
