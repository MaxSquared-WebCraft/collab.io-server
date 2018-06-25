FROM node:10

WORKDIR /user/src/app

COPY package.json ./

RUN yarn

COPY . .

EXPOSE 8080
CMD ["yarn", "start"]