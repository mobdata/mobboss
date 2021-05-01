/*
  server side authentication
*/
import passport from 'passport' // authentication middleware
import { Strategy as LocalStrategy } from 'passport-local' // username and passport strategy
import { Strategy as ClientCertStrategy } from 'passport-client-cert' // client certification stragegy
import { Strategy as TrustedHeaderStrategy } from 'passport-trusted-header' // trusted header strategy
import Nano from 'nano'

import couchSettings from '../couchdb/config'

const { couchUrl } = couchSettings

const configurePassport = (app) => {
  // Create the local strategy
  passport.use(new LocalStrategy(
    (username, password, done) => {
      const conn = Nano(couchUrl)
      conn.auth(username, password, (err, body, headers) => {
        if (err) { return done(null, false, err) }

        let auth

        if (headers && headers['set-cookie']) { auth = headers['set-cookie'] }

        // Pass back the user name
        auth.push({ username })

        return done(null, auth)
      })
    },
  ))

  // Create the client-cert strategy
  passport.use(new ClientCertStrategy(
    (clientCert, done) => {
      // TODO: Change this in production; should check against some kind of data
      // const cn = clientCert.subject.CN
      const user = { name: 'admin' }

      return done(null, user)
    },
  ))

  // Trusted header options
  const options = {
    headers: [
      'verified',
      'dn',
    ],
  }

  // Create the trusted header strategy
  passport.use(new TrustedHeaderStrategy(options,
    (requestHeaders, done) => {
      let user = null
      const userDn = requestHeaders.dn

      // Split the DN string
      user = userDn.split('/').reduce((acc, val) => {
        const kv = val.split('=')
        return Object.assign(acc, { [kv[0]]: kv[1] })
      })

      /* TODO: Implement a database to check the CN creds against
       * if (user.CN === 'admin') {
       *    // Authenticate here
       * }
       */

      done(null, user)
    }))

  // Intialize Passport
  return app.use(passport.initialize())
}

export default configurePassport
