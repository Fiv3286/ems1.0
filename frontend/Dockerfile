FROM node:20

WORKDIR /usr/src

COPY ./package.json .
COPY ./package-lock.json .

RUN npm install
RUN npx browserslist@latest --update-db

EXPOSE 3000

CMD ["npm", "start"]
