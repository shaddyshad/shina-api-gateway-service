FROM node:8.16.1
EXPOSE 0
ARG NPM_TOKEN
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
RUN npm install pino-elasticsearch -g
RUN npm install --production
RUN rm -f .npmrc
CMD ["npm", "start"]