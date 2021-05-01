/*
  provides app wide middleware
*/
import compression from 'compression' // allows for file compression
import bodyParser from 'body-parser' // parses incoming requestsbefore rest of app
import cookieParser from 'cookie-parser' // parse http request cookies
import morgan from 'morgan' // logs requests
import Promise from 'bluebird' // implements promises

const configureMiddleware = (app) => {
  global.Promise = Promise
  if (process.env.NODE_ENV !== 'test') app.use(morgan('[:date[clf]] HTTP/:http-version :method ":url" :status - :response-time ms'))
  app.use(bodyParser.json())
  app.use(cookieParser())
  app.use(compression())
}

export default configureMiddleware
