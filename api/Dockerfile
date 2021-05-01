# Set the base image to Node version 6.11.2
FROM node:6.11.2

# File Author / Maintainer
MAINTAINER Daniel Kelly

# Copy the SSL certificate contents
RUN mkdir -p /etc/pki/tls
COPY ./tls /etc/pki/tls

RUN mkdir -p /var/lib/mobboss-api
WORKDIR /var/lib/mobboss-api

COPY package.json /var/lib/mobboss-api
RUN npm install
COPY . /var/lib/mobboss-api

ENV NODE_ENV development

EXPOSE 31337
CMD ["npm", "run", "dev"]
