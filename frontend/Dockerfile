FROM node:20

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./package-lock.json .
RUN npm install
RUN npm exec update-browserslist-db@latest

EXPOSE 3000

CMD ["npm", "start"]
