# Set the base image to Node version 6.11.2
FROM node:6.11.2

# File Author / Maintainer
MAINTAINER Daniel Kelly

RUN mkdir -p /var/lib/mobboss-client
WORKDIR /var/lib/mobboss-client

COPY package.json /var/lib/mobboss-client
RUN npm install
COPY . /var/lib/mobboss-client

ENV NODE_ENV development
ENV HTTPS true

EXPOSE 31337
CMD ["npm", "start"]
