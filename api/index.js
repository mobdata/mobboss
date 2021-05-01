const { underline, yellow, red } = require('chalk')

console.log(underline('Welcome to MobBoss!'))
console.log(yellow('Starting the Express API server...'))

try {
  require('dotenv-safe').load()
} catch (e) {
  // eslint-disable-next-line no-console
  console.error(red('\nDotenv failed to load. Please be sure to set the proper environment variables. Check out .env.example to see which variables are necessary.\n'))
  process.exit(1)
}

if (process.env.NODE_ENV !== 'production') {
  // Enable babel to compile per require() method
  require('@babel/register')
  require('@babel/polyfill')
  // Initialize the server
  require('./server')
} else {
  // Require the server file built by Webpack in production mode
  require('./dist/server.bundle.js')
}
