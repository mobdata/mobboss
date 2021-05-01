import Nano from 'nano'
import passport from 'passport'
import { promisify } from 'bluebird'

import couchSettings from '../../lib/couchdb/config'

const { couchUrl } = couchSettings
const { url, requestDefaults } = couchUrl

export function headerAuthenticate(req, res, next) {
  passport.authenticate('trusted-header', { session: false },
    (err, user) => {
      if (err) { return res.status(500).json(err) }

      // Bad client cert or request is not from the trusted proxy
      if (!user || req.ips.length === 0) {
        return res.status(401).send('Unauthorized')
      }

      // Set the user object
      req.user = user
      return next()
    })(req, res, next)
}

export async function authenticated(req, res, next) {
  const auth = req.cookies.AuthSession

  // If no Auth token is found, simply return 401 status to client
  if (!auth) {
    return res.status(401).send({ authenticated: false })
  }

  const conn = Nano({ url, requestDefaults, cookie: `AuthSession=${auth}` })

  const getSession = promisify(conn.session, { context: conn })

  try {
    const session = await getSession()

    if (!session.info.authenticated) {
      return res.status(401).send({ authenticated: false })
    }

    return next()
  } catch (err) {
    return res.status(500).json(err.message)
  }
}

export function authenticate(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)

    if (user) {
      // Get the cookie string from the array
      const cookie = user.shift()
      const { username } = user.shift()

      // Construct the response header
      const header = {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json',
      }

      const userObj = {
        token: cookie.split(';').shift(),
        username,
      }

      // Write the header to set the cookie in the browser
      res.writeHead(200, header)
      return res.end(JSON.stringify(userObj))
    }

    const { statusCode, error, reason } = info

    if (error === 'unauthorized') {
      return res.status(401).json({ statusCode, error, reason })
    }

    const { errno } = info

    if (errno === 'ECONNREFUSED') {
      return res.status(500).json({
        statusCode: 500,
        reason: 'Cannot connect to CouchDB.',
      })
    }

    return res.status(400).json(info)
  })(req, res, next)
}

export function logout(req, res) {
  const auth = req.cookies.AuthSession

  if (!auth) { return res.status(400).end() }

  // Invalidate the cookie
  const date = new Date(0)
  const cookie = `AuthSession=${auth}; Version=1; Secure; Path=/; HttpOnly; expires=${date.toUTCString()}`

  const header = {
    'Set-Cookie': cookie,
    'Content-Type': 'application/json',
  }

  const response = { ok: true }

  res.writeHead(200, header)
  return res.end(JSON.stringify(response))
}
