# MobBoss

MobBoss is an application for overseeing enterprise set of nodes and their respective CouchDB instances. It includes measurements of replication tasks and server statuses.

### Development
*Note: npm is the only supported build tool due to restrictions in how yarn handles self-signed certs, private repos, and scoped packages.

1. Run `npm install` to install all of the application's dependencies.

2. Run `npm run start` to begin the development server.

### Development with Docker

Docker makes developing for MobBoss much simpler. No need to worry about installing all of the dependencies before developing, just install Docker!

1. `docker-compose build` will build the Node API container and React client container for MobBoss.
    * *Note: You will still need to have either CouchDB and Influx running. These dependencies still need pre-built images so that MobBoss' Dockerfile can pull and build.*
2. `docker-compose up -d` will run the containers in the daemon. `-d` flag is preferred for a clean stop.

3. `docker-compose stop` will stop the running containers.

Unfortunately, create-react-app specifies the proxy server name inside of a `package.json` file. Since the name is static, you will have to manually edit the proxy target anytime you switch between developing with Docker and developing normally. In other words, the target's name should change from api:31337 to localhost:31337 when developing with normal dependencies installed. By default, it is configured for development with Docker.

## Server

MobBoss's API server is built with Node and Express. It interfaces with both the local CouchDB and InfluxDB. CouchDB is used for local user authentication and InfluxDB is used to store data about the remote nodes running CouchDB.

While much of the server's source code exists in `server/`, the server's dependencies and bootstrap file are located at the root of the project.

## Client

MobBoss's front-end client code is written in React and Redux using the create-react-app boilerplate. All of the source code for the client is located in `client/`.
