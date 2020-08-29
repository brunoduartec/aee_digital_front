FROM node:10

WORKDIR /usr/app/app-ui

COPY package*.json /usr/app/app-ui/

RUN npm install -g @angular/cli @angular-devkit/build-angular && npm install

COPY . /usr/app/app-ui/

EXPOSE 4200

CMD ["npm", "start"]