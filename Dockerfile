FROM node:8

WORKDIR /usr/src/app

COPY ./configurations ./configurations
COPY ./contracts ./contracts
COPY ./node ./node
COPY ./page ./page
COPY ./package.json ./

RUN npm i

EXPOSE 3000
EXPOSE 46656
EXPOSE 46657
EXPOSE 46658

CMD ["node", "./node/app.js", "-n", "single", "-r", "3000"]
