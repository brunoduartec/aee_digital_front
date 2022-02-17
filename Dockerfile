FROM node:17.4-alpine

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

EXPOSE 4200

CMD ["npm", "start"]