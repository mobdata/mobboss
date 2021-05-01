import https from 'https' // http protocol over tls/ssl
import { resolve } from 'path' // configures how modules are resolved
import Express from 'express' // provides basic web framework to app, allows it to use routes, middleware, etc
import helmet from 'helmet' // secures express app by setting http headers

// import all config files
import ssl from './ssl/config'
import configureMiddleware from './lib/config'
import configurePassport from './lib/passport/config'
import configureRoutes from './routes/config'

// Initialize the Express server
const app = new Express()

// Only trust headers from the Nginx proxy
// TODO: This is a fix to use Docker in development
// Find a cleaner/more secure way to implement trusted proxies
let trustedProxies

if (process.env.NODE_ENV === 'production') {
  trustedProxies = 'loopback'
} else {
  trustedProxies = ['loopback', 'uniquelocal']
}

app.set('trust proxy', trustedProxies)

// Configure all of the middleware, specific and generic
// Do not configure webpack for server route tests
configureMiddleware(app)
configurePassport(app)
configureRoutes(app)

if (process.env.NODE_ENV === 'production') {
  // Security first. Helmet configures many settings to aid in security
  app.use(helmet())
  // Configure the static files folder
  app.use(Express.static(resolve(__dirname, '..', 'client', 'build')))
  // Deliver the client application on the index route
  app.get('*', (req, res) => {
    // Index file from the client production build
    res.sendFile(resolve(__dirname, '..', 'client', 'build', 'index.html'))
  })
}

const server = https.createServer(ssl, app)

const port = process.env.SERVER_PORT || 31337

server.listen(port, (error) => {
  if (error) { throw error }
  process.stdout.write(`MobBoss Express API server listening on port ${port}\n`)
})

export default server
