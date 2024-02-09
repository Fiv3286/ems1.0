FROM ubuntu:22.04

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y software-properties-common ca-certificates &&\
    update-ca-certificates

RUN apt install -y nodejs npm

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./package-lock.json .
RUN npm install
RUN npm exec update-browserslist-db@latest

EXPOSE 3000

CMD ["npm", "start"]
