/*
  config settings for handling couch requests
*/
import crypto from 'crypto' // crypto standards
import { key, ca, cert } from '../../ssl/config' // local ssl certs

const couchUser = process.env.COUCH_USER

const authToken = crypto
  .createHmac('sha1', process.env.COUCH_AUTH_SECRET)
  .update(process.env.COUCH_USER)
  .digest('hex')

const couchHeaders = {
  'Content-Type': 'application/json',
  'X-Auth-CouchDB-Roles': '_admin',
  'X-Auth-CouchDB-UserName': couchUser,
  'X-Auth-CouchDB-Token': authToken,
}

const couchSettings = {
  couchUrl: {
    url: process.env.COUCH_URL,
    requestDefaults: {
      key,
      ca,
      cert,
      rejectUnauthorized: process.env.TLS_REJECT_UNAUTHORIZED.toUpperCase() === 'TRUE',
      auth: {
        user: process.env.COUCH_USER,
        pass: process.env.COUCH_PASS,
      },
    },
  },
  authToken,
  user: process.env.COUCH_USER,
}
export default couchSettings
export { couchHeaders }
