import { readFileSync } from 'fs'

export const key = readFileSync(process.env.SSL_KEY_PATH)
export const cert = readFileSync(process.env.SSL_CERT_PATH)
export const ca = readFileSync(process.env.SSL_CA_PATH)

const ssl = {
  key,
  ca,
  cert,
  rejectUnauthorized: process.env.TLS_REJECT_UNAUTHORIZED.toUpperCase() === 'TRUE',
}

// Allow for self-signed certificate in development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.TLS_REJECT_UNAUTHORIZED.toUpperCase() === 'TRUE'
  ? '1'
  : '0'

export default ssl
